'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import { MoveOutDatePicker } from '@/components/listing/move-out-date-picker';
import { validateMoveOutDate } from '@/lib/validations/move-out-date';

interface CreateListingFlowProps {
  onComplete: (listingData: ListingData) => void;
  onClose: () => void;
}

interface ListingData {
  moveOutDate?: string;
}

type Step = 'intro' | 'details' | 'confirm';

const steps: Step[] = ['intro', 'details', 'confirm'];

export function CreateListingFlow({
  onComplete,
  onClose,
}: CreateListingFlowProps) {
  const [step, setStep] = useState<Step>('intro');
  const [moveOutDate, setMoveOutDate] = useState('');

  const currentStepIndex = steps.indexOf(step);

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    } else {
      onClose();
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const handleSubmit = async () => {
    const listingData: ListingData = {
      moveOutDate: moveOutDate || undefined,
    };
    onComplete(listingData);
  };

  const canProceed = useCallback(() => {
    switch (step) {
      case 'intro':
        return true;
      case 'details': {
        if (!moveOutDate) return false;
        const validation = validateMoveOutDate(moveOutDate);
        return validation.valid;
      }
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [step, moveOutDate]);

  // Enterキーで次へ進む
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
        if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        if (step === 'confirm') {
          handleSubmit();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, step]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-xl font-bold text-coral">{siteConfig.name}</span>
        <Button variant="outline" onClick={onClose} className="rounded-full">
          保存して終了
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Step: Intro */}
        {step === 'intro' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ1</p>
              <h1 className="text-4xl font-semibold mb-6">
                物件を
                <br />
                掲載する
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                あなたの暮らしの空間を、次の入居者に引き継ぎましょう。
              </p>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&auto=format&fit=crop&q=90"
                alt="暮らしのイメージ"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ2</p>
              <h1 className="text-4xl font-semibold mb-6">物件の詳細</h1>
              <p className="text-lg text-muted-foreground max-w-md mb-8">
                物件の詳細情報を入力してください。
              </p>
              <div className="max-w-md space-y-6">
                <MoveOutDatePicker
                  value={moveOutDate}
                  onChange={setMoveOutDate}
                />
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&auto=format&fit=crop&q=90"
                alt="物件イメージ"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ3</p>
              <h1 className="text-4xl font-semibold mb-6">掲載内容の確認</h1>
              <p className="text-muted-foreground mb-8">
                入力した内容で物件を掲載します
              </p>
              {moveOutDate && (
                <div className="mb-6 rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">退去予定日</p>
                  <p className="text-lg font-medium">
                    {new Date(moveOutDate).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&auto=format&fit=crop&q=90"
                alt="確認イメージ"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer with Progress */}
      <footer className="border-t">
        {/* Progress Bar */}
        <div className="flex">
          {steps.map((s, index) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1',
                index <= currentStepIndex ? 'bg-foreground' : 'bg-border'
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-base font-medium underline underline-offset-4"
          >
            戻る
          </Button>

          {step === 'confirm' ? (
            <Button
              onClick={handleSubmit}
              size="lg"
              className="h-12 px-8 rounded-lg bg-foreground text-background hover:bg-foreground/90"
            >
              <Check className="mr-2 h-4 w-4" />
              掲載する
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              size="lg"
              className="h-12 px-8 rounded-lg bg-foreground text-background hover:bg-foreground/90"
            >
              次へ
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
