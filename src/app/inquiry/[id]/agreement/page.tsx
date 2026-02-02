"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Check,
} from "lucide-react";
import { mockHandoverAgreements } from "@/lib/data";
import type { ItemCondition } from "@/lib/data";

// 状態のラベル
const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: "非常に良い",
  good: "良い",
  fair: "普通",
  poor: "使用感あり",
};

export default function AgreementPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;
  const { user, isLoading } = useAuth();

  // モックデータから合意を取得（実際はAPIから取得）
  const agreement = mockHandoverAgreements.find(
    (a) => a.inquiryId === inquiryId
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">合意情報が見つかりません</p>
            <Link href="/dashboard" className="mt-4 inline-block text-primary">
              ダッシュボードに戻る
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const includedItems = agreement.items.filter((item) => item.included);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              ダッシュボードに戻る
            </Link>
            <h1 className="text-2xl font-semibold text-foreground">
              引き継ぎ内容の確認
            </h1>
            <p className="mt-2 text-muted-foreground">
              前の住人が確定した引き継ぎ内容を確認してください
            </p>
          </div>

          {/* 物件・当事者情報 */}
          <div className="mb-8 rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-medium text-foreground">{agreement.propertyTitle}</p>
            {agreement.propertyAddress && (
              <p className="text-sm text-muted-foreground">{agreement.propertyAddress}</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">前の住人</p>
                <p className="font-medium">{agreement.sellerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">次の住人（あなた）</p>
                <p className="font-medium">{agreement.buyerName}</p>
              </div>
            </div>
          </div>

          {/* 引越し費用 */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">引越し費用</h2>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-3xl font-bold text-foreground">
                ¥{agreement.adjustedHandoverFee.toLocaleString()}
              </p>
              {agreement.adjustedHandoverFee !== agreement.originalHandoverFee && (
                <p className="mt-1 text-sm text-muted-foreground">
                  (元の金額: ¥{agreement.originalHandoverFee.toLocaleString()})
                </p>
              )}
            </div>
          </div>

          {/* 引き継ぎ品目 */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              引き継ぎ品目（{includedItems.length}点）
            </h2>
            {includedItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">引き継ぎ品目はありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {includedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        状態: {CONDITION_LABELS[item.condition]}
                        {item.notes && ` / ${item.notes}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 注意事項 */}
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              ご確認ください
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
              <li>・上記の品目は現状有姿での譲渡となります</li>
              <li>・退去時の処分責任は次の住人（あなた）が負います</li>
              <li>・受諾後は残置物同意書への署名が必要です</li>
            </ul>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">戻る</Link>
            </Button>
            <Button asChild>
              <Link href={`/inquiry/${inquiryId}/agreement/accept`}>
                内容を確認して受諾へ進む
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
