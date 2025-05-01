import { Firestore, Query, CollectionReference, Timestamp } from 'firebase-admin/firestore';
import { AuditEvent, AuditEventType, AuditEventSeverity } from '../types/audit';

export class AuditService {
  private readonly collection: CollectionReference;
  
  constructor(private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('audit_logs');
  }

  async logEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: Timestamp.fromDate(new Date())
    };

    try {
      await this.collection.add(auditEvent);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // 감사 로그 실패는 조용히 처리하되 콘솔에는 기록
    }
  }

  async queryEvents(options: {
    startDate?: Date;
    endDate?: Date;
    eventType?: AuditEventType;
    severity?: AuditEventSeverity;
    userId?: string;
    limit?: number;
  }): Promise<AuditEvent[]> {
    let query: Query = this.collection;

    if (options.startDate) {
      query = query.where('timestamp', '>=', Timestamp.fromDate(options.startDate));
    }
    if (options.endDate) {
      query = query.where('timestamp', '<=', Timestamp.fromDate(options.endDate));
    }
    if (options.eventType) {
      query = query.where('eventType', '==', options.eventType);
    }
    if (options.severity) {
      query = query.where('severity', '==', options.severity);
    }
    if (options.userId) {
      query = query.where('userId', '==', options.userId);
    }

    query = query.orderBy('timestamp', 'desc');
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as AuditEvent);
  }

  async getRecentEvents(limit = 100): Promise<AuditEvent[]> {
    return this.queryEvents({ limit });
  }

  async getEventsByUser(userId: string, limit = 50): Promise<AuditEvent[]> {
    return this.queryEvents({ userId, limit });
  }

  async getSecurityEvents(limit = 50): Promise<AuditEvent[]> {
    return this.queryEvents({
      eventType: AuditEventType.SECURITY_EVENT,
      limit
    });
  }

  async getFailedAuthAttempts(userId: string, since: Date): Promise<AuditEvent[]> {
    return this.queryEvents({
      eventType: AuditEventType.AUTH_FAILURE,
      userId,
      startDate: since
    });
  }
} 