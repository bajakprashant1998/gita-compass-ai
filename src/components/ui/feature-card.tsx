import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: 'hot' | 'new' | 'popular';
  actionLabel?: string;
  iconClassName?: string;
}

const badgeStyles = {
  hot: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  new: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  popular: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ 
    className, 
    icon: Icon, 
    title, 
    description, 
    badge, 
    badgeVariant = 'hot',
    actionLabel = 'Learn more',
    iconClassName,
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-2xl border border-border/50 bg-card p-6",
        "transition-all duration-300 ease-out",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        "hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Badge */}
      {badge && (
        <span className={cn(
          "absolute top-4 right-4 px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wide",
          badgeStyles[badgeVariant]
        )}>
          {badge}
        </span>
      )}

      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        "bg-primary/10 text-primary",
        "transition-transform duration-300 group-hover:scale-110",
        iconClassName
      )}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {description}
      </p>

      {/* Action */}
      <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <span>{actionLabel}</span>
        <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  )
);
FeatureCard.displayName = 'FeatureCard';

export { FeatureCard };
