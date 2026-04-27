/**
 * MongoDB Database Backup Utility
 * Provides automated and manual backup functionality
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Backup configuration
const BACKUP_CONFIG = {
  // Directory to store backups
  backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../../backups'),
  // Maximum number of backups to keep
  maxBackups: parseInt(process.env.MAX_BACKUPS) || 7,
  // Compression enabled
  compress: process.env.BACKUP_COMPRESS !== 'false',
  // Collections to backup (empty = all)
  collections: process.env.BACKUP_COLLECTIONS?.split(',').filter(Boolean) || [],
};

/**
 * Parse MongoDB URI to extract connection details
 */
const parseMongoUri = (uri) => {
  try {
    const url = new URL(uri);
    return {
      host: url.hostname,
      port: url.port || '27017',
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1).split('?')[0] || 'shaikhjee',
      isSRV: uri.startsWith('mongodb+srv://'),
      authSource: url.searchParams.get('authSource') || 'admin',
    };
  } catch (error) {
    logger.error('Failed to parse MongoDB URI:', error);
    return null;
  }
};

/**
 * Generate backup filename with timestamp
 */
const generateBackupName = (prefix = 'backup') => {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  return `${prefix}_${timestamp}`;
};

/**
 * Ensure backup directory exists
 */
const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_CONFIG.backupDir)) {
    fs.mkdirSync(BACKUP_CONFIG.backupDir, { recursive: true });
    logger.info(`Created backup directory: ${BACKUP_CONFIG.backupDir}`);
  }
};

/**
 * Clean up old backups, keeping only the most recent ones
 */
