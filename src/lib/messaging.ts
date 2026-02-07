/**
 * 簡易メッセージ機能（内見日程調整用）
 *
 * スレッド: 1物件×1ペア（前の住人×次の住人）で1スレッド
 * メッセージ: テキスト or 日程提案（構造化メッセージ）
 * 日程調整: 前の住人が3候補提示 → 次の住人が1つ選択 → 確定
 */

export interface Thread {
  id: string;
  propertyId: string;
  sellerId: string;
  buyerId: string;
  createdAt: string;
}

export type MessageType = 'text' | 'template' | 'system';

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  messageType: MessageType;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
}

export type DateProposalStatus = 'pending' | 'confirmed' | 'expired';

export interface DateProposal {
  id: string;
  threadId: string;
  proposerId: string;
  candidateDates: string[]; // ISO datetime strings (3 candidates)
  status: DateProposalStatus;
  selectedDate?: string;
  createdAt: string;
}

// In-memory store (mock, will be replaced with DB)
let threads: Thread[] = [];
let messageStore: Message[] = [];
let dateProposals: DateProposal[] = [];
let nextId = 1;

function generateId(): string {
  return `msg-${nextId++}-${Date.now()}`;
}

/**
 * Creates a new thread. Returns existing thread if same combo already exists.
 */
export function createThread(
  propertyId: string,
  sellerId: string,
  buyerId: string
): Thread {
  const existing = threads.find(
    (t) =>
      t.propertyId === propertyId &&
      t.sellerId === sellerId &&
      t.buyerId === buyerId
  );
  if (existing) return existing;

  const thread: Thread = {
    id: generateId(),
    propertyId,
    sellerId,
    buyerId,
    createdAt: new Date().toISOString(),
  };
  threads = [...threads, thread];
  return thread;
}

/**
 * Returns all threads where user is seller or buyer.
 */
export function getThreadsByUser(userId: string): Thread[] {
  return threads.filter((t) => t.sellerId === userId || t.buyerId === userId);
}

/**
 * Sends a text message in a thread.
 */
export function sendMessage(
  threadId: string,
  senderId: string,
  body: string,
  messageType: MessageType = 'text',
  metadata?: Record<string, unknown>
): Message {
  const message: Message = {
    id: generateId(),
    threadId,
    senderId,
    body,
    messageType,
    metadata,
    createdAt: new Date().toISOString(),
  };
  messageStore = [...messageStore, message];
  return message;
}

/**
 * Returns messages in a thread, sorted by creation time.
 */
export function getThreadMessages(threadId: string): Message[] {
  return messageStore
    .filter((m) => m.threadId === threadId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

/**
 * Creates a date proposal with candidate dates.
 * Also sends a system message in the thread.
 */
export function sendDateProposal(
  threadId: string,
  proposerId: string,
  candidateDates: string[]
): DateProposal {
  const proposal: DateProposal = {
    id: generateId(),
    threadId,
    proposerId,
    candidateDates,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  dateProposals = [...dateProposals, proposal];

  // Send system message about the proposal
  sendMessage(
    threadId,
    proposerId,
    '内見日程の候補を提案しました',
    'template',
    { proposalId: proposal.id, type: 'date_proposal' }
  );

  return proposal;
}

/**
 * Selects one of the proposed dates. Throws if date is not in candidates.
 */
export function selectDate(
  proposalId: string,
  selectedDate: string
): DateProposal {
  const proposal = dateProposals.find((p) => p.id === proposalId);
  if (!proposal) {
    throw new Error('日程提案が見つかりません');
  }

  if (proposal.status !== 'pending') {
    throw new Error('この日程提案は既に確定または期限切れです');
  }

  if (!proposal.candidateDates.includes(selectedDate)) {
    throw new Error('選択された日時は候補に含まれていません');
  }

  const updated: DateProposal = {
    ...proposal,
    status: 'confirmed',
    selectedDate,
  };
  dateProposals = dateProposals.map((p) => (p.id === proposalId ? updated : p));

  // Send confirmation system message
  const thread = threads.find((t) => t.id === proposal.threadId);
  if (thread) {
    const formattedDate = new Date(selectedDate).toLocaleString('ja-JP', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    sendMessage(
      proposal.threadId,
      'system',
      `内見日程が確定しました: ${formattedDate}`,
      'system',
      { proposalId, type: 'date_confirmed', selectedDate }
    );
  }

  return updated;
}

/**
 * Retrieves a date proposal by ID.
 */
export function getDateProposal(proposalId: string): DateProposal | undefined {
  return dateProposals.find((p) => p.id === proposalId);
}

/**
 * Resets all in-memory state. Used for testing.
 */
export function resetMessagingState(): void {
  threads = [];
  messageStore = [];
  dateProposals = [];
  nextId = 1;
}
