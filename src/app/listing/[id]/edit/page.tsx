'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import type { LargeFurnitureType } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  LocationPicker,
  type StationInfo,
  type LocationWithAddress,
} from '@/components/location-picker';
import { EstimateCard } from '@/components/estimate-card';
import { DateRangePicker } from '@/components/date-range-picker';
import { cn } from '@/lib/utils';
import {
  Leaf,
  Sparkles,
  TreePine,
  Sofa,
  Mountain,
  Lamp,
  Armchair,
  Moon,
  Flower2,
  Briefcase,
  Clock,
  Frame,
  X,
  Plus,
  BedDouble,
  Monitor,
  Archive,
  Waves,
  ArrowLeft,
  Upload,
  Table2,
  Shirt,
  Tv,
  Refrigerator,
  ShieldCheck,
} from 'lucide-react';

// 間取りの選択肢
const LAYOUT_OPTIONS = [
  '1R',
  '1K',
  '1DK',
  '1LDK',
  '2K',
  '2DK',
  '2LDK',
  '3K',
  '3DK',
  '3LDK',
  '4K',
  '4DK',
  '4LDK',
];

// 引き継ぎ対象の大型家具
const FURNITURE_ITEMS = [
  { id: 'bed' as const, label: 'ベッド', Icon: BedDouble },
  { id: 'sofa' as const, label: 'ソファ', Icon: Sofa },
  { id: 'desk' as const, label: 'デスク', Icon: Monitor },
  { id: 'storage' as const, label: '収納', Icon: Archive },
  { id: 'table' as const, label: 'テーブル', Icon: Table2 },
  { id: 'wardrobe' as const, label: 'ワードローブ', Icon: Shirt },
  { id: 'tv' as const, label: 'テレビ台', Icon: Tv },
  { id: 'fridge' as const, label: '冷蔵庫', Icon: Refrigerator },
];

// Alias for backward compatibility
const LARGE_FURNITURE_ITEMS = FURNITURE_ITEMS;

