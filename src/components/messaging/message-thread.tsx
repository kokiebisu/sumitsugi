'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScheduleTemplates } from './schedule-templates';
import { Send } from 'lucide-react';
import type { Message } from '@/lib/messaging';
import { cn } from '@/lib/utils';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onSend: (body: string, messageType?: 'text' | 'template') => Promise<void>;
}

export function MessageThread({
  messages,
  currentUserId,
  onSend,
}: MessageThreadProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSend = useCallback(async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await onSend(body, 'text');
      setInput('');
    } finally {
      setSending(false);
    }
  }, [input, sending, onSend]);

  const handleTemplate = useCallback(
    async (template: string) => {
      setSending(true);
      try {
        await onSend(template, 'template');
        setShowTemplates(false);
      } finally {
        setSending(false);
      }
    },
    [onSend]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            メッセージはまだありません
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          const isSystem = msg.messageType === 'system';
          return (
            <div
              key={msg.id}
              className={cn(
                'flex',
                isSystem
                  ? 'justify-center'
                  : isOwn
                    ? 'justify-end'
                    : 'justify-start'
              )}
            >
              {isSystem ? (
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {msg.body}
                </span>
              ) : (
                <Card
                  className={cn(
                    'max-w-[75%]',
                    isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <CardContent className="p-3">
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    <time className="text-[10px] opacity-60 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>
      {showTemplates && (
        <div className="px-4 py-2 border-t">
          <ScheduleTemplates onSelect={handleTemplate} />
        </div>
      )}
      <div className="p-4 border-t flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplates((p) => !p)}
          className="shrink-0"
        >
          定型文
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="メッセージを入力..."
          disabled={sending}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          size="icon"
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
