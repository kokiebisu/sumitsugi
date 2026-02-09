'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThreadList } from '@/components/messaging/thread-list';
import { MessageThread } from '@/components/messaging/message-thread';
import {
  getThreadsByUserAction,
  getThreadMessagesAction,
  sendMessageAction,
} from '@/actions/messaging';
import type { Thread, Message } from '@/lib/messaging';

const POLL_MS = 5000;
const CURRENT_USER_ID = 'demo-user-1'; // TODO: replace with auth

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadThreads = useCallback(async () => {
    const r = await getThreadsByUserAction(CURRENT_USER_ID);
    if (r.success) setThreads(r.data);
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async (threadId: string) => {
    const r = await getThreadMessagesAction(threadId);
    if (r.success) setMessages(r.data);
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
    const id = setInterval(() => loadMessages(selected.id), POLL_MS);
    return () => clearInterval(id);
  }, [selected, loadMessages]);

  const handleSend = useCallback(
    async (body: string, messageType?: 'text' | 'template') => {
      if (!selected) return;
      const r = await sendMessageAction({
        threadId: selected.id,
        senderId: CURRENT_USER_ID,
        body,
        messageType,
      });
      if (r.success) await loadMessages(selected.id);
    },
    [selected, loadMessages]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            メッセージ
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
            <div className="md:col-span-1 border rounded-xl p-4 overflow-y-auto">
              <h2 className="text-sm font-semibold mb-3">スレッド一覧</h2>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <ThreadList
                  threads={threads}
                  selectedThreadId={selected?.id}
                  onSelect={(t) => {
                    setSelected(t);
                    setMessages([]);
                  }}
                  currentUserId={CURRENT_USER_ID}
                />
              )}
            </div>
            <div className="md:col-span-2 border rounded-xl flex flex-col">
              {selected ? (
                <MessageThread
                  messages={messages}
                  currentUserId={CURRENT_USER_ID}
                  onSend={handleSend}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  スレッドを選択してください
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
