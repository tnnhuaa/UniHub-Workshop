/**
 * RabbitMQ Queue and Exchange Definitions
 * Central location for all job types and routing keys
 */

// Exchanges
export const EXCHANGES = {
  EVENTS: 'unihub.events',
} as const;

// Queues
export const QUEUES = {
  NOTIFICATION: 'notification.queue',
  CSV_SYNC: 'csv-sync.queue',
  AI_SUMMARY: 'ai-summary.queue',
  DLQ: 'unihub.dlq', // Dead Letter Queue
} as const;

// Routing Keys / Event Types
export const EVENTS_KEYS = {
  NOTIFICATION_CREATED: 'notification.created',
  CSV_SYNC_REQUESTED: 'csv-sync.requested',
  AI_SUMMARY_REQUESTED: 'ai-summary.requested',
} as const;

// Job Types
export enum JobType {
  SEND_NOTIFICATION = 'send_notification',
  PROCESS_CSV_SYNC = 'process_csv_sync',
  GENERATE_AI_SUMMARY = 'generate_ai_summary',
}
