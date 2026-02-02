import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { getPropertyById } from '@/lib/data';
import { calculateFeeBreakdown } from '@/lib/stripe/calculations';
import { ApplicationFeeForm } from '@/components/payment/application-fee-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  const breakdown = calculateFeeBreakdown(property.handoverFee);

  // Mock user and previous tenant IDs (will be replaced with real auth)
  const userId = 'user_mock_001';
  const previousTenantId = 'seller_mock_001';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <p className="text-muted-foreground">引き継ぎ費用のお支払い手続き</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Payment flow and fee breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Three-step payment flow */}
            <Card>
              <CardHeader>
                <CardTitle>お支払いの流れ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Step 1: Application Fee (Current) */}
                  <div className="flex items-start gap-4 p-4 bg-[#FF5A5F]/10 dark:bg-[#FF5A5F]/20 rounded-lg border-2 border-[#FF5A5F]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF5A5F] text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        申込金のお支払い（現在のステップ）
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        引き継ぎの意思表示として前の住人に直接送金されます
                      </p>
                      <p className="text-2xl font-bold text-[#FF5A5F]">
                        {breakdown.applicationFee.toLocaleString()}円
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        返金不可
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Deposit (Grayed out) */}
                  <div className="flex items-start gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-60">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        デポジット（30%）
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        前の住人との合意後、エスクローに預けられます
                      </p>
                      <p className="text-xl font-bold">
                        {breakdown.deposit.toLocaleString()}円
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        物件引き渡し後に前の住人に送金
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Remaining (Grayed out) */}
                  <div className="flex items-start gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-60">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        残金（70%）
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        引き渡し確認後のお支払い
                      </p>
                      <p className="text-xl font-bold">
                        {breakdown.remaining.toLocaleString()}円
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        物件引き渡し確認後に前の住人に送金
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <span className="font-semibold">
                      次のステップについて：
                    </span>
                    <br />
                    申込金のお支払い後、前の住人とメッセージでやり取りを開始できます。双方が合意に至った後、デポジットと残金のお支払いに進みます。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fee breakdown details */}
            <Card>
              <CardHeader>
                <CardTitle>費用の内訳</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="font-semibold text-lg">
                      引き継ぎ費用 合計
                    </span>
                    <span className="text-2xl font-bold">
                      {breakdown.handoverFeeTotal.toLocaleString()}円
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        前の住人が受け取る金額
                      </span>
                      <span className="font-medium">
                        {breakdown.sellerReceives.toLocaleString()}円
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        追加クリーニング費用
                      </span>
                      <span className="font-medium">
                        {breakdown.additionalCleaningFee.toLocaleString()}円
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        大家さんインセンティブ
                      </span>
                      <span className="font-medium">
                        {breakdown.landlordIncentive.toLocaleString()}円
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        プラットフォーム手数料
                      </span>
                      <span className="font-medium">
                        {breakdown.platformFee.toLocaleString()}円
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      引き継ぎ費用には、インテリア・家具・家電の引き継ぎ、クリーニング、大家さんへのインセンティブ、プラットフォーム利用料が含まれます。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Payment form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ApplicationFeeForm
                propertyId={property.id}
                userId={userId}
                previousTenantId={previousTenantId}
                onSuccess={() => {
                  // Redirect will be handled by the form's return_url
                }}
              />

              {/* Trust indicators */}
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">安全な決済</p>
                        <p className="text-xs text-muted-foreground">
                          Stripeによる安全な決済処理
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">エスクロー保護</p>
                        <p className="text-xs text-muted-foreground">
                          引き渡し確認まで資金を安全に保管
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">トラブル対応</p>
                        <p className="text-xs text-muted-foreground">
                          問題発生時のサポート体制
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
