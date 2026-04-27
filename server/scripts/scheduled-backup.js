#!/usr/bin/env node

/**
 * Scheduled Database Backup Service
 * Runs automatic backups on a configurable schedule
 *
 * Run with: node scripts/scheduled-backup.js
 *
 * Environment Variables:
 *   BACKUP_SCHEDULE   Cron expression (default: "0 2 * * *" = 2 AM daily)
 *   BACKUP_ON_START   Create backup on service start (default: false)
 */

import 'dotenv/config';
import { createBackup, listBackups, cleanupOldBackups } from '../utils/backup.js';
import logger from '../utils/logger.js';

// Simple cron parser and scheduler
class CronScheduler {
  constructor(cronExpression, callback) {
    this.cronExpression = cronExpression;
    this.callback = callback;
    this.timer = null;
    this.running = false;
  }

  /**
   * Parse cron expression and get next run time
   * Supports: minute hour day-of-month month day-of-week
   */
  getNextRunTime() {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = this.cronExpression.split(' ');
    const now = new Date();
    const next = new Date(now);

    // Set to the specified time
    next.setSeconds(0);
    next.setMilliseconds(0);

    if (minute !== '*') {
      next.setMinutes(parseInt(minute));
    }
    if (hour !== '*') {
      next.setHours(parseInt(hour));
    }

    // If the time has passed today, move to tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.running) return;
    this.running = true;

    const scheduleNext = () => {
      const nextRun = this.getNextRunTime();
      const delay = nextRun.getTime() - Date.now();

      logger.info(`Next backup scheduled for: ${nextRun.toLocaleString()}`);

      this.timer = setTimeout(async () => {
        try {
          await this.callback();
        } catch (error) {
          logger.error('Scheduled backup failed:', error);
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// Backup configuration
const BACKUP_SCHEDULE = process.env.BACKUP_SCHEDULE || '0 2 * * *'; // 2 AM daily
const BACKUP_ON_START = process.env.BACKUP_ON_START === 'true';

/**
 * Perform backup with notifications
 */
const performBackup = async () => {
  logger.info('Starting scheduled backup...');

  try {
    const result = await createBackup({ prefix: 'scheduled' });

    logger.info('Scheduled backup completed', {
      name: result.name,
      size: result.size,
      path: result.path,
    });

    // Log current backup status
    const backups = listBackups();
    logger.info(`Total backups: ${backups.length}`);

    // Optional: Send notification
    await sendNotification({
      type: 'success',
      message: `Database backup completed: ${result.name} (${result.size})`,
    });

    return result;
  } catch (error) {
    logger.error('Scheduled backup failed:', error);

    // Optional: Send failure notification
    await sendNotification({
      type: 'error',
      message: `Database backup failed: ${error.message}`,
    });

    throw error;
  }
};

/**
 * Send notification (placeholder - implement based on your needs)
 */
const sendNotification = async ({ type, message }) => {
  // Implement notification logic here:
  // - Email notification
  // - Slack webhook
  // - Discord webhook
  // - SMS notification

  if (process.env.BACKUP_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.BACKUP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        }),
      });

      if (!response.ok) {
        logger.warn('Failed to send backup notification webhook');
      }
    } catch (error) {
      logger.warn('Backup notification error:', error.message);
    }
  }
};

/**
 * Main entry point
 */
const main = async () => {
  console.log('='.repeat(50));
  console.log('Scheduled Database Backup Service');
  console.log('='.repeat(50));
  console.log(`Schedule: ${BACKUP_SCHEDULE}`);
  console.log(`Backup on start: ${BACKUP_ON_START}`);
  console.log('='.repeat(50));

  // Perform backup on start if configured
  if (BACKUP_ON_START) {
    logger.info('Performing backup on startup...');
    try {
      await performBackup();
    } catch (error) {
      logger.error('Startup backup failed:', error);
    }
  }

  // Start the scheduler
  const scheduler = new CronScheduler(BACKUP_SCHEDULE, performBackup);
  scheduler.start();

  logger.info('Backup scheduler started');

  // Handle graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down backup scheduler...');
    scheduler.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep the process running
  process.stdin.resume();
};

main().catch((error) => {
  console.error('Failed to start backup service:', error);
  process.exit(1);
});
