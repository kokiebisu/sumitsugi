import { describe, it, expect, beforeEach } from 'vitest';
import { resetMessagingState } from '@/lib/messaging';
import {
  createThreadAction,
  sendMessageAction,
  getThreadMessagesAction,
  getThreadsByUserAction,
} from '../messaging';

describe('messaging actions', () => {
  beforeEach(() => {
    resetMessagingState();
  });

  it('should create a thread and return existing for same combo', async () => {
    const first = await createThreadAction({
      propertyId: 'prop-1',
      sellerId: 'seller-1',
      buyerId: 'buyer-1',
    });
    expect(first.success).toBe(true);
    expect(first.data?.propertyId).toBe('prop-1');

    const second = await createThreadAction({
      propertyId: 'prop-1',
      sellerId: 'seller-1',
      buyerId: 'buyer-1',
    });
    expect(first.data?.id).toBe(second.data?.id);
  });

  it('should fail createThread with empty propertyId', async () => {
    const result = await createThreadAction({
      propertyId: '',
      sellerId: 'seller-1',
      buyerId: 'buyer-1',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should send text and template messages', async () => {
    const thread = await createThreadAction({
      propertyId: 'prop-1',
      sellerId: 'seller-1',
      buyerId: 'buyer-1',
    });
    const text = await sendMessageAction({
      threadId: thread.data!.id,
      senderId: 'seller-1',
      body: 'こんにちは',
    });
    expect(text.success).toBe(true);
    expect(text.data?.messageType).toBe('text');

    const tmpl = await sendMessageAction({
      threadId: thread.data!.id,
      senderId: 'seller-1',
      body: '日程調整',
      messageType: 'template',
    });
    expect(tmpl.success).toBe(true);
    expect(tmpl.data?.messageType).toBe('template');
  });

  it('should fail sendMessage with empty body', async () => {
    const result = await sendMessageAction({
      threadId: 'thread-1',
      senderId: 'seller-1',
      body: '',
    });
    expect(result.success).toBe(false);
  });

  it('should return messages in order', async () => {
    const thread = await createThreadAction({
      propertyId: 'prop-1',
      sellerId: 's1',
      buyerId: 'b1',
    });
    await sendMessageAction({
      threadId: thread.data!.id,
      senderId: 's1',
      body: '1st',
    });
    await sendMessageAction({
      threadId: thread.data!.id,
      senderId: 'b1',
      body: '2nd',
    });

    const result = await getThreadMessagesAction(thread.data!.id);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data![0].body).toBe('1st');
  });

  it('should fail getThreadMessages with empty threadId', async () => {
    expect((await getThreadMessagesAction('')).success).toBe(false);
  });

  it('should return threads for a user', async () => {
    await createThreadAction({
      propertyId: 'p1',
      sellerId: 's1',
      buyerId: 'b1',
    });
    await createThreadAction({
      propertyId: 'p2',
      sellerId: 's1',
      buyerId: 'b2',
    });
    const result = await getThreadsByUserAction('s1');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('should fail getThreadsByUser with empty userId', async () => {
    expect((await getThreadsByUserAction('')).success).toBe(false);
  });
});
