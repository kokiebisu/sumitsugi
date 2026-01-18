"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
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
  Bike,
  Mountain,
  Waves,
  Film,
  Shirt,
  Headphones,
  Tv,
  Lamp,
  Armchair,
  Bath,
  Moon,
  Sun,
  Heart,
  Flower2,
  Briefcase,
  GraduationCap,
  Tent,
  Guitar,
  Upload,
  X,
  Plus,
  Wifi,
  Monitor,
  Refrigerator,
  WashingMachine,
  Microwave,
  AirVent,
  Car,
  Snowflake,
  ParkingCircle,
  BedDouble,
  Table,
  BookOpen,
  Frame,
  Clock,
  Fan,
  Utensils,
  CookingPot,
  Blinds,
  Archive,
  Speaker,
  Printer,
  LucideIcon,
} from "lucide-react";

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

// ライフスタイル（アイコン付き）
const LIFESTYLES = [
  { id: "dj", label: "DJ・音楽", Icon: Music },
  { id: "art", label: "アート", Icon: Palette },
  { id: "plant", label: "植物・ボタニカル", Icon: Leaf },
  { id: "cafe", label: "カフェ風", Icon: Coffee },
  { id: "reading", label: "読書・書斎", Icon: Book },
  { id: "photo", label: "写真・映像", Icon: Camera },
  { id: "fitness", label: "フィットネス", Icon: Dumbbell },
  { id: "gaming", label: "ゲーミング", Icon: Gamepad2 },
  { id: "cooking", label: "料理好き", Icon: UtensilsCrossed },
  { id: "wine", label: "ワイン・お酒", Icon: Wine },
  { id: "travel", label: "旅行・海外", Icon: Plane },
  { id: "pet", label: "ペットと暮らす", Icon: Cat },
  { id: "family", label: "ファミリー向け", Icon: Baby },
  { id: "minimal", label: "ミニマル", Icon: Sparkles },
  { id: "scandinavian", label: "北欧", Icon: TreePine },
  { id: "vintage", label: "ヴィンテージ", Icon: Sofa },
  { id: "cycling", label: "サイクリング", Icon: Bike },
  { id: "outdoor", label: "アウトドア", Icon: Mountain },
  { id: "surf", label: "サーフィン・海", Icon: Waves },
  { id: "movie", label: "映画鑑賞", Icon: Film },
  { id: "fashion", label: "ファッション", Icon: Shirt },
  { id: "audio", label: "オーディオ", Icon: Headphones },
  { id: "theater", label: "ホームシアター", Icon: Tv },
  { id: "lighting", label: "照明・間接照明", Icon: Lamp },
  { id: "lounge", label: "ラウンジ風", Icon: Armchair },
  { id: "spa", label: "スパ・リラックス", Icon: Bath },
  { id: "night", label: "夜型・バー風", Icon: Moon },
  { id: "morning", label: "朝活・朝型", Icon: Sun },
  { id: "wellness", label: "ウェルネス", Icon: Heart },
  { id: "garden", label: "ガーデニング", Icon: Flower2 },
  { id: "work", label: "リモートワーク", Icon: Briefcase },
  { id: "study", label: "勉強・資格", Icon: GraduationCap },
  { id: "camp", label: "キャンプ", Icon: Tent },
  { id: "instrument", label: "楽器演奏", Icon: Guitar },
];

// アメニティ・設備
const POPULAR_AMENITIES = [
  { id: "wifi", label: "Wi-Fi", Icon: Wifi },
  { id: "tv", label: "テレビ", Icon: Tv },
  { id: "kitchen", label: "フルキッチン", Icon: UtensilsCrossed },
  { id: "washingMachine", label: "洗濯機", Icon: WashingMachine },
  { id: "parking", label: "駐車場", Icon: ParkingCircle },
  { id: "aircon", label: "エアコン", Icon: AirVent },
  { id: "workspace", label: "仕事専用スペース", Icon: Monitor },
];

