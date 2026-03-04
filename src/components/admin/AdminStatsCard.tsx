import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
  className?: string;
}

const colorMap = {
  primary: {
    icon: 'bg-primary/10 text-primary',
    glow: 'from-primary/5 to-transparent',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    glow: 'from-emerald-500/5 to-transparent',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    glow: 'from-amber-500/5 to-transparent',
  },
  blue: {
    icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    glow: 'from-blue-500/5 to-transparent',
  },
  purple: {
    icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    glow: 'from-purple-500/5 to-transparent',
  },
  rose: {
    icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    glow: 'from-rose-500/5 to-transparent',
  },
};

export function AdminStatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'primary',
  className,
}: AdminStatsCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-card rounded-2xl border border-border/60 p-5 transition-all duration-200 hover:shadow-lg hover:border-border group',
        className
      )}
    >
      {/* Subtle glow */}
      <div className={cn('absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', colors.glow)} />

      <div className="flex items-start justify-between relative">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  'text-xs font-semibold px-1.5 py-0.5 rounded-md',
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-destructive bg-destructive/10'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-[10px] text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl', colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
