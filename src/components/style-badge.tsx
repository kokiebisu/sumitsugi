import {
  Gem,
  Hammer,
  Sparkles,
  Minimize2,
  Clock,
  Sunrise,
  Palette,
  Lightbulb,
} from 'lucide-react';

interface StyleBadgeProps {
  style: string;
  size?: 'sm' | 'md' | 'lg';
}

const styleConfig = {
  scandinavian: { icon: Sunrise, label: '北欧風', color: 'text-blue-600' },
  industrial: {
    icon: Hammer,
    label: 'インダストリアル',
    color: 'text-gray-700',
  },
  bohemian: { icon: Palette, label: 'ボヘミアン', color: 'text-orange-600' },
  minimal: { icon: Minimize2, label: 'ミニマル', color: 'text-gray-500' },
  vintage: { icon: Clock, label: 'ヴィンテージ', color: 'text-amber-700' },
  modern: { icon: Lightbulb, label: 'モダン', color: 'text-purple-600' },
  luxury: { icon: Gem, label: 'ラグジュアリー', color: 'text-yellow-600' },
  eclectic: {
    icon: Sparkles,
    label: 'エクレクティック',
    color: 'text-pink-600',
  },
};

export function StyleBadge({ style, size = 'md' }: StyleBadgeProps) {
  const config = styleConfig[style as keyof typeof styleConfig];
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const paddingClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-background ${paddingClasses[size]}`}
    >
      <Icon className={`${sizeClasses[size]} ${config.color}`} />
      <span className={`${textSizeClasses[size]} font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