export default function EditListingPage() {
  const { user, isLoading, listings, updateListing } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const listing = listings.find((l) => l.id === listingId);

  const [selectedFurniture, setSelectedFurniture] = useState<
    LargeFurnitureType[]
  >([]);
  const [roomPhotos, setRoomPhotos] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [rent, setRent] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [layout, setLayout] = useState('');
  const [handoverFee, setHandoverFee] = useState('');
  const [location, setLocation] = useState<LocationWithAddress | null>(null);
  const [stations, setStations] = useState<StationInfo[]>([
    { name: '', walkingMinutes: '' },
  ]);
  const [viewingStartDate, setViewingStartDate] = useState<Date | null>(null);
  const [viewingEndDate, setViewingEndDate] = useState<Date | null>(null);
  const [moveInStartDate, setMoveInStartDate] = useState<Date | null>(null);
  const [moveInEndDate, setMoveInEndDate] = useState<Date | null>(null);
  const [hasLandlordConsent, setHasLandlordConsent] = useState(false);

  // リスティングデータを読み込み
  useEffect(() => {
    if (listing) {
      setSelectedFurniture(listing.furniture || []);
      setRoomPhotos(listing.roomPhotos || []);
      setRent(listing.rent?.toString() || '');
      setManagementFee(listing.managementFee?.toString() || '');
      setLayout(listing.layout || '');
      setHandoverFee(listing.handoverFee?.toString() || '');
      setHasLandlordConsent(
        listing.landlordConsent?.hasLandlordConsent || false
      );
      if (listing.stations && listing.stations.length > 0) {
        setStations(
          listing.stations.map((s) => ({
            name: s.name,
            walkingMinutes: s.walkingMinutes.toString(),
          }))
        );
      }
    }
  }, [listing]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && listing && listing.userId !== user.id) {
      router.push('/listing');
    }
  }, [user, isLoading, listing, router]);

  // 日付を文字列にフォーマット
  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start) return undefined;
    const formatDate = (d: Date) =>
      d.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    if (end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    return `${formatDate(start)}〜`;
  };

  // タイトルを自動生成
  const generateTitle = () => {
    // 間取りから暮らしタイプを判定
    const getLivingType = () => {
      const targetLayout = layout || listing?.layout;
      if (!targetLayout) return '';
      // 1R, 1K, 1DK, 1LDK は一人暮らし
      if (targetLayout.startsWith('1')) return '一人暮らしの';
      // 2K, 2DK, 2LDK は二人暮らし
      if (targetLayout.startsWith('2')) return '二人暮らしの';
      // 3K以上はファミリー向け
      return 'ファミリー向けの';
    };

    const livingType = getLivingType();

    // エリア名を取得（区名や市名など短い形式で）
    const getAreaName = () => {
      const neighborhood = location?.neighborhood || listing?.area;
      if (neighborhood) {
        // "渋谷区渋谷" -> "渋谷"、"世田谷区三軒茶屋" -> "三軒茶屋" のように区以降を取得
        const match = neighborhood.match(/区(.+)$/);
        if (match) return match[1];
        return neighborhood;
      }
      return null;
    };

    const areaName = getAreaName();
    if (areaName) {
      return `${areaName}の${livingType}部屋`;
    }
    return `${livingType}部屋`;
  };

  const handleSave = async () => {
    if (!listing) return;
    setIsSaving(true);

    const title = '私の暮らし';

    updateListing(listing.id, {
      title,
      furniture: selectedFurniture,
      roomPhotos,
      rent: rent ? parseInt(rent, 10) : undefined,
      managementFee: managementFee ? parseInt(managementFee, 10) : undefined,
      layout: layout || undefined,
      handoverFee: handoverFee ? parseInt(handoverFee, 10) : undefined,
      area: location?.neighborhood || listing.area,
      viewingAvailableFrom: formatDateRange(viewingStartDate, viewingEndDate),
      moveInAvailableFrom: formatDateRange(moveInStartDate, moveInEndDate),
      stations: stations
        .filter((s) => s.name)
        .map((s) => ({
          name: s.name,
          walkingMinutes: s.walkingMinutes ? parseInt(s.walkingMinutes, 10) : 0,
        })),
      landlordConsent: { hasLandlordConsent },
      consentStatus: hasLandlordConsent ? 'approved' : 'pending',
    });

    setIsSaving(false);
    router.push('/listing');
  };

  const openUploadDialog = () => {
    setUploadDialogOpen(true);
  };

  const closeUploadDialog = () => {
    setUploadDialogOpen(false);
    setIsUploading(false);
    setPendingPhotos([]);
  };

  const removePendingPhoto = (index: number) => {
    setPendingPhotos(pendingPhotos.filter((_, i) => i !== index));
  };

  const removeRoomPhoto = (index: number) => {
    setRoomPhotos(roomPhotos.filter((_, i) => i !== index));
  };

  const handleUploadConfirm = () => {
    if (pendingPhotos.length === 0) return;

    setIsUploading(true);
    setTimeout(() => {
      const remaining = 5 - roomPhotos.length;
      const photosToAdd = pendingPhotos.slice(0, remaining);
      setRoomPhotos([...roomPhotos, ...photosToAdd]);
      closeUploadDialog();
    }, 500);
  };

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files) return;

    setIsLoadingFiles(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });

      setPendingPhotos((prev) => [...prev, result]);
    }
    setIsLoadingFiles(false);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">部屋が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-border">
        <Link
          href="/listing"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </Link>
        <h1 className="text-lg font-semibold">部屋を編集</h1>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-[#E61E4D] hover:bg-[#D01346] text-white"
        >
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 px-6 py-8 md:px-12">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* 写真 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">部屋の写真</h2>
            <p className="text-sm text-muted-foreground mb-4">
              お部屋の魅力が伝わる写真を追加してください（3〜5枚）
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {roomPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                >
                  <img
                    src={photo}
                    alt={`部屋 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeRoomPhoto(index)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
                      カバー
                    </div>
                  )}
                </div>
              ))}
              {roomPhotos.length < 5 && (
                <button
                  onClick={openUploadDialog}
                  className="aspect-[4/3] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer"
                >
                  <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">追加</span>
                </button>
              )}
            </div>
            {roomPhotos.length > 0 && (
              <p
                className={`text-sm font-medium mt-3 ${roomPhotos.length >= 3 ? 'text-green-600' : 'text-muted-foreground'}`}
              >
                {roomPhotos.length} / 5 枚
                {roomPhotos.length < 3 && '（最低3枚必要）'}
              </p>
            )}
          </section>

          {/* エリア */}
          <section>
            <h2 className="text-xl font-semibold mb-2">エリア</h2>
            <p className="text-sm text-muted-foreground mb-4">
              地図をクリックして場所を指定してください
            </p>
            <LocationPicker
              onLocationSelect={setLocation}
              stations={stations}
              onStationsChange={setStations}
              initialLocation={
                location ? { lat: location.lat, lng: location.lng } : undefined
              }
            />
          </section>

          {/* 費用と物件情報 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">費用と物件情報</h2>
            <p className="text-sm text-muted-foreground mb-4">
              今わかる範囲で大丈夫です
            </p>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    家賃（円/月） <span className="text-coral">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="例: 80000"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    管理費（円/月）
                  </label>
                  <input
                    type="number"
                    placeholder="例: 5000"
                    value={managementFee}
                    onChange={(e) => setManagementFee(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  間取り <span className="text-coral">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LAYOUT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLayout(option)}
                      className={cn(
                        'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                        layout === option
                          ? 'border-foreground bg-foreground text-white'
                          : 'border-border hover:border-foreground/40'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 引き継ぎスケジュール */}
          <section>
            <h2 className="text-xl font-semibold mb-2">引き継ぎスケジュール</h2>
            <p className="text-sm text-muted-foreground mb-4">
              内見可能日と引き継ぎ可能日を選択
            </p>
            <div className="space-y-6">
              <DateRangePicker
                startDate={viewingStartDate}
                endDate={viewingEndDate}
                onDateChange={(start, end) => {
                  setViewingStartDate(start);
                  setViewingEndDate(end);
                }}
                title={
                  viewingStartDate && viewingEndDate
                    ? `${viewingStartDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} - ${viewingEndDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`
                    : '内見可能期間を選択'
                }
                subtitle="内見を受け付ける期間を選択してください"
              />
              <DateRangePicker
                startDate={moveInStartDate}
                endDate={moveInEndDate}
                onDateChange={(start, end) => {
                  setMoveInStartDate(start);
                  setMoveInEndDate(end);
                }}
                title={
                  moveInStartDate && moveInEndDate
                    ? `${moveInStartDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} - ${moveInEndDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}`
                    : '引越し希望期間を選択'
                }
                subtitle="引越しを希望する期間を選択してください"
              />
            </div>
          </section>

          {/* 大家承認 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">大家さんの承認</h2>
            <p className="text-sm text-muted-foreground mb-4">
              家具の引き継ぎについて大家さんの承認を得ていますか？（任意）
            </p>
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-border hover:border-foreground/40 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={hasLandlordConsent}
                onChange={(e) => setHasLandlordConsent(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-border text-foreground focus:ring-foreground"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-foreground">
                    大家さんから承認を得ています
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  大家さんの承認があると、次の住人の安心につながります。後から変更することもできます。
                </p>
              </div>
            </label>
          </section>

          {/* 引き継ぎ費用 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">引き継ぎ費用</h2>
            <p className="text-sm text-muted-foreground mb-4">
              家具を選んで、引き継ぎ費用を決めましょう
            </p>
            <div className="space-y-6">
              {/* 大型家具チェック */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  引き継ぐ大型家具（複数選択可）{' '}
                  <span className="text-coral">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {FURNITURE_ITEMS.map(({ id, label, Icon }) => {
                    const isSelected = selectedFurniture.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setSelectedFurniture((prev) =>
                            isSelected
                              ? prev.filter((f) => f !== id)
                              : [...prev, id]
                          );
                        }}
                        className={cn(
                          'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                          isSelected
                            ? 'border-foreground bg-muted'
                            : 'border-border hover:border-foreground/40'
                        )}
                      >
                        <Icon
                          className="w-6 h-6 mb-1 text-foreground"
                          strokeWidth={1.5}
                        />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI見積もりカード */}
              <EstimateCard
                furniture={selectedFurniture}
                area={location?.neighborhood || listing.area || '東京'}
                rent={rent ? parseInt(rent, 10) : undefined}
                layout={layout}
                onEstimateComplete={(suggestedFee) => {
                  setHandoverFee(suggestedFee.toString());
                }}
              />

              {/* 引き継ぎ費用入力 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  引き継ぎ費用（円） <span className="text-coral">*</span>
                </label>
                <input
                  type="number"
                  placeholder="例: 50000"
                  value={handoverFee}
                  onChange={(e) => setHandoverFee(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  家具・インテリアの引き継ぎにかかる費用
                </p>
              </div>
            </div>
          </section>

          {/* 家具 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">引き継ぐ家具</h2>
            <p className="text-sm text-muted-foreground mb-4">
              次の入居者に引き継ぎたい大型家具を選んでください
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LARGE_FURNITURE_ITEMS.map(({ id, label, Icon }) => {
                const isSelected = selectedFurniture.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFurniture(
                          selectedFurniture.filter((f) => f !== id)
                        );
                      } else {
                        setSelectedFurniture([...selectedFurniture, id]);
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center p-4 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-foreground/40'
                    )}
                  >
                    <Icon
                      className="w-8 h-8 mb-2 text-foreground"
                      strokeWidth={1.5}
                    />
                    <span className="text-sm font-medium text-center">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* 写真アップロードダイアログ */}
      {uploadDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeUploadDialog}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <button
                onClick={closeUploadDialog}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center flex-1">
                <h2 className="text-base font-semibold">
                  写真をアップロードする
                </h2>
                <p className="text-sm text-muted-foreground">
                  {pendingPhotos.length > 0
                    ? `${pendingPhotos.length}枚選択中`
                    : 'アイテムが選択されていません'}
                </p>
              </div>
              <label className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted cursor-pointer">
                <Plus className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelect(e.target.files)}
                />
              </label>
            </div>

            <div className="p-6">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-16 h-16 mb-4">
                    <svg
                      className="w-full h-full animate-spin"
                      viewBox="0 0 50 50"
                    >
                      <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#E5E5E5"
                        strokeWidth="4"
                      />
                      <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#222222"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="80, 200"
                        strokeDashoffset="0"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-foreground">
                    アップロード中...
                  </p>
                </div>
              ) : pendingPhotos.length > 0 || isLoadingFiles ? (
                <div
                  className="overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div
                    className="flex gap-3"
                    style={{ minWidth: 'min-content' }}
                  >
                    {pendingPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative flex-shrink-0 w-40 h-40 rounded-xl overflow-hidden group"
                      >
                        <img
                          src={photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePendingPhoto(index)}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
                            カバー
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoadingFiles && (
                      <div className="flex-shrink-0 w-40 h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30">
                        <div className="relative w-10 h-10 mb-2">
                          <svg
                            className="w-full h-full animate-spin"
                            viewBox="0 0 50 50"
                          >
                            <circle
                              cx="25"
                              cy="25"
                              r="20"
                              fill="none"
                              stroke="#E5E5E5"
                              strokeWidth="4"
                            />
                            <circle
                              cx="25"
                              cy="25"
                              r="20"
                              fill="none"
                              stroke="#222222"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray="80, 200"
                              strokeDashoffset="0"
                            />
                          </svg>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          読み込み中...
                        </span>
                      </div>
                    )}
                    {!isLoadingFiles && (
                      <label className="flex-shrink-0 w-40 h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer">
                        <Plus className="w-8 h-8 mb-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          追加
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFilesSelect(e.target.files)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                  <div className="flex justify-center mb-4">
                    <svg
                      className="w-16 h-16 text-muted-foreground"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <g transform="rotate(-8, 20, 32)">
                        <rect x="4" y="12" width="32" height="26" rx="2" />
                      </g>
                      <g transform="rotate(6, 44, 32)">
                        <rect
                          x="28"
                          y="10"
                          width="32"
                          height="26"
                          rx="2"
                          fill="white"
                        />
                        <circle cx="36" cy="18" r="3" />
                      </g>
                      <rect
                        x="14"
                        y="22"
                        width="36"
                        height="28"
                        rx="2"
                        fill="white"
                      />
                      <circle cx="22" cy="30" r="3" />
                      <path d="M14 44l10-8 6 5 12-10 8 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-1">ドラッグ＆ドロップ</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    または写真を参照してください
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFilesSelect(e.target.files)}
                    />
                    <span className="inline-block px-6 py-3 bg-foreground text-white rounded-lg font-medium cursor-pointer hover:bg-foreground/90">
                      参照
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <button
                onClick={closeUploadDialog}
                className="text-sm font-medium text-foreground underline hover:no-underline"
              >
                閉じる
              </button>
              <Button
                onClick={handleUploadConfirm}
                disabled={pendingPhotos.length === 0 || isUploading}
                className={cn(
                  'rounded-lg px-6 py-2 text-sm font-medium',
                  pendingPhotos.length > 0
                    ? 'bg-foreground text-white hover:bg-foreground/90'
                    : 'bg-[#DDDDDD] text-muted-foreground cursor-not-allowed'
                )}
              >
                アップロード
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
