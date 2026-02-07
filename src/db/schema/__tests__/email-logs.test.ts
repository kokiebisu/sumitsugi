import { describe, it, expect } from 'vitest';
import { emailLogs } from '../email-logs';
import { getTableColumns } from 'drizzle-orm';

describe('emailLogs schema', () => {
  it('should have all required columns', () => {
    const columns = getTableColumns(emailLogs);

    expect(columns.id).toBeDefined();
    expect(columns.propertyId).toBeDefined();
    expect(columns.recipientEmail).toBeDefined();
    expect(columns.emailType).toBeDefined();
    expect(columns.subject).toBeDefined();
    expect(columns.sentAt).toBeDefined();
    expect(columns.status).toBeDefined();
    expect(columns.pdfUrl).toBeDefined();
    expect(columns.metadata).toBeDefined();
  });

  it('should have correct column types', () => {
    const columns = getTableColumns(emailLogs);

    expect(columns.id.dataType).toBe('string');
    expect(columns.propertyId.dataType).toBe('string');
    expect(columns.recipientEmail.dataType).toBe('string');
    expect(columns.emailType.dataType).toBe('string');
    expect(columns.subject.dataType).toBe('string');
    expect(columns.status.dataType).toBe('string');
  });

  it('should require id, propertyId, recipientEmail, emailType, and subject', () => {
    const columns = getTableColumns(emailLogs);

    expect(columns.id.notNull).toBe(true);
    expect(columns.propertyId.notNull).toBe(true);
    expect(columns.recipientEmail.notNull).toBe(true);
    expect(columns.emailType.notNull).toBe(true);
    expect(columns.subject.notNull).toBe(true);
  });

  it('should default status to sent', () => {
    const columns = getTableColumns(emailLogs);

    expect(columns.status.hasDefault).toBe(true);
  });
});
