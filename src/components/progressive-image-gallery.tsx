"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { ImageGallery } from "@/components/image-gallery";
import { Button } from "@/components/ui/button";
import { Lock, Eye, User } from "lucide-react";

interface ProgressiveImageGalleryProps {
  images: string[];
  title: string;
  isLoggedIn?: boolean; // オーバーライド用（テスト目的）
}

/**
 * 段階公開型の画像ギャラリー
 *
 * 公開スコープ:
 * - 非ログイン: カバー写真1枚のみ + ログインを促すオーバーレイ
 * - ログイン後: 部屋全体写真（全画像表示）
 * - 内見調整フェーズ: 完全公開（住所詳細等）← これは別コンポーネントで管理
 */
export function ProgressiveImageGallery({
  images,
  title,
  isLoggedIn: isLoggedInOverride,
}: ProgressiveImageGalleryProps) {
  const { user } = useAuth();
  const isLoggedIn = isLoggedInOverride ?? !!user;
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 非ログイン時は1枚目のみ表示
  const visibleImages = isLoggedIn ? images : images.slice(0, 1);
  const hiddenCount = images.length - visibleImages.length;

  if (isLoggedIn) {
    // ログイン済み: 全画像表示
    return <ImageGallery images={images} title={title} />;
  }

  // 非ログイン: カバー写真のみ + ログインプロンプト
  return (
    <div className="relative">
      {/* カバー写真のみのギャラリー */}
      <div className="relative">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[500px]">
          {/* メイン画像 */}
          <div className="relative col-span-1 row-span-2 overflow-hidden rounded-l-xl md:col-span-2 h-[400px] md:h-full">
            <Image
              src={images[0] || "/placeholder.svg"}
              alt={`${title} - メイン写真`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>

          {/* ブラーされた写真プレースホルダー */}
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`relative hidden h-full overflow-hidden md:block ${
                index === 2 ? "rounded-tr-xl" : ""
              } ${index === 4 ? "rounded-br-xl" : ""}`}
              onClick={() => setShowLoginPrompt(true)}
            >
              {images[index] ? (
                <Image
                  src={images[index]}
                  alt=""
                  fill
                  sizes="25vw"
                  className="object-cover blur-lg brightness-75"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
              {/* ロックオーバーレイ */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer hover:bg-black/40 transition-colors">
                <Lock className="w-6 h-6 text-white/80" />
              </div>
            </div>
          ))}
        </div>

        {/* ログインプロンプトボタン */}
        <button
          onClick={() => setShowLoginPrompt(true)}
          className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 rounded-lg bg-white border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-800 shadow-md hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          すべての写真を見る
          <span className="text-xs text-muted-foreground ml-1">
            (+{hiddenCount}枚)
          </span>
        </button>

        {/* モバイル用ボタン */}
        <button
          onClick={() => setShowLoginPrompt(true)}
          className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 md:hidden flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          ログインして全ての写真を見る ({images.length}枚)
        </button>
      </div>

      {/* ログインプロンプトモーダル */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-coral" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              全ての写真を見るにはログインが必要です
            </h3>
            <p className="text-muted-foreground mb-6">
              部屋の詳細な写真や情報を確認するには、
              <br />
              無料アカウントでログインしてください
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-coral hover:bg-coral/90 text-white"
                onClick={() => {
                  // ログインページへ遷移（実際の実装では適切なパスに）
                  window.location.href = "/login";
                }}
              >
                ログイン / 新規登録
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowLoginPrompt(false)}
              >
                閉じる
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              プライバシー保護のため、部屋の詳細はログインユーザーのみに公開されます
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
