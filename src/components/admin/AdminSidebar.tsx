import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Tags,
  Languages,
  Bot,
  History,
  ChevronLeft,
  ChevronRight,
  Settings,
  ExternalLink,
  Search,
  PenSquare,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  exact?: boolean;
}

function NavItem({ to, icon, label, collapsed, exact }: NavItemProps) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(to + '/');

  const content = (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm group',
        collapsed && 'justify-center px-2',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
    >
      <span className={cn(
        'flex-shrink-0 transition-colors',
        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
      )}>
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-2 mx-2 border-t border-border/60" />;
  return (
    <div className="px-3 pt-5 pb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {label}
      </span>
    </div>
  );
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const { signOut, user } = useAdminAuthContext();
  const initials = user?.email?.substring(0, 2).toUpperCase() || 'AD';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card/80 backdrop-blur-xl border-r border-border/60 transition-all duration-300 flex flex-col',
        collapsed ? 'w-[60px]' : 'w-60'
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center h-14 border-b border-border/60 px-3',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm tracking-tight">GitaAdmin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        <NavItem to="/admin" icon={<LayoutDashboard className="w-[18px] h-[18px]" />} label="Dashboard" collapsed={collapsed} exact />
        <NavItem to="/admin/analytics" icon={<BarChart3 className="w-[18px] h-[18px]" />} label="Analytics" collapsed={collapsed} />

        <SectionLabel label="Content" collapsed={collapsed} />
        <NavItem to="/admin/shloks" icon={<FileText className="w-[18px] h-[18px]" />} label="Shloks" collapsed={collapsed} />
        <NavItem to="/admin/chapters" icon={<BookOpen className="w-[18px] h-[18px]" />} label="Chapters" collapsed={collapsed} />
        <NavItem to="/admin/problems" icon={<Tags className="w-[18px] h-[18px]" />} label="Problems" collapsed={collapsed} />
        <NavItem to="/admin/blog" icon={<PenSquare className="w-[18px] h-[18px]" />} label="Blog" collapsed={collapsed} />

        <SectionLabel label="Configuration" collapsed={collapsed} />
        <NavItem to="/admin/ai-rules" icon={<Bot className="w-[18px] h-[18px]" />} label="AI Rules" collapsed={collapsed} />
        <NavItem to="/admin/languages" icon={<Languages className="w-[18px] h-[18px]" />} label="Languages" collapsed={collapsed} />
        <NavItem to="/admin/seo" icon={<Search className="w-[18px] h-[18px]" />} label="SEO" collapsed={collapsed} />
        <NavItem to="/admin/activity" icon={<History className="w-[18px] h-[18px]" />} label="Activity Log" collapsed={collapsed} />
        <NavItem to="/admin/settings" icon={<Settings className="w-[18px] h-[18px]" />} label="Settings" collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 p-2 space-y-1">
        {/* User info */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{user?.email || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
        )}

        <div className={cn('flex gap-1', collapsed ? 'flex-col items-center' : 'flex-row')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/"
                target="_blank"
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-xs',
                  collapsed ? 'justify-center' : 'flex-1'
                )}
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                {!collapsed && <span>View Site</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">View Site</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors text-xs',
                  collapsed ? 'justify-center' : 'flex-1'
                )}
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