const STANDOUT_AMENITIES = [
  { id: "bathtub", label: "バスタブ", Icon: Bath },
  { id: "refrigerator", label: "冷蔵庫", Icon: Refrigerator },
  { id: "microwave", label: "電子レンジ", Icon: Microwave },
  { id: "balcony", label: "バルコニー", Icon: Sun },
  { id: "closet", label: "収納", Icon: Briefcase },
  { id: "flooring", label: "フローリング", Icon: Sofa },
];

// 家具・インテリアアイテム
const FURNITURE_ITEMS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "bed", label: "ベッド", Icon: BedDouble },
  { id: "sofa", label: "ソファ", Icon: Sofa },
  { id: "table", label: "テーブル", Icon: Table },
  { id: "chair", label: "チェア", Icon: Armchair },
  { id: "desk", label: "デスク", Icon: Monitor },
  { id: "shelf", label: "シェルフ・棚", Icon: BookOpen },
  { id: "tv", label: "テレビ", Icon: Tv },
  { id: "tvstand", label: "テレビ台", Icon: Archive },
  { id: "lamp", label: "照明・ランプ", Icon: Lamp },
  { id: "curtain", label: "カーテン", Icon: Blinds },
  { id: "rug", label: "ラグ・カーペット", Icon: Frame },
  { id: "mirror", label: "ミラー", Icon: Frame },
  { id: "clock", label: "時計", Icon: Clock },
  { id: "art", label: "アート・絵画", Icon: Palette },
  { id: "plant", label: "観葉植物", Icon: Leaf },
  { id: "speaker", label: "スピーカー", Icon: Speaker },
  { id: "refrigerator", label: "冷蔵庫", Icon: Refrigerator },
  { id: "washingmachine", label: "洗濯機", Icon: WashingMachine },
  { id: "microwave", label: "電子レンジ", Icon: Microwave },
  { id: "aircon", label: "エアコン", Icon: Fan },
  { id: "cookware", label: "調理器具", Icon: CookingPot },
  { id: "dinnerware", label: "食器", Icon: Utensils },
  { id: "storage", label: "収納ボックス", Icon: Archive },
  { id: "printer", label: "プリンター", Icon: Printer },
];

// インテリア写真（説明付き）
interface InteriorPhoto {
  id: string;
  photo?: string;
  caption: string;
}

