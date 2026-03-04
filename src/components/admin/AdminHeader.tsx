import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions, icon }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
