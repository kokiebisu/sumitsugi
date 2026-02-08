import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { getPropertyById } from '@/lib/data';
import { calculateFeeBreakdown } from '@/lib/stripe/calculations';
import { ApplicationFeeForm } from '@/components/payment/application-fee-form';
import { DepositForm } from '@/components/payment/deposit-form';
import { RemainingForm } from '@/components/payment/remaining-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PaymentStep = 'application_fee' | 'deposit' | 'remaining';

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    step?: string;
    status?: string;
  }>;
}

function getPaymentStep(stepParam?: string): PaymentStep {
  if (stepParam === 'deposit') return 'deposit';
  if (stepParam === 'remaining') return 'remaining';
  return 'application_fee';
}

function StepIndicator({
  stepNumber,
  label,
  isActive,
  isCompleted,
}: {
  stepNumber: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
        <Check className="w-5 h-5" />
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF5A5F] text-white flex items-center justify-center font-bold">
        {stepNumber}
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
      {stepNumber}
    </div>
  );
}

export default async function PaymentPage({
  params,
  searchParams,
}: PaymentPageProps) {
  const { id } = await params;
  const { step: stepParam, status } = await searchParams;

  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  const breakdown = calculateFeeBreakdown(property.handoverFee);
  const currentStep = getPaymentStep(stepParam);

  // Mock user and previous tenant IDs (will be replaced with real auth)
  const userId = 'user_mock_001';
  const previousTenantId = 'seller_mock_001';

  const stepIndex =
    currentStep === 'application_fee' ? 0 : currentStep === 'deposit' ? 1 : 2;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
          <p className="text-muted-foreground">引き継ぎ費用のお支払い手続き</p>
        </div>

        {/* Success status banner */}
        {status === 'success' && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                お支払いが完了しました
              </p>
              <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                {currentStep === 'deposit' &&
                  'デポジットのお支払いが完了しました。続けて残金のお支払いに進んでください。'}
                {currentStep === 'remaining' &&
                  '残金のお支払いが完了しました。引き渡しの確認をお待ちください。'}
                {currentStep === 'application_fee' &&
                  '申込金のお支払いが完了しました。前の住人との合意後、デポジットのお支払いに進みます。'}
              </p>
            </div>
          </div>
        )}

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
                  {/* Step 1: Application Fee */}
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                      currentStep === 'application_fee'
                        ? 'bg-[#FF5A5F]/10 dark:bg-[#FF5A5F]/20 border-[#FF5A5F]'
                        : stepIndex > 0
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                          : 'bg-gray-100 dark:bg-gray-800 border-transparent opacity-60'
                    }`}
                  >
                    <StepIndicator
                      stepNumber={1}
                      label="申込金"
                      isActive={currentStep === 'application_fee'}
                      isCompleted={stepIndex > 0}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {currentStep === 'application_fee'
                          ? '申込金のお支払い（現在のステップ）'
                          : stepIndex > 0
                            ? '申込金のお支払い（完了）'
                            : '申込金のお支払い'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        引き継ぎの意思表示として前の住人に直接送金されます
                      </p>
                      <p
                        className={`text-2xl font-bold ${currentStep === 'application_fee' ? 'text-[#FF5A5F]' : ''}`}
                      >
                        {breakdown.applicationFee.toLocaleString()}円
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        返金不可
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Deposit */}
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                      currentStep === 'deposit'
                        ? 'bg-[#FF5A5F]/10 dark:bg-[#FF5A5F]/20 border-[#FF5A5F]'
                        : stepIndex > 1
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                          : 'bg-gray-100 dark:bg-gray-800 border-transparent opacity-60'
                    }`}
                  >
                    <StepIndicator
                      stepNumber={2}
                      label="デポジット"
                      isActive={currentStep === 'deposit'}
                      isCompleted={stepIndex > 1}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {currentStep === 'deposit'
                          ? 'デポジット（30%）（現在のステップ）'
                          : stepIndex > 1
                            ? 'デポジット（30%）（完了）'
                            : 'デポジット（30%）'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        前の住人との合意後、エスクローに預けられます
                      </p>
                      <p
                        className={`text-xl font-bold ${currentStep === 'deposit' ? 'text-[#FF5A5F]' : ''}`}
                      >
                        {breakdown.deposit.toLocaleString()}円
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        物件引き渡し後に前の住人に送金
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Remaining */}
                  <div
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                      currentStep === 'remaining'
                        ? 'bg-[#FF5A5F]/10 dark:bg-[#FF5A5F]/20 border-[#FF5A5F]'
                        : 'bg-gray-100 dark:bg-gray-800 border-transparent opacity-60'
                    }`}
                  >
                    <StepIndicator
                      stepNumber={3}
                      label="残金"
                      isActive={currentStep === 'remaining'}
                      isCompleted={false}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {currentStep === 'remaining'
                          ? '残金（70%）（現在のステップ）'
                          : '残金（70%）'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        引き渡し確認後のお支払い
                      </p>
                      <p
                        className={`text-xl font-bold ${currentStep === 'remaining' ? 'text-[#FF5A5F]' : ''}`}
                      >
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
                      {currentStep === 'application_fee' &&
                        '次のステップについて：'}
                      {currentStep === 'deposit' && 'デポジットについて：'}
                      {currentStep === 'remaining' && '残金について：'}
                    </span>
                    <br />
                    {currentStep === 'application_fee' &&
                      '申込金のお支払い後、前の住人とメッセージでやり取りを開始できます。双方が合意に至った後、デポジットと残金のお支払いに進みます。'}
                    {currentStep === 'deposit' &&
                      'デポジットはエスクローに安全に保管されます。引き渡し後、双方が確認したらエスクローから前の住人に送金されます。'}
                    {currentStep === 'remaining' &&
                      '残金のお支払い後、引き渡しの確認を行ってください。双方が確認した後、エスクローから前の住人に全額送金されます。'}
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
              {/* Render the appropriate payment form based on current step */}
              {currentStep === 'application_fee' && (
                <ApplicationFeeForm
                  propertyId={property.id}
                  userId={userId}
                  previousTenantId={previousTenantId}
                  onSuccess={() => {
                    // Redirect will be handled by the form's return_url
                  }}
                />
              )}

              {currentStep === 'deposit' && (
                <DepositForm
                  propertyId={property.id}
                  userId={userId}
                  handoverFeeTotal={property.handoverFee}
                  depositAmount={breakdown.deposit}
                  onSuccess={() => {
                    // Redirect will be handled by the form's return_url
                  }}
                />
              )}

              {currentStep === 'remaining' && (
                <RemainingForm
                  propertyId={property.id}
                  userId={userId}
                  handoverFeeTotal={property.handoverFee}
                  remainingAmount={breakdown.remaining}
                  onSuccess={() => {
                    // Redirect will be handled by the form's return_url
                  }}
                />
              )}

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