const cleanupOldBackups = async () => {
  try {
    const files = fs.readdirSync(BACKUP_CONFIG.backupDir);
    const backups = files
      .filter(f => f.startsWith('backup_'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_CONFIG.backupDir, f),
        time: fs.statSync(path.join(BACKUP_CONFIG.backupDir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // Remove old backups beyond maxBackups
    const toDelete = backups.slice(BACKUP_CONFIG.maxBackups);
    for (const backup of toDelete) {
      if (fs.statSync(backup.path).isDirectory()) {
        fs.rmSync(backup.path, { recursive: true });
      } else {
        fs.unlinkSync(backup.path);
      }
      logger.info(`Deleted old backup: ${backup.name}`);
    }

    return toDelete.length;
  } catch (error) {
    logger.error('Failed to cleanup old backups:', error);
    return 0;
  }
};

/**
 * Create a database backup using mongodump
 */
export const createBackup = async (options = {}) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  const config = parseMongoUri(uri);
  if (!config) {
    throw new Error('Failed to parse MongoDB URI');
  }

  ensureBackupDir();

  const backupName = generateBackupName(options.prefix || 'backup');
  const backupPath = path.join(BACKUP_CONFIG.backupDir, backupName);

  logger.info(`Starting backup: ${backupName}`);

  return new Promise((resolve, reject) => {
    // Build mongodump arguments
    const args = [
      `--uri="${uri}"`,
      `--out=${backupPath}`,
    ];

    // Add gzip compression
    if (BACKUP_CONFIG.compress) {
      args.push('--gzip');
    }

    // Backup specific collections if configured
    if (BACKUP_CONFIG.collections.length > 0) {
      BACKUP_CONFIG.collections.forEach(collection => {
        args.push(`--collection=${collection}`);
      });
    }

    // Add database name if specified
    if (options.database) {
      args.push(`--db=${options.database}`);
    }

    const mongodump = spawn('mongodump', args, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    mongodump.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    mongodump.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    mongodump.on('close', async (code) => {
      if (code === 0) {
        // Get backup size
        const stats = fs.statSync(backupPath);
        const size = getDirectorySize(backupPath);

        // Cleanup old backups
        const deleted = await cleanupOldBackups();

        const result = {
          success: true,
          name: backupName,
          path: backupPath,
          size: formatBytes(size),
          sizeBytes: size,
          timestamp: new Date().toISOString(),
          compressed: BACKUP_CONFIG.compress,
          deletedOldBackups: deleted,
        };

        logger.info(`Backup completed: ${backupName} (${result.size})`);
        resolve(result);
      } else {
        const error = new Error(`mongodump failed with code ${code}: ${stderr}`);
        logger.error('Backup failed:', error);
        reject(error);
      }
    });

    mongodump.on('error', (error) => {
      logger.error('Backup process error:', error);
      reject(error);
    });
  });
};

/**
 * Restore database from a backup
 */
export const restoreBackup = async (backupName, options = {}) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  const backupPath = path.join(BACKUP_CONFIG.backupDir, backupName);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupName}`);
  }

  logger.info(`Starting restore from: ${backupName}`);

  return new Promise((resolve, reject) => {
    const args = [
      `--uri="${uri}"`,
      `--dir=${backupPath}`,
    ];

    // Add gzip if backup is compressed
    if (BACKUP_CONFIG.compress) {
      args.push('--gzip');
    }

    // Drop existing collections before restore
    if (options.drop) {
      args.push('--drop');
    }

    const mongorestore = spawn('mongorestore', args, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    mongorestore.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    mongorestore.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    mongorestore.on('close', (code) => {
      if (code === 0) {
        const result = {
          success: true,
          backupName,
          timestamp: new Date().toISOString(),
          dropped: options.drop || false,
        };

        logger.info(`Restore completed from: ${backupName}`);
        resolve(result);
      } else {
        const error = new Error(`mongorestore failed with code ${code}: ${stderr}`);
        logger.error('Restore failed:', error);
        reject(error);
      }
    });

    mongorestore.on('error', (error) => {
      logger.error('Restore process error:', error);
      reject(error);
    });
  });
};

/**
 * List all available backups
 */
export const listBackups = () => {
  ensureBackupDir();

  const files = fs.readdirSync(BACKUP_CONFIG.backupDir);
  const backups = files
    .filter(f => f.startsWith('backup_'))
    .map(f => {
      const fullPath = path.join(BACKUP_CONFIG.backupDir, f);
      const stats = fs.statSync(fullPath);
      const size = stats.isDirectory() ? getDirectorySize(fullPath) : stats.size;

      return {
        name: f,
        path: fullPath,
        size: formatBytes(size),
        sizeBytes: size,
        created: stats.mtime.toISOString(),
        isDirectory: stats.isDirectory(),
      };
    })
    .sort((a, b) => new Date(b.created) - new Date(a.created));

  return backups;
};

/**
 * Delete a specific backup
 */
export const deleteBackup = (backupName) => {
  const backupPath = path.join(BACKUP_CONFIG.backupDir, backupName);

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupName}`);
  }

  const stats = fs.statSync(backupPath);
  if (stats.isDirectory()) {
    fs.rmSync(backupPath, { recursive: true });
  } else {
    fs.unlinkSync(backupPath);
  }

  logger.info(`Deleted backup: ${backupName}`);
  return { success: true, deleted: backupName };
};

/**
 * Get directory size recursively
 */
const getDirectorySize = (dirPath) => {
  let size = 0;
  const stats = fs.statSync(dirPath);

  if (stats.isDirectory()) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      size += getDirectorySize(path.join(dirPath, file));
    }
  } else {
    size = stats.size;
  }

  return size;
};

/**
 * Format bytes to human-readable string
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Export backup to cloud storage (S3-compatible)
 */
export const exportToCloud = async (backupName, cloudConfig) => {
  // This is a placeholder for cloud storage integration
  // Implement based on your cloud provider (AWS S3, GCS, Azure Blob, etc.)
  logger.warn('Cloud export not implemented yet');
  return { success: false, message: 'Cloud export not implemented' };
};

export default {
  createBackup,
  restoreBackup,
  listBackups,
  deleteBackup,
  exportToCloud,
  cleanupOldBackups,
};
