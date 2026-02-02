'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Check,
  User,
  Link2,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import type { SellerProfile } from '@/lib/data';

interface BecomeSellerFlowProps {
  onComplete: (sellerProfile: SellerProfile) => void;
  onClose: () => void;
}

type Step = 'intro' | 'profile' | 'social' | 'confirm';

const steps: Step[] = ['intro', 'profile', 'social', 'confirm'];

// 職業リスト
const occupations = [
  { id: 'designer', label: 'デザイナー' },
  { id: 'engineer', label: 'エンジニア' },
  { id: 'photographer', label: 'フォトグラファー' },
  { id: 'writer', label: 'ライター・編集者' },
  { id: 'musician', label: 'ミュージシャン' },
  { id: 'artist', label: 'アーティスト' },
  { id: 'architect', label: '建築家' },
  { id: 'consultant', label: 'コンサルタント' },
  { id: 'marketer', label: 'マーケター' },
  { id: 'entrepreneur', label: '起業家' },
  { id: 'freelance', label: 'フリーランス' },
  { id: 'remote', label: 'リモートワーカー' },
  { id: 'creator', label: 'クリエイター' },
  { id: 'teacher', label: '教師・講師' },
  { id: 'researcher', label: '研究者' },
  { id: 'medical', label: '医療従事者' },
  { id: 'finance', label: '金融' },
  { id: 'legal', label: '法律' },
  { id: 'sales', label: '営業' },
  { id: 'hr', label: '人事' },
  { id: 'student', label: '学生' },
  { id: 'other', label: 'その他' },
];

