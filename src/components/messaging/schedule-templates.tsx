'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

const SCHEDULE_TEMPLATES = [
  '内見の日程を調整したいです。ご都合の良い日時を教えていただけますか？',
  '今週末の内見は可能でしょうか？',
  '平日の夕方以降でお時間いただけますか？',
  '引き継ぎについて詳しくお聞きしたいです。',
] as const;

interface ScheduleTemplatesProps {
  onSelect: (template: string) => void;
}

export function ScheduleTemplates({ onSelect }: ScheduleTemplatesProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Calendar className="w-4 h-4" />
        <span>定型文を選択</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SCHEDULE_TEMPLATES.map((template) => (
          <Button
            key={template}
            variant="outline"
            size="sm"
            onClick={() => onSelect(template)}
            className="text-xs"
          >
            {template.length > 20 ? `${template.slice(0, 20)}...` : template}
          </Button>
        ))}
      </div>
    </div>
  );
}

export { SCHEDULE_TEMPLATES };
