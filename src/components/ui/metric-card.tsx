import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconClassName?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    icon: Icon, 
    label, 
    value, 
    description,
    trend,
    trendValue,
    iconClassName,
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group rounded-2xl border border-border/50 bg-card p-6",
        "transition-all duration-300 ease-out",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          "bg-primary/10 text-primary",
          "transition-transform duration-300 group-hover:scale-110",
          iconClassName
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold tabular-nums">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {trend && trendValue && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
            trend === 'up' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            trend === 'down' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            trend === 'neutral' && "bg-muted text-muted-foreground"
          )}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  )
);
MetricCard.displayName = 'MetricCard';

export { MetricCard };
