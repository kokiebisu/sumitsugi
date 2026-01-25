"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { LargeFurnitureType } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { LocationPicker, type StationInfo, type LocationWithAddress } from "@/components/location-picker";
import { EstimateCard } from "@/components/estimate-card";
import { SingleDatePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import {
  X,
  Plus,
  BedDouble,
  Sofa,
  Monitor,
  Archive,
  Table2,
  Shirt,
  Tv,
  Refrigerator,
  Users,
} from "lucide-react";

// 間取りの選択肢
const LAYOUT_OPTIONS = [
  "1R",
  "1K",
  "1DK",
  "1LDK",
  "2K",
  "2DK",
  "2LDK",
  "3K",
  "3DK",
  "3LDK",
  "4K",
  "4DK",
  "4LDK",
];

// 居住人数の選択肢
const OCCUPANTS_OPTIONS = [
  { value: "1", label: "1人" },
  { value: "2", label: "2人" },
  { value: "3", label: "3人" },
  { value: "4", label: "4人以上" },
];

// 引き継ぎ対象の大型家具
const FURNITURE_ITEMS = [
  { id: "bed", label: "ベッド", Icon: BedDouble },
  { id: "sofa", label: "ソファ", Icon: Sofa },
  { id: "desk", label: "デスク", Icon: Monitor },
  { id: "storage", label: "収納", Icon: Archive },
  { id: "table", label: "テーブル", Icon: Table2 },
  { id: "wardrobe", label: "ワードローブ", Icon: Shirt },
  { id: "tv", label: "テレビ台", Icon: Tv },
  { id: "fridge", label: "冷蔵庫", Icon: Refrigerator },
];

export default function NewListingPage() {
  const { user, isLoading, addListing } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [roomPhotos, setRoomPhotos] = useState<string[]>([]);
  const [handoverFee, setHandoverFee] = useState<string>("");
  const [rent, setRent] = useState<string>("");
  const [layout, setLayout] = useState<string>("");
  const [location, setLocation] = useState<LocationWithAddress | null>(null);
  const [managementFee, setManagementFee] = useState<string>("");
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [viewingDate, setViewingDate] = useState<Date | null>(null);
  const [viewingEndDate, setViewingEndDate] = useState<Date | null>(null);
  const [moveInDate, setMoveInDate] = useState<Date | null>(null);
  const [moveInEndDate, setMoveInEndDate] = useState<Date | null>(null);
  const [stations, setStations] = useState<StationInfo[]>([
    { name: "", walkingMinutes: "" },
  ]);
  const [occupants, setOccupants] = useState<string>("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const totalSteps = 7;

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

  // 住所詳細が入力されているかチェック
  const hasDetailedAddress = () => {
    const address = location?.address;
    return Boolean(address?.streetAddress && address?.buildingInfo);
  };

  // タイトルを自動生成
  const generateTitle = () => {
    // 間取りから暮らしタイプを判定
    const getLivingType = () => {
      if (!layout) return "";
      // 1R, 1K, 1DK, 1LDK は一人暮らし
      if (layout.startsWith("1")) return "一人暮らしの";
      // 2K, 2DK, 2LDK は二人暮らし
      if (layout.startsWith("2")) return "二人暮らしの";
      // 3K以上はファミリー向け
      return "ファミリー向けの";
    };

    const livingType = getLivingType();

    // エリア名を取得（区名や市名など短い形式で）
    const getAreaName = () => {
      if (location?.neighborhood) {
        // "渋谷区渋谷" -> "渋谷"、"世田谷区三軒茶屋" -> "三軒茶屋" のように区以降を取得
        const match = location.neighborhood.match(/区(.+)$/);
        if (match) return match[1];
        return location.neighborhood;
      }
      return null;
    };

    const areaName = getAreaName();
    if (areaName) {
      return `${areaName}の${livingType}部屋`;
    }
    return `${livingType}あなたの部屋`;
  };

  // 日付を文字列にフォーマット（単体なら「〇〇日以降」、範囲なら「〇〇日 - 〇〇日」）
  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start) return undefined;
    const formatDate = (d: Date) =>
      d.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    if (end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    return `${formatDate(start)}以降`;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // ステップ7: 住所詳細が入力されていれば公開、そうでなければ下書き保存
      const shouldPublish = hasDetailedAddress();
      addListing({
        status: shouldPublish ? "published" : "draft",
        title: generateTitle(),
        roomStyle: null,
        roomPhotos,
        handoverFee: handoverFee ? parseInt(handoverFee, 10) : undefined,
        rent: rent ? parseInt(rent, 10) : undefined,
        managementFee: managementFee ? parseInt(managementFee, 10) : undefined,
        layout: layout || undefined,
        occupants: occupants ? parseInt(occupants, 10) : undefined,
        area: location?.neighborhood || "東京",
        furniture:
          selectedFurniture.length > 0
            ? (selectedFurniture as LargeFurnitureType[])
            : undefined,
        viewingAvailableFrom: formatDateRange(viewingDate, viewingEndDate),
        moveInAvailableFrom: formatDateRange(moveInDate, moveInEndDate),
        stations: stations
          .filter((s) => s.name)
          .map((s) => ({
            name: s.name,
            walkingMinutes: s.walkingMinutes
              ? parseInt(s.walkingMinutes, 10)
              : 0,
          })),
      });

      // 公開・下書きどちらも部屋一覧へ遷移
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
    const hasData = roomPhotos.length > 0 || handoverFee.length > 0;

    if (hasData) {
      addListing({
        status: "draft",
        title: generateTitle(),
        roomStyle: null,
        roomPhotos,
        handoverFee: handoverFee ? parseInt(handoverFee, 10) : undefined,
        rent: rent ? parseInt(rent, 10) : undefined,
        managementFee: managementFee ? parseInt(managementFee, 10) : undefined,
        layout: layout || undefined,
        area: location?.neighborhood || "東京",
        furniture:
          selectedFurniture.length > 0
            ? (selectedFurniture as LargeFurnitureType[])
            : undefined,
        viewingAvailableFrom: formatDateRange(viewingDate, viewingEndDate),
        moveInAvailableFrom: formatDateRange(moveInDate, moveInEndDate),
        stations: stations
          .filter((s) => s.name)
          .map((s) => ({
            name: s.name,
            walkingMinutes: s.walkingMinutes
              ? parseInt(s.walkingMinutes, 10)
              : 0,
          })),
      });
    }

    router.push("/listing");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return roomPhotos.length >= 5;
      case 3:
        return location !== null;
      case 4:
        return rent.length > 0 && layout.length > 0;
      case 5:
        return true; // スケジュールは任意
      case 6:
        return selectedFurniture.length > 0 && handoverFee.length > 0;
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
        <div className="w-full max-w-7xl px-6 py-12 md:px-12">
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
                お部屋の写真やエリア、引き継ぎたい家具などの情報を入力して、次の住人を見つけましょう。
              </p>
            </div>
          )}

          {/* ステップ2: 部屋の写真 */}
          {currentStep === 2 && (
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
                お部屋の魅力が伝わる写真を5枚追加してください
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
                    roomPhotos.length === 0 && "justify-center",
                  )}
                  style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    paddingLeft:
                      roomPhotos.length === 0
                        ? "2rem"
                        : "max(2rem, calc((100vw - 1200px) / 2))",
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
                    <div
                      className="flex-shrink-0"
                      style={{ width: "max(2rem, calc((100vw - 1200px) / 2))" }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
              <div className="text-center mt-4">
                <p
                  className={`text-sm font-medium ${roomPhotos.length >= 3 ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {roomPhotos.length} / 5 枚（最低5枚必要）
                  {roomPhotos.length >= 3 ? " ✓" : ""}
                </p>
              </div>
            </div>
          )}

          {/* ステップ3: エリア選択 */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center w-full">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                エリア
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center">
                地図をクリックして場所を指定してください
              </p>
              <div className="w-full max-w-2xl">
                <LocationPicker
                  onLocationSelect={setLocation}
                  initialLocation={location ? { lat: location.lat, lng: location.lng } : undefined}
                  initialAddress={location?.address}
                  initialNeighborhood={location?.neighborhood}
                  stations={stations}
                  onStationsChange={setStations}
                />
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
                          "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                          layout === option
                            ? "border-foreground bg-foreground text-white"
                            : "border-border hover:border-foreground/40",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    何人で住んでいましたか？
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OCCUPANTS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setOccupants(option.value)}
                        className={cn(
                          "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                          occupants === option.value
                            ? "border-foreground bg-foreground text-white"
                            : "border-border hover:border-foreground/40",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ステップ5: 引き継ぎスケジュール */}
          {currentStep === 5 && (
            <div className="flex flex-col items-center w-full">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                引き継ぎスケジュール
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center">
                内見可能日と引き継ぎ可能日を選択
              </p>

              <div className="w-full space-y-8">
                {/* 内見可能日 */}
                <div>
                  <SingleDatePicker
                    selectedDate={viewingDate}
                    endDate={viewingEndDate}
                    onDateChange={(start, end) => {
                      setViewingDate(start);
                      setViewingEndDate(end ?? null);
                    }}
                    title={
                      viewingDate && viewingEndDate
                        ? `${viewingDate.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })} - ${viewingEndDate.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}`
                        : viewingDate
                        ? `${viewingDate.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}以降`
                        : "内見可能日を選択"
                    }
                    subtitle={viewingEndDate ? undefined : "この日以降、内見を受け付けます"}
                  />
                </div>

                {/* 引き継ぎ可能日 */}
                <div>
                  <SingleDatePicker
                    selectedDate={moveInDate}
                    endDate={moveInEndDate}
                    onDateChange={(start, end) => {
                      setMoveInDate(start);
                      setMoveInEndDate(end ?? null);
                    }}
                    title={
                      moveInDate && moveInEndDate
                        ? `${moveInDate.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })} - ${moveInEndDate.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}`
                        : moveInDate
                        ? `${moveInDate.toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}以降`
                        : "引き継ぎ可能日を選択"
                    }
                    subtitle={moveInEndDate ? undefined : "この日以降、引き継ぎが可能です"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ステップ6: 引き継ぎ費用 */}
          {currentStep === 6 && (
            <div className="flex flex-col items-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                引き継ぎ費用
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center">
                家具を選んで、引き継ぎ費用を決めましょう
              </p>
              <div className="w-full max-w-md space-y-6">
                {/* 大型家具チェック */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    引き継ぐ大型家具（複数選択可） <span className="text-coral">*</span>
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
                                : [...prev, id],
                            );
                          }}
                          className={cn(
                            "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                            isSelected
                              ? "border-foreground bg-muted"
                              : "border-border hover:border-foreground/40",
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
                  area={location?.neighborhood || "東京"}
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
            </div>
          )}

          {/* ステップ7: プレビュー */}
          {currentStep === 7 && (
            <div className="w-full">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                プレビュー
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center">
                内容を確認して、部屋を公開しましょう
              </p>

              {/* 住所詳細未入力の警告 */}
              {!hasDetailedAddress() && (
                <div className="max-w-4xl mx-auto mb-6">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">
                        住所の詳細が入力されていません
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        内覧調整のため、番地と建物名の入力をお願いします。この情報は一般公開されません。
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        このまま登録すると下書きとして保存され、住所入力後に公開できます。
                      </p>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="mt-3 px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                      >
                        住所を入力する
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* プレビューコンテンツ - 物件詳細と同じレイアウト */}
              <div className="max-w-4xl mx-auto">
                {/* 画像ギャラリー */}
                {roomPhotos.length > 0 && (
                  <div className="mb-6">
                    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-xl overflow-hidden">
                      <div className="col-span-2 row-span-2">
                        <img
                          src={roomPhotos[0]}
                          alt="メイン画像"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {roomPhotos.slice(1, 5).map((photo, index) => (
                        <div key={index} className="col-span-1 row-span-1">
                          <img
                            src={photo}
                            alt={`画像 ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* タイトルと場所 */}
                <div className="pb-6 border-b border-border">
                  <h2 className="text-[26px] font-medium text-foreground">
                    {generateTitle()}
                  </h2>
                  <p className="mt-1 text-base font-normal text-foreground">
                    {[location?.neighborhood, layout]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                </div>

                {/* 家具セクション */}
                {selectedFurniture.length > 0 && (
                  <section className="py-8 border-b border-border">
                    <h3 className="mb-4 text-xl font-semibold text-foreground">
                      引き継ぎできる大型家具
                    </h3>
                    <div className="flex gap-6">
                      {selectedFurniture.map((furnitureId) => {
                        const item = FURNITURE_ITEMS.find(
                          (f) => f.id === furnitureId
                        );
                        if (!item) return null;
                        const Icon = item.Icon;
                        return (
                          <div
                            key={furnitureId}
                            className="flex flex-col items-center gap-2"
                          >
                            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                              <Icon
                                className="h-7 w-7 text-foreground"
                                strokeWidth={1.5}
                              />
                            </div>
                            <span className="text-sm text-foreground">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* 物件情報 */}
                <section className="py-8 border-b border-border">
                  <h3 className="mb-6 text-xl font-semibold text-foreground">
                    物件情報
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {layout && (
                      <div className="flex items-start gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-0.5">
                            間取り
                          </p>
                          <p className="text-base font-semibold text-foreground">
                            {layout}
                          </p>
                        </div>
                      </div>
                    )}
                    {location?.neighborhood && (
                      <div className="flex items-start gap-3">
                        <Archive className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-0.5">
                            エリア
                          </p>
                          <p className="text-base font-semibold text-foreground">
                            {location.neighborhood}
                          </p>
                        </div>
                      </div>
                    )}
                    {rent && (
                      <div className="flex items-start gap-3">
                        <Table2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-0.5">
                            家賃
                          </p>
                          <p className="text-base font-semibold text-foreground">
                            {parseInt(rent, 10).toLocaleString()}円/月
                          </p>
                        </div>
                      </div>
                    )}
                    {handoverFee && (
                      <div className="flex items-start gap-3">
                        <Shirt className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-0.5">
                            引き継ぎ費用
                          </p>
                          <p className="text-base font-semibold text-foreground">
                            {parseInt(handoverFee, 10).toLocaleString()}円
                          </p>
                        </div>
                      </div>
                    )}
                    {occupants && (
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-0.5">
                            居住人数
                          </p>
                          <p className="text-base font-semibold text-foreground">
                            {occupants === "4" ? "4人以上" : `${occupants}人`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* 引き継ぎスケジュール */}
                {(viewingDate || moveInDate) && (
                  <section className="py-8">
                    <h3 className="mb-6 text-xl font-semibold text-foreground">
                      引き継ぎスケジュール
                    </h3>
                    <div className="space-y-4">
                      {viewingDate && (
                        <div className="flex items-start gap-3">
                          <Tv className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              内見可能日
                            </p>
                            <p className="text-base text-foreground">
                              {formatDateRange(viewingDate, viewingEndDate)}
                            </p>
                          </div>
                        </div>
                      )}
                      {moveInDate && (
                        <div className="flex items-start gap-3">
                          <Refrigerator className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              引き継ぎ可能日
                            </p>
                            <p className="text-base text-foreground">
                              {formatDateRange(moveInDate, moveInEndDate)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
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
            className={`rounded-lg px-6 py-3 text-base font-medium text-white h-12 disabled:opacity-50 ${
              currentStep === totalSteps && hasDetailedAddress()
                ? "bg-[#E61E4D] hover:bg-[#D01346]"
                : "bg-[#222222] hover:bg-[#000000]"
            }`}
          >
            {currentStep === totalSteps
              ? hasDetailedAddress()
                ? "公開する"
                : "登録する"
              : "次へ"}
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
