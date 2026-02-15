'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface DocumentPreparationChecklistProps {
  onComplete: () => void;
  onSkip?: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  required: boolean;
  examples?: string[];
}

const checklistItems: ChecklistItem[] = [
  {
    id: 'identity',
    title: '本人確認書類',
    description:
      '顔写真付きの公的身分証明書が必要です。以下のいずれかをご用意ください。',
    icon: FileText,
    required: true,
    examples: [
      '運転免許証（両面）',
      'マイナンバーカード（表面のみ）',
      'パスポート（顔写真ページ）',
      '在留カード（両面）',
    ],
  },
  {
    id: 'bank',
    title: '銀行口座情報',
    description:
      '報酬を受け取るための銀行口座情報をご用意ください。以下の情報が必要です。',
    icon: CreditCard,
    required: true,
    examples: [
      '金融機関名',
      '支店名',
      '口座種別（普通/当座）',
      '口座番号',
      '口座名義（カタカナ）',
    ],
  },
];

export function DocumentPreparationChecklist({
  onComplete,
  onSkip,
}: DocumentPreparationChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const allRequiredChecked = checklistItems
    .filter((item) => item.required)
    .every((item) => checkedItems.has(item.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          必要書類の準備
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-500" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              本人確認と口座登録について
            </p>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
              報酬受取口座の設定には、Stripeによる本人確認が必要です。スムーズに手続きを進めるため、以下の書類をご準備ください。
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {checklistItems.map((item) => {
            const Icon = item.icon;
            const isChecked = checkedItems.has(item.id);

            return (
              <div
                key={item.id}
                className="rounded-lg border p-4 transition-all hover:border-foreground/20"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-5 items-center pt-0.5">
                    <Checkbox
                      id={item.id}
                      checked={isChecked}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <label
                        htmlFor={item.id}
                        className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {item.title}
                        {item.required && (
                          <span className="ml-1 text-xs text-red-600">
                            （必須）
                          </span>
                        )}
                      </label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.examples && (
                      <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                        {item.examples.map((example, idx) => (
                          <li key={idx}>{example}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allRequiredChecked && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800 dark:text-green-200">
              準備が整いました。次のステップに進めます。
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="sm:order-1">
              あとで準備する
            </Button>
          )}
          <Button
            onClick={onComplete}
            disabled={!allRequiredChecked}
            size="lg"
            className="sm:order-2"
          >
            準備完了
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-medium">注意事項：</p>
          <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
            <li>本人確認書類は有効期限内のものをご用意ください</li>
            <li>書類の文字がはっきり読める写真を撮影してください</li>
            <li>
              銀行口座は本人名義のものをご用意ください（屋号付き口座も可）
            </li>
            <li>
              入力いただいた情報はStripeの安全な環境で暗号化されて保管されます
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
