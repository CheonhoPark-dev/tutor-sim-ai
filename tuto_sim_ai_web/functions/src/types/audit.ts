import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export enum AuditEventType {
  API_REQUEST = 'API_REQUEST',
  AUTH = 'AUTH',
  AUTH_FAILURE = 'AUTH_FAILURE',
  SECURITY_EVENT = 'SECURITY_EVENT',
  DATA_MODIFICATION = 'DATA_MODIFICATION',
  SYSTEM = 'SYSTEM'
}

export enum AuditEventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export type AuditEvent = {
  eventType: AuditEventType;
  severity: AuditEventSeverity;
  userId?: string;
  action: string;
  status: 'success' | 'failure';
  details: Record<string, any>;
  metadata: Record<string, any>;
  timestamp?: Timestamp;
}; 