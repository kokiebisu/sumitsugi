import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  ShieldQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConsentStatus } from '@/lib/data';

interface ConsentBadgeProps {
  status: ConsentStatus;
  className?: string;
  variant?: 'overlay' | 'inline';
}

const CONSENT_CONFIG: Record<
  ConsentStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    overlayClass: string;
    inlineClass: string;
  }
> = {
  pending: {
    label: '要確認',
    icon: ShieldQuestion,
    overlayClass: 'bg-gray-500 text-white',
    inlineClass: 'bg-gray-100 text-gray-600',
  },
  conditional: {
    label: '条件付き承認',
    icon: AlertCircle,
    overlayClass: 'bg-yellow-500 text-white',
    inlineClass: 'bg-yellow-50 text-yellow-700',
  },
  approved: {
    label: '大家承認済み',
    icon: CheckCircle2,
    overlayClass: 'bg-green-600 text-white',
    inlineClass: 'bg-green-50 text-green-700',
  },
  rejected: {
    label: '承認不可',
    icon: XCircle,
    overlayClass: 'bg-red-600 text-white',
    inlineClass: 'bg-red-50 text-red-700',
  },
  expired: {
    label: '期限切れ',
    icon: Clock,
    overlayClass: 'bg-gray-400 text-white',
    inlineClass: 'bg-gray-100 text-gray-500',
  },
};

export function ConsentBadge({
  status,
  className,
  variant = 'overlay',
}: ConsentBadgeProps) {
  const config = CONSENT_CONFIG[status];
  const Icon = config.icon;

  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          'absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-md',
          config.overlayClass,
          className
        )}
      >
        <Icon className="h-3 w-3" />
        {status === 'approved' && '✓ '}
        {config.label}
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        config.inlineClass,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {status === 'approved' && '✓ '}
      {config.label}
    </span>
  );
}
