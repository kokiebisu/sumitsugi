'use server';

import zod from 'zod';
import {
  createThread,
  sendMessage,
  getThreadMessages,
  getThreadsByUser,
  type Thread,
  type Message,
  type MessageType,
} from '@/lib/messaging';

const createThreadSchema = zod.object({
  propertyId: zod.string().min(1, '物件IDは必須です'),
  sellerId: zod.string().min(1, '前の住人IDは必須です'),
  buyerId: zod.string().min(1, '次の住人IDは必須です'),
});

const sendMessageSchema = zod.object({
  threadId: zod.string().min(1, 'スレッドIDは必須です'),
  senderId: zod.string().min(1, '送信者IDは必須です'),
  body: zod.string().min(1, 'メッセージを入力してください'),
  messageType: zod.enum(['text', 'template', 'system']).optional(),
  metadata: zod.record(zod.unknown()).optional(),
});

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createThreadAction(
  data: zod.infer<typeof createThreadSchema>
): Promise<ActionResult<Thread>> {
  try {
    const validated = createThreadSchema.parse(data);
    const thread = createThread(
      validated.propertyId,
      validated.sellerId,
      validated.buyerId
    );
    return { success: true, data: thread };
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'スレッドの作成に失敗しました' };
  }
}

export async function sendMessageAction(
  data: zod.infer<typeof sendMessageSchema>
): Promise<ActionResult<Message>> {
  try {
    const validated = sendMessageSchema.parse(data);
    const message = sendMessage(
      validated.threadId,
      validated.senderId,
      validated.body,
      (validated.messageType as MessageType) ?? 'text',
      validated.metadata
    );
    return { success: true, data: message };
  } catch (error) {
    if (error instanceof zod.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'メッセージの送信に失敗しました' };
  }
}

export async function getThreadMessagesAction(
  threadId: string
): Promise<ActionResult<Message[]>> {
  try {
    if (!threadId) {
      return { success: false, error: 'スレッドIDは必須です' };
    }
    const messages = getThreadMessages(threadId);
    return { success: true, data: messages };
  } catch (_error) {
    return { success: false, error: 'メッセージの取得に失敗しました' };
  }
}

export async function getThreadsByUserAction(
  userId: string
): Promise<ActionResult<Thread[]>> {
  try {
    if (!userId) {
      return { success: false, error: 'ユーザーIDは必須です' };
    }
    const threads = getThreadsByUser(userId);
    return { success: true, data: threads };
  } catch (_error) {
    return { success: false, error: 'スレッドの取得に失敗しました' };
  }
}
