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
  Download,
  Check,
  FileText,
} from "lucide-react";
import { mockHandoverAgreements } from "@/lib/data";
import type { ItemCondition } from "@/lib/data";

const CONDITION_LABELS: Record<ItemCondition, string> = {
  excellent: "非常に良い",
  good: "良い",
  fair: "普通",
  poor: "使用感あり",
};

export default function AgreementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const agreementId = params.id as string;
  const { user, isLoading } = useAuth();

  const agreement = mockHandoverAgreements.find((a) => a.id === agreementId);

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
  const isSigned = agreement.status === "signed";

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    残置物同意書
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isSigned ? "署名済み" : "未署名"}
                  </p>
                </div>
              </div>
              {isSigned && (
                <Button asChild>
                  <Link href={`/agreements/${agreementId}/pdf`}>
                    <Download className="mr-2 h-4 w-4" />
                    PDFをダウンロード
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* 物件・当事者情報 */}
          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 font-semibold text-foreground">基本情報</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">物件名</dt>
                <dd className="font-medium">{agreement.propertyTitle}</dd>
              </div>
              {agreement.propertyAddress && (
                <div>
                  <dt className="text-muted-foreground">所在地</dt>
                  <dd className="font-medium">{agreement.propertyAddress}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">譲渡者（前の住人）</dt>
                <dd className="font-medium">{agreement.sellerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">譲受者（次の住人）</dt>
                <dd className="font-medium">{agreement.buyerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">作成日</dt>
                <dd className="font-medium">
                  {new Date(agreement.createdAt).toLocaleDateString("ja-JP")}
                </dd>
              </div>
              {agreement.signedAt && (
                <div>
                  <dt className="text-muted-foreground">署名日</dt>
                  <dd className="font-medium">
                    {new Date(agreement.signedAt).toLocaleDateString("ja-JP")}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* 引越し費用 */}
          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 font-semibold text-foreground">引越し費用</h2>
            <p className="text-3xl font-bold text-foreground">
              ¥{agreement.adjustedHandoverFee.toLocaleString()}
            </p>
          </div>

          {/* 引き継ぎ品目 */}
          <div className="mb-8 rounded-lg border border-border bg-background p-6">
            <h2 className="mb-4 font-semibold text-foreground">
              引き継ぎ品目（{includedItems.length}点）
            </h2>
            <div className="space-y-3">
              {includedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      状態: {CONDITION_LABELS[item.condition]}
                      {item.notes && ` / ${item.notes}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 署名情報 */}
          {agreement.buyerSignature && (
            <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h2 className="font-semibold text-green-800 dark:text-green-200">
                  署名済み
                </h2>
              </div>
              <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                <p>署名者: {agreement.buyerSignature.name}</p>
                <p>
                  署名日時:{" "}
                  {new Date(agreement.buyerSignature.agreedAt).toLocaleString(
                    "ja-JP"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* PDFダウンロードボタン */}
          {isSigned && (
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link href={`/agreements/${agreementId}/pdf`}>
                  <Download className="mr-2 h-5 w-5" />
                  残置物同意書をダウンロード
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
