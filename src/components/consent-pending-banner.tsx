import { MessageSquare, Building2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsentPendingBannerProps {
  managementConsultedAt?: Date | string | null;
  managementCompanyName?: string | null;
  className?: string;
}

type BannerVariant = 'consulted' | 'hasCompany' | 'noInfo';

const BANNER_CONFIG: Record<
  BannerVariant,
  {
    title: string;
    subtitle: string;
    icon: typeof MessageSquare;
    containerClass: string;
    iconClass: string;
  }
> = {
  consulted: {
    title: '管理会社に相談済み',
    subtitle: '承認待ち',
    icon: MessageSquare,
    containerClass: 'bg-blue-50 text-blue-700 border-blue-200',
    iconClass: 'text-blue-500',
  },
  hasCompany: {
    title: '管理会社あり',
    subtitle: '未相談',
    icon: Building2,
    containerClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    iconClass: 'text-yellow-500',
  },
  noInfo: {
    title: '管理会社情報なし',
    subtitle: '大家確認が必要',
    icon: HelpCircle,
    containerClass: 'bg-gray-50 text-gray-600 border-gray-200',
    iconClass: 'text-gray-400',
  },
};

function getBannerVariant(
  managementConsultedAt?: Date | string | null,
  managementCompanyName?: string | null
): BannerVariant {
  if (managementConsultedAt) {
    return 'consulted';
  }
  if (managementCompanyName) {
    return 'hasCompany';
  }
  return 'noInfo';
}

export function ConsentPendingBanner({
  managementConsultedAt,
  managementCompanyName,
  className,
}: ConsentPendingBannerProps) {
  const variant = getBannerVariant(
    managementConsultedAt,
    managementCompanyName
  );
  const config = BANNER_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3',
        config.containerClass,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', config.iconClass)} />
      <div className="text-sm">
        <span className="font-semibold">{config.title}</span>
        <span className="mx-1.5">—</span>
        <span>{config.subtitle}</span>
      </div>
    </div>
  );
}
