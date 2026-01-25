"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { LargeFurnitureType } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Leaf,
  Sparkles,
  TreePine,
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
  Waves,
  BedDouble,
  Sofa,
  Monitor,
  Archive,
  UtensilsCrossed,
  Shirt,
  Tv,
  Refrigerator,
} from "lucide-react";

// 引き継ぎ対象の大型家具
const FURNITURE_ITEMS = [
  { id: "bed", label: "ベッド", Icon: BedDouble },
  { id: "sofa", label: "ソファ", Icon: Sofa },
  { id: "desk", label: "デスク", Icon: Monitor },
  { id: "storage", label: "収納", Icon: Archive },
  { id: "dining", label: "ダイニング", Icon: UtensilsCrossed },
  { id: "wardrobe", label: "ワードローブ", Icon: Shirt },
  { id: "tv", label: "テレビ台", Icon: Tv },
  { id: "fridge", label: "冷蔵庫", Icon: Refrigerator },
];

// お部屋のスタイル・テイスト
const ROOM_STYLES = [
  { id: "nordic", label: "北欧風", Icon: TreePine },
  { id: "modern", label: "モダン", Icon: Sparkles },
  { id: "vintage", label: "ヴィンテージ", Icon: Clock },
  { id: "minimal", label: "ミニマル", Icon: Frame },
  { id: "industrial", label: "インダストリアル", Icon: Briefcase },
  { id: "natural", label: "ナチュラル", Icon: Leaf },
  { id: "japanese", label: "和モダン", Icon: Moon },
  { id: "bohemian", label: "ボヘミアン", Icon: Flower2 },
  { id: "coastal", label: "コースタル・海辺", Icon: Waves },
  { id: "midcentury", label: "ミッドセンチュリー", Icon: Armchair },
  { id: "rustic", label: "ラスティック", Icon: Mountain },
  { id: "contemporary", label: "コンテンポラリー", Icon: Lamp },
];

