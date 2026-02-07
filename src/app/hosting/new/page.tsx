'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Check,
  Building2,
  Home,
  DoorOpen,
  Users,
  Upload,
  X,
  Music,
  Palette,
  Leaf,
  Coffee,
  Book,
  Camera,
  Dumbbell,
  Gamepad2,
  UtensilsCrossed,
  Wine,
  Plane,
  Cat,
  Baby,
  Sparkles,
  TreePine,
  Sofa,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import { useAuth } from '@/contexts/auth-context';
import { Header } from '@/components/header';

type Step =
  | 'intro'
  | 'type'
  | 'lifestyle'
  | 'basic'
  | 'photos'
  | 'interior'
  | 'confirm';

const steps: Step[] = [
  'intro',
  'type',
  'lifestyle',
  'basic',
  'photos',
  'interior',
  'confirm',
];

// 2つのフェーズにステップをグループ化（Airbnb風）
const phases = [
  { name: '物件について', steps: ['intro', 'type', 'lifestyle'] },
  { name: '詳細情報', steps: ['basic', 'photos', 'interior', 'confirm'] },
];

// 物件タイプ（フラットなLucideアイコン使用）
const PROPERTY_TYPES = [
  { id: 'apartment', label: 'マンション', Icon: Building2 },
  { id: 'house', label: '一戸建て', Icon: Home },
  { id: 'studio', label: 'ワンルーム', Icon: DoorOpen },
  { id: 'share', label: 'シェアハウス', Icon: Users },
];

// ライフスタイル（アイコン付き）
const LIFESTYLES = [
  { id: 'dj', label: 'DJ・音楽', Icon: Music },
  { id: 'art', label: 'アート', Icon: Palette },
  { id: 'plant', label: '植物・ボタニカル', Icon: Leaf },
  { id: 'cafe', label: 'カフェ風', Icon: Coffee },
  { id: 'reading', label: '読書・書斎', Icon: Book },
  { id: 'photo', label: '写真・映像', Icon: Camera },
  { id: 'fitness', label: 'フィットネス', Icon: Dumbbell },
  { id: 'gaming', label: 'ゲーミング', Icon: Gamepad2 },
  { id: 'cooking', label: '料理好き', Icon: UtensilsCrossed },
  { id: 'wine', label: 'ワイン・お酒', Icon: Wine },
  { id: 'travel', label: '旅行・海外', Icon: Plane },
  { id: 'pet', label: 'ペットと暮らす', Icon: Cat },
  { id: 'family', label: 'ファミリー向け', Icon: Baby },
  { id: 'minimal', label: 'ミニマル', Icon: Sparkles },
  { id: 'scandinavian', label: '北欧', Icon: TreePine },
  { id: 'vintage', label: 'ヴィンテージ', Icon: Sofa },
];

// 各ステップに対応する画像
const stepImages: Record<Step, string> = {
  intro: '', // イントロはイラストを使用
  type: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&auto=format&fit=crop&q=90',
  lifestyle:
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&auto=format&fit=crop&q=90',
  basic:
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&auto=format&fit=crop&q=90',
  photos:
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&auto=format&fit=crop&q=90',
  interior:
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&auto=format&fit=crop&q=90',
  confirm:
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&auto=format&fit=crop&q=90',
};

