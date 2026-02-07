import { describe, it, expect, beforeEach } from 'vitest';
import {
  createThread,
  getThreadsByUser,
  getThreadMessages,
  sendMessage,
  sendDateProposal,
  selectDate,
  getDateProposal,
  resetMessagingState,
} from '../messaging';

describe('messaging service', () => {
  beforeEach(() => {
    resetMessagingState();
  });

  describe('createThread', () => {
    it('creates a new thread between seller and buyer for a property', () => {
      const thread = createThread('prop-1', 'seller-1', 'buyer-1');
      expect(thread.id).toBeTruthy();
      expect(thread.propertyId).toBe('prop-1');
      expect(thread.sellerId).toBe('seller-1');
      expect(thread.buyerId).toBe('buyer-1');
      expect(thread.createdAt).toBeTruthy();
    });

    it('returns existing thread if same property+seller+buyer combo exists', () => {
      const thread1 = createThread('prop-1', 'seller-1', 'buyer-1');
      const thread2 = createThread('prop-1', 'seller-1', 'buyer-1');
      expect(thread1.id).toBe(thread2.id);
    });

    it('creates separate threads for different property/seller/buyer combos', () => {
      const thread1 = createThread('prop-1', 'seller-1', 'buyer-1');
      const thread2 = createThread('prop-2', 'seller-1', 'buyer-1');
      expect(thread1.id).not.toBe(thread2.id);
    });
  });

  describe('getThreadsByUser', () => {
    it('returns threads where user is seller or buyer', () => {
      createThread('prop-1', 'seller-1', 'buyer-1');
      createThread('prop-2', 'seller-2', 'buyer-1');
      createThread('prop-3', 'seller-1', 'buyer-2');

      const sellerThreads = getThreadsByUser('seller-1');
      expect(sellerThreads.length).toBe(2);

      const buyerThreads = getThreadsByUser('buyer-1');
      expect(buyerThreads.length).toBe(2);
    });

    it('returns empty array if user has no threads', () => {
      const threads = getThreadsByUser('nonexistent');
      expect(threads).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('sends a text message in a thread', () => {
      const thread = createThread('prop-1', 'seller-1', 'buyer-1');
      const msg = sendMessage(thread.id, 'seller-1', 'こんにちは！');
      expect(msg.id).toBeTruthy();
      expect(msg.threadId).toBe(thread.id);
      expect(msg.senderId).toBe('seller-1');
      expect(msg.body).toBe('こんにちは！');
      expect(msg.messageType).toBe('text');
    });
  });

  describe('getThreadMessages', () => {
    it('returns messages in chronological order', () => {
      const thread = createThread('prop-1', 'seller-1', 'buyer-1');
      sendMessage(thread.id, 'seller-1', 'First');
      sendMessage(thread.id, 'buyer-1', 'Second');
      sendMessage(thread.id, 'seller-1', 'Third');

      const messages = getThreadMessages(thread.id);
      expect(messages.length).toBe(3);
      expect(messages[0].body).toBe('First');
      expect(messages[1].body).toBe('Second');
      expect(messages[2].body).toBe('Third');
    });

    it('returns empty array for thread with no messages', () => {
      const thread = createThread('prop-1', 'seller-1', 'buyer-1');
      expect(getThreadMessages(thread.id)).toEqual([]);
    });
  });

  describe('date proposals', () => {
    it('creates a date proposal with 3 candidate dates', () => {
      const thread = createThread('prop-1', 'seller-1', 'buyer-1');
      const dates = [
        '2026-02-15T10:00:00',
        '2026-02-16T14:00:00',
        '2026-02-17T11:00:00',
      ];
      const proposal = sendDateProposal(thread.id, 'seller-1', dates);
      expect(proposal.id).toBeTruthy();
      expect(proposal.threadId).toBe(thread.id);
      expect(proposal.proposerId).toBe('seller-1');
      expect(proposal.candidateDates).toEqual(dates);
      expect(proposal.status).toBe('pending');
      expect(proposal.selectedDate).toBeUndefined();
    });

    it('allows buyer to select one of the proposed dates', () => {
      const thread = createThread('prop-1', 'seller-1', 'buyer-1');
      const dates = [
        '2026-02-15T10:00:00',
        '2026-02-16T14:00:00',
        '2026-02-17T11:00:00',
      ];
      const proposal = sendDateProposal(thread.id, 'seller-1', dates);
      const updated = selectDate(proposal.id, '2026-02-16T14:00:00');

      expect(updated.status).toBe('confirmed');
      expect(updated.selectedDate).toBe('2026-02-16T14:00:00');
    });

    it('rejects selecting a date not in candidates', () => {
      const thread = createThread('prop-1', 'seller-1', 'buyer-1');
      const dates = [
        '2026-02-15T10:00:00',
        '2026-02-16T14:00:00',
        '2026-02-17T11:00:00',
      ];
      const proposal = sendDateProposal(thread.id, 'seller-1', dates);
      expect(() => selectDate(proposal.id, '2026-03-01T10:00:00')).toThrow(
        '選択された日時は候補に含まれていません'
      );
    });

    it('retrieves a date proposal by id', () => {
      const thread = createThread('prop-1', 'seller-1', 'buyer-1');
      const dates = [
        '2026-02-15T10:00:00',
        '2026-02-16T14:00:00',
        '2026-02-17T11:00:00',
      ];
      const proposal = sendDateProposal(thread.id, 'seller-1', dates);
      const fetched = getDateProposal(proposal.id);
      expect(fetched).toBeDefined();
      expect(fetched!.id).toBe(proposal.id);
    });

    it('returns undefined for nonexistent proposal', () => {
      expect(getDateProposal('nonexistent')).toBeUndefined();
    });
  });
});
