import { describe, it, expect } from 'vitest';
import {
  messageTypeSchema,
  createMessageSchema,
  createThreadSchema,
} from '../message';

describe('messageTypeSchema', () => {
  it('accepts all valid types', () => {
    const types = ['text', 'template', 'system'];
    for (const t of types) {
      expect(messageTypeSchema.parse(t)).toBe(t);
    }
  });

  it('rejects invalid type', () => {
    expect(() => messageTypeSchema.parse('image')).toThrow();
  });
});

describe('createMessageSchema', () => {
  const validMessage = {
    threadId: 'thread-1',
    body: 'こんにちは',
  };

  it('accepts valid message with defaults', () => {
    const result = createMessageSchema.parse(validMessage);
    expect(result.threadId).toBe('thread-1');
    expect(result.body).toBe('こんにちは');
    expect(result.messageType).toBe('text');
  });

  it('accepts message with explicit type', () => {
    const result = createMessageSchema.parse({
      ...validMessage,
      messageType: 'template',
    });
    expect(result.messageType).toBe('template');
  });

  it('accepts message with metadata', () => {
    const result = createMessageSchema.parse({
      ...validMessage,
      metadata: { templateId: 'greeting-1' },
    });
    expect(result.metadata).toEqual({ templateId: 'greeting-1' });
  });

  it('rejects empty body', () => {
    expect(() =>
      createMessageSchema.parse({ threadId: 'thread-1', body: '' })
    ).toThrow();
  });

  it('rejects body exceeding 2000 characters', () => {
    const longBody = 'あ'.repeat(2001);
    expect(() =>
      createMessageSchema.parse({ threadId: 'thread-1', body: longBody })
    ).toThrow();
  });

  it('accepts body at exactly 2000 characters', () => {
    const maxBody = 'a'.repeat(2000);
    const result = createMessageSchema.parse({
      threadId: 'thread-1',
      body: maxBody,
    });
    expect(result.body.length).toBe(2000);
  });

  it('rejects empty threadId', () => {
    expect(() =>
      createMessageSchema.parse({ threadId: '', body: 'hello' })
    ).toThrow();
  });
});

describe('createThreadSchema', () => {
  const validThread = {
    propertyId: 'prop-1',
    sellerId: 'seller-1',
    buyerId: 'buyer-1',
  };

  it('accepts valid thread', () => {
    expect(createThreadSchema.parse(validThread)).toEqual(validThread);
  });

  it('rejects missing propertyId', () => {
    expect(() =>
      createThreadSchema.parse({ sellerId: 'seller-1', buyerId: 'buyer-1' })
    ).toThrow();
  });

  it('rejects empty sellerId', () => {
    expect(() =>
      createThreadSchema.parse({ ...validThread, sellerId: '' })
    ).toThrow();
  });

  it('rejects empty buyerId', () => {
    expect(() =>
      createThreadSchema.parse({ ...validThread, buyerId: '' })
    ).toThrow();
  });
});