export default function NewListingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState<Step>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [propertyType, setPropertyType] = useState('');
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('');
  const [rent, setRent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [interiorDescription, setInteriorDescription] = useState('');

  const currentStepIndex = steps.indexOf(step);

  // 現在のフェーズを計算
  const getCurrentPhase = () => {
    for (let i = 0; i < phases.length; i++) {
      if (phases[i].steps.includes(step)) {
        return i;
      }
    }
    return 0;
  };

  // 認証チェック
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    } else {
      router.push('/listing');
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    router.push('/listing');
  };

  const handleClose = () => {
    router.push('/listing');
  };

  const canProceed = useCallback(() => {
    switch (step) {
      case 'intro':
        return true;
      case 'type':
        return propertyType !== '';
      case 'lifestyle':
        return selectedLifestyles.length > 0;
      case 'basic':
        return (
          address.trim() !== '' &&
          area.trim() !== '' &&
          rooms.trim() !== '' &&
          rent.trim() !== ''
        );
      case 'photos':
        return true; // 写真は任意
      case 'interior':
        return true; // 説明は任意
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [
    step,
    propertyType,
    selectedLifestyles.length,
    address,
    area,
    rooms,
    rent,
  ]);

  // Enterキーで次へ
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentPhase = getCurrentPhase();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-xl font-bold text-coral">{siteConfig.name}</span>
        <Button
          variant="outline"
          onClick={handleClose}
          className="rounded-full"
        >
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
                リスティングについて
                <br />
                教えてください
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                このステップでは、物件の種類や ライフスタイルを選びます。
                あなたの空間の雰囲気が伝わる情報を入力しましょう。
              </p>
            </div>
            <div className="hidden lg:flex flex-1 items-center justify-center bg-[#FFF8F6]">
              {/* Airbnb風の等角投影イラスト - SVGで描画 */}
              <svg
                viewBox="0 0 400 400"
                className="w-full max-w-md h-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 床 */}
                <path
                  d="M200 320 L320 260 L320 180 L200 240 Z"
                  fill="#FFE4DB"
                  stroke="#E61E4D"
                  strokeWidth="2"
                />
                <path
                  d="M200 320 L80 260 L80 180 L200 240 Z"
                  fill="#FFEEE9"
                  stroke="#E61E4D"
                  strokeWidth="2"
                />

                {/* 左壁 */}
                <path
                  d="M80 180 L80 100 L200 40 L200 240 Z"
                  fill="#FFF5F2"
                  stroke="#E61E4D"
                  strokeWidth="2"
                />

                {/* 右壁 */}
                <path
                  d="M320 180 L320 100 L200 40 L200 240 Z"
                  fill="#FFEEE9"
                  stroke="#E61E4D"
                  strokeWidth="2"
                />

                {/* 屋根 */}
                <path
                  d="M200 40 L80 100 L200 160 L320 100 Z"
                  fill="#FFD9CF"
                  stroke="#E61E4D"
                  strokeWidth="2"
                />

                {/* 窓 - 左壁 */}
                <rect
                  x="110"
                  y="120"
                  width="50"
                  height="60"
                  fill="#B8E4FF"
                  stroke="#E61E4D"
                  strokeWidth="1.5"
                  transform="skewY(-30)"
                />

                {/* ソファ */}
                <path
                  d="M150 280 L180 265 L180 250 L150 265 Z"
                  fill="#E61E4D"
                  stroke="#D01346"
                  strokeWidth="1"
                />
                <path
                  d="M180 265 L220 245 L220 230 L180 250 Z"
                  fill="#FF6B6B"
                  stroke="#D01346"
                  strokeWidth="1"
                />

                {/* 植物 */}
                <ellipse
                  cx="260"
                  cy="260"
                  rx="15"
                  ry="25"
                  fill="#4CAF50"
                  stroke="#2E7D32"
                  strokeWidth="1"
                />
                <rect
                  x="255"
                  y="280"
                  width="10"
                  height="15"
                  fill="#8D6E63"
                  stroke="#5D4037"
                  strokeWidth="1"
                />

                {/* ランプ */}
                <line
                  x1="280"
                  y1="200"
                  x2="280"
                  y2="240"
                  stroke="#FFB74D"
                  strokeWidth="2"
                />
                <ellipse
                  cx="280"
                  cy="195"
                  rx="12"
                  ry="8"
                  fill="#FFE082"
                  stroke="#FFB74D"
                  strokeWidth="1"
                />

                {/* 本棚 - 右壁 */}
                <rect
                  x="240"
                  y="130"
                  width="40"
                  height="50"
                  fill="#FFCCBC"
                  stroke="#E61E4D"
                  strokeWidth="1"
                  transform="skewY(30)"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Step: Type */}
        {step === 'type' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ1</p>
              <h1 className="text-3xl font-semibold mb-8">
                どの物件タイプですか？
              </h1>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                {PROPERTY_TYPES.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPropertyType(id)}
                    className={cn(
                      'flex flex-col items-start p-5 rounded-xl border-2 transition-all text-left',
                      propertyType === id
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-foreground/40'
                    )}
                  >
                    <Icon
                      className="w-8 h-8 mb-3 text-foreground"
                      strokeWidth={1.5}
                    />
                    <span className="text-base font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src={stepImages.type}
                alt="物件タイプ"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Lifestyle */}
        {step === 'lifestyle' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ1</p>
              <h1 className="text-3xl font-semibold mb-3">
                あなたの暮らしのスタイルは？
              </h1>
              <p className="text-muted-foreground mb-8">複数選択可能です</p>
              <div className="relative flex-1 min-h-0">
                <div className="absolute inset-0 overflow-y-auto pb-16">
                  <div className="grid grid-cols-3 gap-4 max-w-xl">
                    {LIFESTYLES.map(({ id, label, Icon }) => {
                      const isSelected = selectedLifestyles.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedLifestyles(
                                selectedLifestyles.filter((l) => l !== id)
                              );
                            } else {
                              setSelectedLifestyles([
                                ...selectedLifestyles,
                                id,
                              ]);
                            }
                          }}
                          className={cn(
                            'flex flex-col items-start p-5 rounded-xl border-2 transition-all text-left',
                            isSelected
                              ? 'border-foreground bg-muted'
                              : 'border-border hover:border-foreground/40'
                          )}
                        >
                          <Icon
                            className="w-8 h-8 mb-3 text-foreground"
                            strokeWidth={1.5}
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* 下部の白グラデーション */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                  }}
                />
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src={stepImages.lifestyle}
                alt="ライフスタイル"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Basic Info */}
        {step === 'basic' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ2</p>
              <h1 className="text-3xl font-semibold mb-8">物件の基本情報</h1>
              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="address">住所（市区町村まで）</Label>
                  <Input
                    id="address"
                    placeholder="東京都渋谷区"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">面積（㎡）</Label>
                    <Input
                      id="area"
                      placeholder="45"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rooms">間取り</Label>
                    <Input
                      id="rooms"
                      placeholder="1LDK"
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rent">家賃（月額）</Label>
                  <Input
                    id="rent"
                    placeholder="150,000"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src={stepImages.basic}
                alt="基本情報"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Photos */}
        {step === 'photos' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ2</p>
              <h1 className="text-3xl font-semibold mb-3">
                写真を追加しましょう
              </h1>
              <p className="text-muted-foreground mb-8">
                入居希望者に空間の雰囲気を伝えましょう
              </p>
              <div className="max-w-lg">
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-foreground/40 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">
                    写真をドラッグ＆ドロップ
                  </p>
                  <p className="text-sm text-muted-foreground">
                    またはクリックしてアップロード
                  </p>
                </div>
                {photos.length > 0 && (
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {photos.map((photo, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setPhotos(photos.filter((_, idx) => idx !== i))
                          }
                          className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src={stepImages.photos}
                alt="写真"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Interior */}
        {step === 'interior' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24">
              <p className="text-sm text-muted-foreground mb-2">ステップ2</p>
              <h1 className="text-3xl font-semibold mb-3">
                インテリアについて
              </h1>
              <p className="text-muted-foreground mb-8">
                家具や設備について教えてください
              </p>
              <div className="max-w-lg">
                <Textarea
                  placeholder="こだわりの家具、設備、そのストーリーなどを教えてください"
                  value={interiorDescription}
                  onChange={(e) => setInteriorDescription(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src={stepImages.interior}
                alt="インテリア"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="flex min-h-full">
            <div className="flex flex-1 flex-col justify-center px-12 py-16 lg:px-24 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-2">ステップ3</p>
              <h1 className="text-3xl font-semibold mb-8">
                リスティング内容の確認
              </h1>
              <div className="space-y-6 max-w-lg">
                <div className="rounded-xl border p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">物件タイプ</p>
                    <p className="font-medium">
                      {PROPERTY_TYPES.find((t) => t.id === propertyType)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      ライフスタイル
                    </p>
                    <p className="font-medium">
                      {selectedLifestyles
                        .map((id) => LIFESTYLES.find((l) => l.id === id)?.label)
                        .join('、')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">所在地</p>
                    <p className="font-medium">{address}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">面積</p>
                      <p className="font-medium">{area}㎡</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">間取り</p>
                      <p className="font-medium">{rooms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">家賃</p>
                      <p className="font-medium">¥{rent}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block flex-1">
              <img
                src={stepImages.confirm}
                alt="確認"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer with Progress */}
      <footer className="border-t">
        {/* 3セグメントのプログレスバー（Airbnb風） */}
        <div className="flex gap-1 px-6 pt-2">
          {phases.map((phase, index) => (
            <div
              key={phase.name}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                index < currentPhase
                  ? 'bg-foreground'
                  : index === currentPhase
                    ? 'bg-foreground'
                    : 'bg-border'
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
                  作成中...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  リスティングを公開
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