export default function NewListingPage() {
  const { user, isLoading, addListing } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoomStyle, setSelectedRoomStyle] = useState<string | null>(null);
  const [roomPhotos, setRoomPhotos] = useState<string[]>([]);
  const [handoverFee, setHandoverFee] = useState<string>("");
  const [rent, setRent] = useState<string>("");
  const [layout, setLayout] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [managementFee, setManagementFee] = useState<string>("");
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [viewingAvailableFrom, setViewingAvailableFrom] = useState<string>("");
  const [moveInAvailableFrom, setMoveInAvailableFrom] = useState<string>("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const totalSteps = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // リスティングを作成して公開
      const roomStyleLabel = ROOM_STYLES.find(s => s.id === selectedRoomStyle)?.label || "";
      const title = roomStyleLabel ? `${roomStyleLabel}スタイルの暮らし` : "私の暮らし";

      addListing({
        status: "published",
        title,
        roomStyle: selectedRoomStyle,
        roomPhotos,
        handoverFee: handoverFee ? parseInt(handoverFee, 10) : undefined,
        rent: rent ? parseInt(rent, 10) : undefined,
        managementFee: managementFee ? parseInt(managementFee, 10) : undefined,
        layout: layout || undefined,
        area: area || undefined,
        furniture: selectedFurniture.length > 0 ? selectedFurniture as LargeFurnitureType[] : undefined,
        viewingAvailableFrom: viewingAvailableFrom || undefined,
        moveInAvailableFrom: moveInAvailableFrom || undefined,
        publishedAt: new Date().toISOString(),
      });

      router.push("/listing");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/listing");
    }
  };

  const handleSaveAndExit = () => {
    const hasData =
      selectedRoomStyle !== null ||
      roomPhotos.length > 0 ||
      handoverFee.length > 0;

    if (hasData) {
      const roomStyleLabel = ROOM_STYLES.find(s => s.id === selectedRoomStyle)?.label || "";
      const title = roomStyleLabel ? `${roomStyleLabel}スタイルの暮らし` : "私の暮らし";

      addListing({
        status: "draft",
        title,
        roomStyle: selectedRoomStyle,
        roomPhotos,
        handoverFee: handoverFee ? parseInt(handoverFee, 10) : undefined,
        rent: rent ? parseInt(rent, 10) : undefined,
        managementFee: managementFee ? parseInt(managementFee, 10) : undefined,
        layout: layout || undefined,
        area: area || undefined,
        furniture: selectedFurniture.length > 0 ? selectedFurniture as LargeFurnitureType[] : undefined,
        viewingAvailableFrom: viewingAvailableFrom || undefined,
        moveInAvailableFrom: moveInAvailableFrom || undefined,
      });
    }

    router.push("/listing");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return selectedRoomStyle !== null;
      case 3:
        return roomPhotos.length >= 3;
      case 4:
        return handoverFee.length > 0 && rent.length > 0 && layout.length > 0;
      default:
        return true;
    }
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

  if (isLoading || isInitialLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-coral">
            tsumugi
          </span>
        </Link>
        <Button
          variant="outline"
          className="rounded-full px-4 py-2 text-sm font-medium border-gray-300"
          onClick={handleSaveAndExit}
        >
          保存して終了
        </Button>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-3xl px-6 py-12 md:px-12">
          <p className="text-base font-medium text-foreground mb-4 text-center">
            ステップ {currentStep}
          </p>

          {/* ステップ1: イントロ */}
          {currentStep === 1 && (
            <div className="text-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-6 leading-[1.15]"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                暮らしを引き継ぐ
              </h1>
              <p className="text-lg text-foreground leading-relaxed max-w-xl mx-auto">
                あなたの暮らしを次の人へ引き継ぐための情報を入力しましょう。部屋のスタイル、ストーリー、引き継ぎたい家具などを共有できます。
              </p>
            </div>
          )}

          {/* ステップ2: お部屋のテイスト */}
          {currentStep === 2 && (
            <div className="flex flex-col items-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                お部屋のテイストは？
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center">
                インテリアのテイストを選んでください
              </p>
              <div className="relative h-[360px] w-full max-w-xl">
                <div
                  className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 overflow-y-auto py-12 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    {ROOM_STYLES.map(({ id, label, Icon }) => {
                      const isSelected = selectedRoomStyle === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setSelectedRoomStyle(id)}
                          className={cn(
                            "flex flex-col items-start p-5 rounded-xl border-2 transition-all text-left",
                            isSelected
                              ? "border-foreground bg-muted"
                              : "border-border hover:border-foreground/40",
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
                <div
                  className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
              </div>
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          )}

          {/* ステップ3: 部屋の写真 */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center w-full">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                部屋の写真を追加
              </h1>
              <p className="text-lg text-muted-foreground mb-6 text-center max-w-lg">
                お部屋の魅力が伝わる写真を3枚以上追加してください
              </p>
              <div className="w-screen relative -mx-6 md:-mx-12">
                <div
                  className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
                <div
                  className={cn(
                    "flex gap-5 overflow-x-auto py-2 scrollbar-hide",
                    roomPhotos.length === 0 && "justify-center"
                  )}
                  style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    paddingLeft: roomPhotos.length === 0 ? "2rem" : "max(2rem, calc((100vw - 1200px) / 2))",
                  }}
                >
                  {roomPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden group"
                      style={{ scrollSnapAlign: "center" }}
                    >
                      <img
                        src={photo}
                        alt={`部屋 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeRoomPhoto(index)}
                        className="absolute top-4 right-4 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/70 rounded-lg text-sm text-white font-medium">
                          カバー写真
                        </div>
                      )}
                    </div>
                  ))}
                  {roomPhotos.length < 5 && (
                    <button
                      onClick={openUploadDialog}
                      className="flex-shrink-0 w-[400px] h-[280px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer"
                      style={{ scrollSnapAlign: "center" }}
                    >
                      <Plus className="w-10 h-10 mb-2 text-muted-foreground" />
                      <span className="text-base text-muted-foreground font-medium">
                        写真を追加
                      </span>
                    </button>
                  )}
                  {roomPhotos.length > 0 && (
                    <div className="flex-shrink-0" style={{ width: 'max(2rem, calc((100vw - 1200px) / 2))' }} aria-hidden="true" />
                  )}
                </div>
              </div>
              <div className="text-center mt-4">
                <p
                  className={`text-sm font-medium ${roomPhotos.length >= 3 ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {roomPhotos.length} / 5 枚（最低3枚必要）
                  {roomPhotos.length >= 3 ? " ✓" : ""}
                </p>
              </div>
            </div>
          )}

          {/* ステップ4: 費用・物件情報 */}
          {currentStep === 4 && (
            <div className="flex flex-col items-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                費用と物件情報
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center">
                今わかる範囲で大丈夫です
              </p>
              <div className="w-full max-w-md space-y-6">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      間取り <span className="text-coral">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="例: 1K"
                      value={layout}
                      onChange={(e) => setLayout(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      エリア
                    </label>
                    <input
                      type="text"
                      placeholder="例: 東京"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>
                </div>

                {/* 大型家具チェック */}
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    引き継ぐ大型家具（複数選択可）
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {FURNITURE_ITEMS.map(({ id, label, Icon }) => {
                      const isSelected = selectedFurniture.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSelectedFurniture(prev =>
                              isSelected
                                ? prev.filter(f => f !== id)
                                : [...prev, id]
                            );
                          }}
                          className={cn(
                            "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                            isSelected
                              ? "border-foreground bg-muted"
                              : "border-border hover:border-foreground/40"
                          )}
                        >
                          <Icon className="w-6 h-6 mb-1 text-foreground" strokeWidth={1.5} />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 引き継ぎスケジュール */}
                <div className="pt-4 border-t border-border">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    引き継ぎスケジュール
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-2">
                        内見可能日
                      </label>
                      <input
                        type="text"
                        placeholder="例: 2026年2月1日〜"
                        value={viewingAvailableFrom}
                        onChange={(e) => setViewingAvailableFrom(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-2">
                        引き継ぎ可能日
                      </label>
                      <input
                        type="text"
                        placeholder="例: 2026年3月1日〜"
                        value={moveInAvailableFrom}
                        onChange={(e) => setMoveInAvailableFrom(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ステップ5: 公開準備完了 */}
          {currentStep === 5 && (
            <div className="text-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-6 leading-[1.15]"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                公開準備完了
              </h1>
              <p className="text-lg text-foreground leading-relaxed max-w-xl mx-auto">
                内容を確認して、リスティングを公開しましょう。
              </p>
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-200">
        <div className="flex">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className="h-[2px] flex-1"
              style={{
                backgroundColor: index < currentStep ? "#222222" : "#DDDDDD",
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 md:px-12">
          <button
            onClick={handleBack}
            className="text-base font-medium text-foreground underline hover:no-underline"
          >
            戻る
          </button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="rounded-lg bg-[#222222] px-6 py-3 text-base font-medium text-white hover:bg-[#000000] h-12 disabled:opacity-50"
          >
            {currentStep === totalSteps ? "公開する" : "次へ"}
          </Button>
        </div>
      </footer>

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
                    : "アイテムが選択されていません"}
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
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div
                    className="flex gap-3"
                    style={{ minWidth: "min-content" }}
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
                  "rounded-lg px-6 py-2 text-sm font-medium",
                  pendingPhotos.length > 0
                    ? "bg-foreground text-white hover:bg-foreground/90"
                    : "bg-[#DDDDDD] text-muted-foreground cursor-not-allowed",
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
