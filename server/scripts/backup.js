#!/usr/bin/env node

/**
 * Manual Database Backup Script
 * Run with: node scripts/backup.js [command] [options]
 *
 * Commands:
 *   create    Create a new backup
 *   list      List all backups
 *   restore   Restore from a backup
 *   delete    Delete a backup
 *   cleanup   Remove old backups
 *
 * Examples:
 *   node scripts/backup.js create
 *   node scripts/backup.js list
 *   node scripts/backup.js restore backup_2024-01-15_10-30-00
 *   node scripts/backup.js delete backup_2024-01-15_10-30-00
 */

import 'dotenv/config';
import {
  createBackup,
  restoreBackup,
  listBackups,
  deleteBackup,
  cleanupOldBackups,
} from '../utils/backup.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';
const param = args[1];

const printHelp = () => {
  console.log(`
Database Backup Utility
=======================

Usage: node scripts/backup.js <command> [options]

Commands:
  create              Create a new backup
  list                List all available backups
  restore <name>      Restore from a specific backup
  delete <name>       Delete a specific backup
  cleanup             Remove old backups (keeps last 7)
  help                Show this help message

Options:
  --drop              Drop existing collections before restore

Examples:
  node scripts/backup.js create
  node scripts/backup.js list
  node scripts/backup.js restore backup_2024-01-15_10-30-00
  node scripts/backup.js restore backup_2024-01-15_10-30-00 --drop
  node scripts/backup.js delete backup_2024-01-15_10-30-00
  node scripts/backup.js cleanup

Environment Variables:
  MONGO_URI           MongoDB connection string (required)
  BACKUP_DIR          Directory to store backups (default: ./backups)
  MAX_BACKUPS         Maximum backups to keep (default: 7)
  BACKUP_COMPRESS     Enable gzip compression (default: true)
  `);
};

const run = async () => {
  console.log('Database Backup Utility');
  console.log('=======================\n');

  try {
    switch (command) {
      case 'create': {
        console.log('Creating backup...\n');
        const result = await createBackup();
        console.log('Backup created successfully!');
        console.log(`  Name: ${result.name}`);
        console.log(`  Path: ${result.path}`);
        console.log(`  Size: ${result.size}`);
        console.log(`  Compressed: ${result.compressed}`);
        if (result.deletedOldBackups > 0) {
          console.log(`  Cleaned up: ${result.deletedOldBackups} old backup(s)`);
        }
        break;
      }

      case 'list': {
        console.log('Available backups:\n');
        const backups = listBackups();
        if (backups.length === 0) {
          console.log('  No backups found.');
        } else {
          console.log('  Name                              Size        Created');
          console.log('  ' + '-'.repeat(70));
          for (const backup of backups) {
            const name = backup.name.padEnd(32);
            const size = backup.size.padEnd(10);
            const created = new Date(backup.created).toLocaleString();
            console.log(`  ${name}  ${size}  ${created}`);
          }
          console.log(`\n  Total: ${backups.length} backup(s)`);
        }
        break;
      }

      case 'restore': {
        if (!param) {
          console.error('Error: Backup name is required');
          console.log('Usage: node scripts/backup.js restore <backup-name>');
          process.exit(1);
        }

        const drop = args.includes('--drop');
        if (drop) {
          console.log('WARNING: This will drop existing collections!');
          console.log('Press Ctrl+C within 5 seconds to cancel...\n');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        console.log(`Restoring from: ${param}`);
        console.log(`Drop existing: ${drop}\n`);

        const result = await restoreBackup(param, { drop });
        console.log('Restore completed successfully!');
        break;
      }

      case 'delete': {
        if (!param) {
          console.error('Error: Backup name is required');
          console.log('Usage: node scripts/backup.js delete <backup-name>');
          process.exit(1);
        }

        console.log(`Deleting backup: ${param}\n`);
        const result = deleteBackup(param);
        console.log('Backup deleted successfully!');
        break;
      }

      case 'cleanup': {
        console.log('Cleaning up old backups...\n');
        const deleted = await cleanupOldBackups();
        console.log(`Cleaned up ${deleted} old backup(s)`);
        break;
      }

      case 'help':
      default:
        printHelp();
        break;
    }
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
};

run();
