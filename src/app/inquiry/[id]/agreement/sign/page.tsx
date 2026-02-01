"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, Check, FileText } from "lucide-react";
import { mockHandoverAgreements } from "@/lib/data";

export default function SignPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id as string;
  const { user, isLoading } = useAuth();

  const [signatureName, setSignatureName] = useState("");
  const [agreements, setAgreements] = useState({
    currentCondition: false,
    disposalResponsibility: false,
    noWarranty: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agreement = mockHandoverAgreements.find(
    (a) => a.inquiryId === inquiryId
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setSignatureName(user.name);
    }
  }, [user]);

  const allAgreed = Object.values(agreements).every(Boolean);
  const canSubmit = allAgreed && signatureName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    // TODO: API呼び出しで署名を記録
    setTimeout(() => {
      // 署名完了後、合意詳細ページへ
      router.push(`/agreements/${agreement?.id}`);
    }, 1000);
  };

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

  const agreementItems = [
    {
      key: "currentCondition" as const,
      label: "現状有姿での譲渡に同意します",
      description:
        "引き継ぎ品目は内見時に確認した状態のままで譲渡されます。",
    },
    {
      key: "disposalResponsibility" as const,
      label: "退去時の処分責任を負うことに同意します",
      description:
        "引き継いだ品目は、退去時にご自身の責任で処分または次の方へ引き継いでください。",
    },
    {
      key: "noWarranty" as const,
      label: "大家・管理会社への免責に同意します",
      description:
        "引き継ぎ品目に関するトラブルについて、大家・管理会社は責任を負いません。",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href={`/inquiry/${inquiryId}/agreement/accept`}
              className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              受諾画面に戻る
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  残置物同意書への署名
                </h1>
                <p className="text-sm text-muted-foreground">
                  以下の内容に同意し、署名してください
                </p>
              </div>
            </div>
          </div>

          {/* 同意事項 */}
          <div className="mb-8 space-y-4">
            {agreementItems.map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
              >
                <button
                  type="button"
                  onClick={() =>
                    setAgreements((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    agreements[item.key]
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground"
                  }`}
                >
                  {agreements[item.key] && <Check className="h-3 w-3" />}
                </button>
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* 署名欄 */}
          <div className="mb-8">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                署名（氏名）
              </span>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="氏名を入力"
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-3 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                上記の同意事項を確認し、署名することで残置物同意書が作成されます。
              </p>
            </label>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={`/inquiry/${inquiryId}/agreement/accept`}>戻る</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "署名中..." : "署名して完了"}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
