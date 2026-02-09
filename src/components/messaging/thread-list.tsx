'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import type { Thread } from '@/lib/messaging';
import { cn } from '@/lib/utils';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId?: string;
  onSelect: (thread: Thread) => void;
  currentUserId: string;
}

export function ThreadList({
  threads,
  selectedThreadId,
  onSelect,
  currentUserId,
}: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <MessageSquare className="w-10 h-10 mb-3" />
        <p className="text-sm">スレッドはまだありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const isSelected = thread.id === selectedThreadId;
        const partnerLabel =
          thread.sellerId === currentUserId ? '次の住人' : '前の住人';

        return (
          <Card
            key={thread.id}
            className={cn(
              'cursor-pointer transition-colors hover:bg-accent',
              isSelected && 'border-primary bg-accent'
            )}
            onClick={() => onSelect(thread)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    物件: {thread.propertyId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {partnerLabel}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(thread.createdAt).toLocaleDateString('ja-JP')}
                </time>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
