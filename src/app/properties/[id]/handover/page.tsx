import { notFound } from 'next/navigation';
import { ArrowLeft, Home, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { getPropertyById } from '@/lib/data';
import { HandoverConfirmation } from '@/components/payment/handover-confirmation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HandoverPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function HandoverPage({ params }: HandoverPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  // TODO Phase 2: Get real user from session and determine role
  const userId = 'user_mock_001';
  const role = 'buyer' as const;

  // TODO Phase 2: Query handoverConfirmations from DB for current state
  const alreadyConfirmed = false;
  const bothConfirmed = false;
  const otherPartyConfirmed = false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          物件詳細に戻る
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">引き継ぎ完了確認</h1>
          <p className="text-muted-foreground">{property.title}</p>
        </div>

        <div className="space-y-6">
          {/* Handover steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                引き継ぎステータス
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <StepIndicator step={1} label="支払い完了" completed={true} />
                <StepIndicator step={2} label="引き継ぎ実施" completed={true} />
                <StepIndicator
                  step={3}
                  label="完了確認"
                  completed={bothConfirmed}
                  active={!bothConfirmed}
                />
                <StepIndicator
                  step={4}
                  label="エスクロー解放"
                  completed={false}
                  active={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Confirmation card */}
          <HandoverConfirmation
            propertyId={id}
            userId={userId}
            role={role}
            alreadyConfirmed={alreadyConfirmed}
            bothConfirmed={bothConfirmed}
            otherPartyConfirmed={otherPartyConfirmed}
          />

          {/* Trust info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">エスクロー保護</p>
                  <p className="text-xs text-muted-foreground">
                    双方の確認が完了するまで、お支払い金額はエスクローで安全に保管されています。問題がある場合は確認前にサポートにご連絡ください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  step,
  label,
  completed,
  active = false,
}: {
  step: number;
  label: string;
  completed: boolean;
  active?: boolean;
}) {
  const bgClass = completed
    ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
    : active
      ? 'bg-[#FF5A5F]/10 dark:bg-[#FF5A5F]/20 border-[#FF5A5F]'
      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60';

  const numberBgClass = completed
    ? 'bg-green-600'
    : active
      ? 'bg-[#FF5A5F]'
      : 'bg-gray-400';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass}`}>
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full ${numberBgClass} text-white flex items-center justify-center text-sm font-bold`}
      >
        {step}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