export function BecomeSellerFlow({
  onComplete,
  onClose,
}: BecomeSellerFlowProps) {
  const [step, setStep] = useState<Step>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Occupation selection (単一選択)
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);

  // Profile fields
  const [bio, setBio] = useState('');

  // Social links
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');

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
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sellerProfile: SellerProfile = {
      occupation: selectedOccupations
        .map((id) => occupations.find((o) => o.id === id)?.label)
        .filter(Boolean)
        .join('、'),
      bio,
      socialLinks: {
        instagram: instagram || undefined,
        twitter: twitter || undefined,
        website: website || undefined,
      },
      sellerSince: new Date().toISOString(),
    };

    setIsSubmitting(false);
    onComplete(sellerProfile);
  };

  const canProceed = useCallback(() => {
    switch (step) {
      case 'intro':
        return true;
      case 'profile':
        return selectedOccupations.length > 0 && bio.trim() !== '';
      case 'social':
        return true;
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [step, selectedOccupations.length, bio]);

  // 無限スクロール用 - transform方式でシームレスなループを実現
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rowWidthRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  // ドラッグとホイールでスクロール、transformでシームレスにループ
  useEffect(() => {
    if (step !== 'profile') return;
    const container = scrollContainerRef.current;
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    if (!container || !row1 || !row2) return;

    // 1セット分の幅を計算
    const calculateRowWidth = () => {
      const children = Array.from(row1.children) as HTMLElement[];
      const oneSetCount = Math.ceil(children.length / 3);
      let width = 0;
      for (let i = 0; i < oneSetCount; i++) {
        if (children[i]) {
          width += children[i].offsetWidth + 8;
        }
      }
      rowWidthRef.current = width;
    };

    calculateRowWidth();
    window.addEventListener('resize', calculateRowWidth);

    const updateTransform = (offset: number) => {
      const rowWidth = rowWidthRef.current;
      if (rowWidth <= 0) return offset;

      // オフセットを正規化（無限ループ）
      let normalizedOffset = offset % rowWidth;
      if (normalizedOffset > 0) normalizedOffset -= rowWidth;

      offsetRef.current = normalizedOffset;
      row1.style.transform = `translateX(${normalizedOffset}px)`;
      row2.style.transform = `translateX(${normalizedOffset}px)`;
      return normalizedOffset;
    };

    const handleStart = (clientX: number) => {
      isDraggingRef.current = true;
      startXRef.current = clientX;
      startOffsetRef.current = offsetRef.current;
      lastXRef.current = clientX;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
      cancelAnimationFrame(animationFrameRef.current);
      container.style.cursor = 'grabbing';
    };

    const handleMove = (clientX: number) => {
      if (!isDraggingRef.current) return;
      const diff = clientX - startXRef.current;
      const newOffset = startOffsetRef.current + diff;
      updateTransform(newOffset);

      const now = performance.now();
      const dt = now - lastTimeRef.current;
      if (dt > 0) {
        velocityRef.current = (clientX - lastXRef.current) / dt;
      }
      lastXRef.current = clientX;
      lastTimeRef.current = now;
    };

    const handleEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      container.style.cursor = 'grab';

      // 慣性スクロール
      const startVelocity = velocityRef.current * 15;
      if (Math.abs(startVelocity) > 0.5) {
        let velocity = startVelocity;
        const friction = 0.95;

        const animate = () => {
          if (Math.abs(velocity) < 0.1) return;
          offsetRef.current = updateTransform(offsetRef.current + velocity);
          velocity *= friction;
          animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
      }
    };

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();

    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      updateTransform(offsetRef.current - delta);
    };

    container.style.cursor = 'grab';
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', calculateRowWidth);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [step]);

  // Enterキーで次へ進む
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
        // Textareaでは無視（改行を許可）
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
                クリエイターとして
                <br />
                登録する
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                はじめに、あなたの暮らしのスタイルやプロフィールについてうかがいます。
                入居希望者があなたの空間に興味を持つきっかけになります。
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

        {/* Step: Profile */}
        {step === 'profile' && (
          <div className="flex h-full overflow-hidden">
            <div className="flex flex-1 flex-col justify-center py-8 overflow-hidden">
              <div className="px-12 lg:px-24 mb-6">
                <p className="text-sm text-muted-foreground mb-1">ステップ1</p>
                <h1 className="text-2xl font-semibold mb-2">
                  プロフィールを教えてください
                </h1>
                <p className="text-sm text-muted-foreground">
                  入居希望者に表示される情報です
                </p>
              </div>

              {/* 職業選択 */}
              <div className="mb-6">
                <div className="px-12 lg:px-24 mb-3">
                  <Label className="text-sm">職業・活動</Label>
                </div>
                <div className="relative">
                  <div
                    ref={scrollContainerRef}
                    className="overflow-hidden select-none"
                  >
                    <div className="flex flex-col gap-2 px-12 lg:px-24">
                      {[0, 1].map((rowIndex) => {
                        const rowOccupations = occupations.filter(
                          (_, idx) =>
                            Math.floor(
                              idx / Math.ceil(occupations.length / 2)
                            ) === rowIndex
                        );
                        // 3回繰り返して無限ループを実現
                        const repeatedOccupations = [
                          ...rowOccupations,
                          ...rowOccupations,
                          ...rowOccupations,
                        ];
                        return (
                          <div
                            key={rowIndex}
                            ref={rowIndex === 0 ? row1Ref : row2Ref}
                            className="flex gap-2 w-max"
                            style={{ willChange: 'transform' }}
                          >
                            {repeatedOccupations.map((occ, idx) => {
                              const isSelected = selectedOccupations.includes(
                                occ.id
                              );
                              return (
                                <button
                                  key={`${occ.id}-${idx}`}
                                  onClick={() =>
                                    setSelectedOccupations(
                                      isSelected ? [] : [occ.id]
                                    )
                                  }
                                  className={cn(
                                    'px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                                    isSelected
                                      ? 'border-foreground bg-foreground text-background'
                                      : 'border-border hover:border-foreground/40'
                                  )}
                                >
                                  {occ.label}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Left blur effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                  {/* Right blur effect */}
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
                </div>
              </div>

              {/* 自己紹介 */}
              <div className="px-12 lg:px-24 flex-1 min-h-0 pb-8 lg:pr-12">
                <div className="space-y-2 h-full flex flex-col">
                  <Label htmlFor="bio">自己紹介</Label>
                  <Textarea
                    id="bio"
                    placeholder="あなたのことや、どんな空間を作ってきたかを教えてください"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="flex-1 min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&auto=format&fit=crop&q=90"
                alt="プロフィールイメージ"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Social Links */}
        {step === 'social' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ2</p>
              <h1 className="text-4xl font-semibold mb-6">SNSリンク</h1>
              <p className="text-muted-foreground mb-8">
                入居希望者があなたの活動を知れるようになります（任意）
              </p>
              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">X (Twitter)</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">ウェブサイト</Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&auto=format&fit=crop&q=90"
                alt="SNSイメージ"
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
              <h1 className="text-4xl font-semibold mb-6">登録内容の確認</h1>
              <p className="text-muted-foreground mb-8">
                以下の内容でクリエイターとして登録します
              </p>
              <div className="space-y-4 rounded-xl border p-6 max-w-md">
                <div>
                  <p className="text-sm text-muted-foreground">職業・活動</p>
                  <p className="font-medium">
                    {selectedOccupations
                      .map((id) => occupations.find((o) => o.id === id)?.label)
                      .filter(Boolean)
                      .join('、')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">自己紹介</p>
                  <p className="font-medium whitespace-pre-wrap">{bio}</p>
                </div>
                {(instagram || twitter || website) && (
                  <div>
                    <p className="text-sm text-muted-foreground">SNS</p>
                    <div className="space-y-1">
                      {instagram && (
                        <p className="text-sm">Instagram: {instagram}</p>
                      )}
                      {twitter && <p className="text-sm">X: {twitter}</p>}
                      {website && <p className="text-sm">Web: {website}</p>}
                    </div>
                  </div>
                )}
              </div>
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
              disabled={isSubmitting}
              size="lg"
              className="h-12 px-8 rounded-lg bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登録中...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  クリエイターになる
                </>
              )}
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