export default function NewListingPage() {
  const { user, isLoading, addListing, publishListing } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const [selectedRoomStyle, setSelectedRoomStyle] = useState<string | null>(
    null,
  );
  const [story, setStory] = useState("");
  const [interiorPhotos, setInteriorPhotos] = useState<InteriorPhoto[]>([]); // 空から開始
  const [selectedFurniture, setSelectedFurniture] = useState<
    Record<string, { brand: string; model: string }>
  >({}); // { id: { brand, model } }
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [roomPhotos, setRoomPhotos] = useState<string[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [uploadTargetType, setUploadTargetType] = useState<"interior" | "room">(
    "interior",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]); // 複数画像用
  const [isInitialLoading, setIsInitialLoading] = useState(true); // スケルトン確認用
  const totalSteps = 9;

  // スケルトン確認用の2秒スリープ
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
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
      const lifestyleLabels = selectedLifestyles.map((id) => {
        const lifestyle = LIFESTYLES.find((l) => l.id === id);
        return lifestyle?.label || id;
      });
      const title =
        lifestyleLabels.length > 0
          ? `${lifestyleLabels[0]}の暮らし`
          : "私の暮らし";

      addListing({
        status: "published",
        title,
        lifestyles: selectedLifestyles,
        roomStyle: selectedRoomStyle,
        story,
        amenities: selectedAmenities,
        furniture: Object.keys(selectedFurniture),
        furnitureDetails: selectedFurniture,
        roomPhotos,
        interiorPhotos: interiorPhotos.filter((p) => p.photo || p.caption),
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
    // 何かデータが入力されている場合のみ下書き保存
    const hasData =
      selectedLifestyles.length > 0 ||
      selectedRoomStyle !== null ||
      story.trim().length > 0 ||
      roomPhotos.length > 0 ||
      interiorPhotos.length > 0 ||
      Object.keys(selectedFurniture).length > 0 ||
      selectedAmenities.length > 0;

    if (hasData) {
      const lifestyleLabels = selectedLifestyles.map((id) => {
        const lifestyle = LIFESTYLES.find((l) => l.id === id);
        return lifestyle?.label || id;
      });
      const title =
        lifestyleLabels.length > 0
          ? `${lifestyleLabels[0]}の暮らし`
          : "私の暮らし";

      addListing({
        status: "draft",
        title,
        lifestyles: selectedLifestyles,
        roomStyle: selectedRoomStyle,
        story,
        amenities: selectedAmenities,
        furniture: Object.keys(selectedFurniture),
        furnitureDetails: selectedFurniture,
        roomPhotos,
        interiorPhotos: interiorPhotos.filter((p) => p.photo || p.caption),
      });
    }

    router.push("/listing");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return selectedRoomStyle !== null;
      case 3:
        return selectedLifestyles.length > 0;
      case 4:
        return roomPhotos.length === 5; // 部屋の写真（ちょうど5枚）
      case 5:
        return story.trim().length > 0; // ストーリー（後に）
      default:
        return true;
    }
  };

  const updateInteriorPhoto = (
    id: string,
    field: keyof InteriorPhoto,
    value: string | undefined,
  ) => {
    setInteriorPhotos(
      interiorPhotos.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeInteriorPhoto = (id: string) => {
    setInteriorPhotos(interiorPhotos.filter((item) => item.id !== id));
  };

  const addInteriorPhotos = (photos: string[]) => {
    const newPhotos = photos.map((photo, index) => ({
      id: `interior_${Date.now()}_${index}`,
      photo,
      caption: "",
    }));
    setInteriorPhotos((prev) => [...prev, ...newPhotos].slice(0, 3)); // 最大3枚
  };

  const openUploadDialog = (
    id: string,
    type: "interior" | "room" = "interior",
  ) => {
    setUploadTargetId(id);
    setUploadTargetType(type);
    setUploadDialogOpen(true);
  };

  const addRoomPhoto = (photoUrl: string) => {
    setRoomPhotos([...roomPhotos, photoUrl]);
  };

  const removeRoomPhoto = (index: number) => {
    setRoomPhotos(roomPhotos.filter((_, i) => i !== index));
  };

  const closeUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadTargetId(null);
    setIsUploading(false);
    setUploadedPreview(null);
    setPendingPhotos([]);
  };

  const removePendingPhoto = (index: number) => {
    setPendingPhotos(pendingPhotos.filter((_, i) => i !== index));
  };

  const handleUploadConfirm = () => {
    if (pendingPhotos.length === 0) return;

    setIsUploading(true);
    setTimeout(() => {
      if (uploadTargetType === "room") {
        // 複数の部屋写真を追加（最大5枚まで）
        const remaining = 5 - roomPhotos.length;
        const photosToAdd = pendingPhotos.slice(0, remaining);
        setRoomPhotos([...roomPhotos, ...photosToAdd]);
      } else if (uploadTargetType === "interior") {
        // インテリア写真を複数追加
        addInteriorPhotos(pendingPhotos);
      }
      closeUploadDialog();
    }, 500);
  };

  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const handleFilesSelect = async (files: FileList | null) => {
    if (!files) return;

    setIsLoadingFiles(true);
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // 1秒のスリープを追加（読み込み再現用）
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
                リスティングの情報を入力
              </h1>
              <p className="text-lg text-foreground leading-relaxed max-w-xl mx-auto">
                あなたの暮らしを次の人へ引き継ぐための情報を入力しましょう。暮らしのスタイル、ストーリー、こだわりのインテリアなどを共有できます。
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
                {/* 上部の白グラデーション */}
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
                {/* 下部の白グラデーション */}
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

          {/* ステップ3: 暮らしのスタイル */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                普段どう過ごしている？
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center">
                複数選択可能です
              </p>
              <div className="relative h-[360px] w-full max-w-xl">
                {/* 上部の白グラデーション */}
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
                    {LIFESTYLES.map(({ id, label, Icon }) => {
                      const isSelected = selectedLifestyles.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedLifestyles(
                                selectedLifestyles.filter((l) => l !== id),
                              );
                            } else {
                              setSelectedLifestyles([
                                ...selectedLifestyles,
                                id,
                              ]);
                            }
                          }}
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
                {/* 下部の白グラデーション */}
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

          {/* ステップ4: 部屋の写真 */}
          {currentStep === 4 && (
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
                お部屋の魅力が伝わる写真を5枚以上追加してください
              </p>
              {/* 横スクロール（スナップ付き・両端ストレッチ） */}
              <div className="w-screen relative -mx-6 md:-mx-12">
                {/* 左グラデーション */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
                {/* 右グラデーション */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
                <div
                  className="flex gap-5 overflow-x-auto py-2 scrollbar-hide"
                  style={{
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    paddingLeft: "max(2rem, calc((100vw - 1200px) / 2))",
                    paddingRight: "max(2rem, calc((100vw - 1200px) / 2))",
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
                  {/* 追加ボタン（5枚未満の場合のみ表示） */}
                  {roomPhotos.length < 5 && (
                    <button
                      onClick={() => openUploadDialog("room-new", "room")}
                      className="flex-shrink-0 w-[400px] h-[280px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer"
                      style={{ scrollSnapAlign: "center" }}
                    >
                      <Plus className="w-10 h-10 mb-2 text-muted-foreground" />
                      <span className="text-base text-muted-foreground font-medium">
                        写真を追加
                      </span>
                    </button>
                  )}
                </div>
              </div>
              {/* 進捗表示 */}
              <div className="text-center mt-4">
                <p
                  className={`text-sm font-medium ${roomPhotos.length === 5 ? "text-green-600" : "text-muted-foreground"}`}
                >
                  {roomPhotos.length} / 5 枚
                  {roomPhotos.length === 5 ? " ✓" : ""}
                </p>
              </div>
            </div>
          )}

          {/* ステップ5: 暮らしのストーリー（部屋写真散りばめ） */}
          {currentStep === 5 && (
            <div className="w-full flex items-center justify-center">
              {/* 画面全体に散りばめられた写真（左右対称・4枚構成） */}
              {roomPhotos.slice(0, 4).map((photo, index) => {
                // 完全対称の配置 - 全てleftで指定して対称性を確保
                const imageWidth = 320;
                const imageHeight = 210;
                // 中央から画像中心までの距離
                const centerOffset = 480;
                // 左側: 画像の中心が中央からcenterOffset左 → left = 50% - centerOffset - imageWidth/2
                // 右側: 画像の中心が中央からcenterOffset右 → left = 50% + centerOffset - imageWidth/2
                const positions = [
                  {
                    top: "80px",
                    left: `calc(50% - ${centerOffset + imageWidth / 2}px)`,
                    rotate: -22,
                  }, // 左上
                  {
                    top: "80px",
                    left: `calc(50% + ${centerOffset - imageWidth / 2}px)`,
                    rotate: 16,
                  }, // 右上
                  {
                    top: "470px",
                    left: `calc(50% - ${centerOffset + imageWidth / 2}px - 50px)`,
                    rotate: 8,
                  }, // 左下
                  {
                    top: "380px",
                    left: `calc(50% + ${centerOffset - imageWidth / 2}px + 70px)`,
                    rotate: -16,
                  }, // 右下
                ];
                const pos = positions[index] || positions[0];
                return (
                  <div
                    key={index}
                    className="fixed rounded-2xl overflow-hidden shadow-2xl opacity-80 transition-all duration-500 pointer-events-none hidden xl:block"
                    style={{
                      top: pos.top,
                      left: pos.left,
                      width: `${imageWidth}px`,
                      height: `${imageHeight}px`,
                      transform: `rotate(${pos.rotate}deg)`,
                      zIndex: 0,
                    }}
                  >
                    <img
                      src={photo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}

              {/* 中央のコンテンツ */}
              <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto px-8">
                <h1
                  className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                  style={{
                    fontFamily:
                      '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  この暮らしのストーリー
                </h1>
                <p className="text-lg text-muted-foreground mb-8 text-center">
                  この空間での思い出や、次の入居者に伝えたいことを教えてください。
                </p>
                <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-1">
                  <Textarea
                    placeholder="例：週末は友人を招いてホームパーティーをしたり、朝は大きな窓から差し込む光の中でコーヒーを飲むのが日課でした..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="min-h-[140px] resize-none text-base p-4 rounded-xl border-0 focus:ring-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ステップ6: アメニティ・設備 */}
          {currentStep === 6 && (
            <div className="flex flex-col items-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                アメニティ・設備を選択
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center max-w-lg">
                物件に含まれる設備を選んでください
              </p>
              <div className="relative h-[400px] w-full max-w-xl">
                {/* 上部の白グラデーション */}
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
                  <div className="space-y-8">
                    {/* 人気のアメニティ */}
                    <div>
                      <h2 className="text-base font-semibold text-foreground mb-4">
                        ゲストに人気の次のアメニティ・設備はありますか？
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        {POPULAR_AMENITIES.map(({ id, label, Icon }) => {
                          const isSelected = selectedAmenities.includes(id);
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAmenities(
                                    selectedAmenities.filter((a) => a !== id),
                                  );
                                } else {
                                  setSelectedAmenities([
                                    ...selectedAmenities,
                                    id,
                                  ]);
                                }
                              }}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                                isSelected
                                  ? "border-foreground bg-muted"
                                  : "border-border hover:border-foreground/40",
                              )}
                            >
                              <Icon
                                className="w-7 h-7 text-foreground flex-shrink-0"
                                strokeWidth={1.5}
                              />
                              <span className="text-base font-medium">
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 注目を引くアメニティ */}
                    <div>
                      <h2 className="text-base font-semibold text-foreground mb-4">
                        注目を引くアメニティ・設備はありますか？
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        {STANDOUT_AMENITIES.map(({ id, label, Icon }) => {
                          const isSelected = selectedAmenities.includes(id);
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAmenities(
                                    selectedAmenities.filter((a) => a !== id),
                                  );
                                } else {
                                  setSelectedAmenities([
                                    ...selectedAmenities,
                                    id,
                                  ]);
                                }
                              }}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                                isSelected
                                  ? "border-foreground bg-muted"
                                  : "border-border hover:border-foreground/40",
                              )}
                            >
                              <Icon
                                className="w-7 h-7 text-foreground flex-shrink-0"
                                strokeWidth={1.5}
                              />
                              <span className="text-base font-medium">
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 下部の白グラデーション */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
              </div>
            </div>
          )}

          {/* ステップ7: こだわりのインテリア */}
          {currentStep === 7 && (
            <div className="flex flex-col items-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                こだわりのインテリアを見せる
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center max-w-lg">
                お気に入りのスポットや家具を紹介しましょう（任意・最大3つ）
              </p>
              <div className="w-full max-w-2xl">
                {interiorPhotos.length === 0 ? (
                  /* 写真がない場合: 中央に追加ボタン */
                  <div className="flex flex-col items-center justify-center">
                    <button
                      onClick={() =>
                        openUploadDialog("interior-new", "interior")
                      }
                      className="w-80 h-56 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer mb-6"
                    >
                      <Plus className="w-12 h-12 mb-3 text-muted-foreground" />
                      <span className="text-base text-muted-foreground font-medium">
                        写真を追加
                      </span>
                    </button>
                    <p className="text-sm text-muted-foreground">
                      スキップして後から追加することもできます
                    </p>
                  </div>
                ) : (
                  /* 写真がある場合: 縦スクロール */
                  <div className="relative h-[400px] w-full">
                    {/* 上部の白グラデーション */}
                    <div
                      className="absolute top-0 left-0 right-0 h-12 pointer-events-none z-10"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                    <div
                      className="absolute inset-0 overflow-y-auto py-6 scrollbar-hide"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <div className="space-y-6">
                        {interiorPhotos.map((item, index) => (
                          <div key={item.id} className="flex gap-4 items-start">
                            {/* 写真エリア */}
                            <div className="w-40 h-40 flex-shrink-0">
                              <div className="relative w-full h-full rounded-xl overflow-hidden">
                                <img
                                  src={item.photo}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => removeInteriorPhoto(item.id)}
                                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>
                            {/* 説明エリア */}
                            <div className="flex-1">
                              <textarea
                                placeholder={`例：${
                                  index === 0
                                    ? "朝日が入るリビングの窓辺。ここでコーヒーを飲むのが日課でした"
                                    : index === 1
                                      ? "IKEAで見つけたお気に入りのソファ。友人が来た時はここでよく映画を観ます"
                                      : index === 2
                                        ? "ヴィンテージのフロアランプ。夜は間接照明だけで過ごすのが好きです"
                                        : index === 3
                                          ? "DIYで作った本棚。お気に入りの本が並んでいます"
                                          : "キッチンのスパイスラック。料理好きには欠かせないコーナーです"
                                }`}
                                value={item.caption}
                                onChange={(e) =>
                                  updateInteriorPhoto(
                                    item.id,
                                    "caption",
                                    e.target.value,
                                  )
                                }
                                className="w-full h-full min-h-[160px] px-4 py-3 border-2 border-border rounded-xl text-sm resize-none focus:outline-none focus:border-foreground"
                              />
                            </div>
                          </div>
                        ))}
                        {/* 追加ボタン（3枚未満の場合） */}
                        {interiorPhotos.length < 3 && (
                          <button
                            onClick={() =>
                              openUploadDialog("interior-new", "interior")
                            }
                            className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-foreground/40 transition-colors cursor-pointer"
                          >
                            <Plus className="w-8 h-8 mb-2 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground font-medium">
                              写真を追加
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                    {/* 下部の白グラデーション */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                      }}
                    />
                  </div>
                )}
                {/* 進捗表示 */}
                {interiorPhotos.length > 0 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      {interiorPhotos.length} / 3 枚
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ステップ8: 家具・インテリアを追加 */}
          {currentStep === 8 && (
            <div className="flex flex-col items-center relative">
              <h1
                className="text-[48px] font-medium text-foreground mb-3 leading-[1.15] text-center"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                家具・インテリアを追加
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-center max-w-lg">
                引き継ぎたい家具やインテリアアイテムを選択してください
              </p>
              <div className="relative h-[400px] w-full max-w-xl">
                {/* 上部の白グラデーション */}
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
                  <div className="grid grid-cols-3 gap-3">
                    {FURNITURE_ITEMS.map(({ id, label, Icon }) => {
                      const isSelected = id in selectedFurniture;
                      return (
                        <button
                          key={id}
                          onClick={() => {
                            if (isSelected) {
                              const newFurniture = { ...selectedFurniture };
                              delete newFurniture[id];
                              setSelectedFurniture(newFurniture);
                            } else {
                              setSelectedFurniture({
                                ...selectedFurniture,
                                [id]: { brand: "", model: "" },
                              });
                            }
                          }}
                          className={cn(
                            "flex flex-col items-center p-4 border-2 rounded-xl transition-all duration-200",
                            isSelected
                              ? "border-foreground bg-muted scale-95"
                              : "border-border hover:border-foreground/40",
                          )}
                        >
                          <Icon
                            className="w-7 h-7 mb-2 text-foreground"
                            strokeWidth={1.5}
                          />
                          <span className="text-xs font-medium text-center">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* 下部の白グラデーション */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
              </div>

              {/* フローティングパネル */}
              <div
                className={cn(
                  "fixed right-6 top-1/2 -translate-y-1/2 w-[400px] bg-white rounded-2xl z-50 transform transition-all duration-500 ease-out overflow-hidden",
                  Object.keys(selectedFurniture).length > 0
                    ? "translate-x-0 opacity-100 scale-100"
                    : "translate-x-8 opacity-0 scale-95 pointer-events-none",
                )}
                style={{
                  boxShadow:
                    "0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                }}
              >
                {/* パネルヘッダー */}
                <div className="px-7 py-5 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">
                      選択中
                    </h3>
                    <span className="text-sm text-muted-foreground bg-foreground/10 px-3 py-1 rounded-full">
                      {Object.keys(selectedFurniture).length}点
                    </span>
                  </div>
                </div>

                {/* 選択アイテムリスト */}
                <div className="max-h-[450px] overflow-y-auto">
                  <div className="p-6 space-y-4">
                    {Object.keys(selectedFurniture)
                      .reverse()
                      .map((id, index) => {
                        const item = FURNITURE_ITEMS.find((f) => f.id === id);
                        if (!item) return null;
                        const { label, Icon } = item;
                        return (
                          <div
                            key={id}
                            className="bg-muted/50 rounded-xl p-4 animate-in fade-in slide-in-from-right-2 duration-200"
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon
                                  className="w-5 h-5 text-foreground"
                                  strokeWidth={1.5}
                                />
                              </div>
                              <span className="text-sm font-semibold text-foreground flex-1 truncate">
                                {label}
                              </span>
                              <button
                                onClick={() => {
                                  const newFurniture = { ...selectedFurniture };
                                  delete newFurniture[id];
                                  setSelectedFurniture(newFurniture);
                                }}
                                className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2.5">
                              <input
                                type="text"
                                placeholder="ブランド名"
                                value={selectedFurniture[id]?.brand || ""}
                                onChange={(e) => {
                                  setSelectedFurniture({
                                    ...selectedFurniture,
                                    [id]: {
                                      ...selectedFurniture[id],
                                      brand: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-foreground placeholder:text-muted-foreground transition-all"
                              />
                              <input
                                type="text"
                                placeholder="機種名・型番"
                                value={selectedFurniture[id]?.model || ""}
                                onChange={(e) => {
                                  setSelectedFurniture({
                                    ...selectedFurniture,
                                    [id]: {
                                      ...selectedFurniture[id],
                                      model: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-foreground placeholder:text-muted-foreground transition-all"
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ステップ9: 公開準備完了 */}
          {currentStep === 9 && (
            <div className="text-center">
              <h1
                className="text-[48px] font-medium text-foreground mb-6 leading-[1.15]"
                style={{
                  fontFamily:
                    '"Noto Sans JP", "Hiragino Kaku Gothic ProN", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                公開準備を完了
              </h1>
              <p className="text-lg text-foreground leading-relaxed max-w-xl mx-auto">
                内容を確認して、お好きなタイミングでリスティングを公開しましょう。
              </p>
            </div>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-200">
        {/* プログレスバー */}
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
            {/* ヘッダー */}
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
              {/* 追加ボタン */}
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

            {/* ドラッグ&ドロップエリア / プレビューエリア */}
            <div className="p-6">
              {isUploading ? (
                // アップロード中のアニメーション（サークルプログレス）
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
                // プレビュー表示（横スクロール）
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
                        {index === 0 && uploadTargetType === "room" && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
                            カバー
                          </div>
                        )}
                      </div>
                    ))}
                    {/* 読み込み中のローディング表示 */}
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
                    {/* 追加ボタン */}
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
                // 通常のドラッグ&ドロップUI
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

            {/* フッター */}
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
