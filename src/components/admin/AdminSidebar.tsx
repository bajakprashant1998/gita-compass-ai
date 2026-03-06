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
  Users,
  Sparkles,
  Mail,
  CalendarDays,
  Activity,
  TrendingUp,
  Link2,
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
  badge?: string;
}

function NavItem({ to, icon, label, collapsed, exact, badge }: NavItemProps) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(to + '/');

  const content = (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group relative',
        collapsed && 'justify-center px-2',
        isActive
          ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      )}
    >
      <span className={cn(
        'flex-shrink-0 transition-colors',
        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
      )}>
        {icon}
      </span>
      {!collapsed && (
        <span className="truncate flex-1">{label}</span>
      )}
      {!collapsed && badge && (
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
        )}>
          {badge}
        </span>
      )}
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
  if (collapsed) return <div className="my-3 mx-2 border-t border-border/40" />;
  return (
    <div className="px-3 pt-6 pb-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
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
        'fixed left-0 top-0 z-40 h-screen border-r border-border/40 transition-all duration-300 flex flex-col',
        'bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-2xl',
        collapsed ? 'w-[60px]' : 'w-60'
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center h-16 border-b border-border/40 px-3',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 p-0.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block leading-tight">GitaAdmin</span>
              <span className="text-[10px] text-muted-foreground">Control Panel</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg flex-shrink-0"
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

        <SectionLabel label="Management" collapsed={collapsed} />
        <NavItem to="/admin/users" icon={<Users className="w-[18px] h-[18px]" />} label="Users" collapsed={collapsed} badge="New" />
        <NavItem to="/admin/contacts" icon={<Mail className="w-[18px] h-[18px]" />} label="Contacts" collapsed={collapsed} />
        <NavItem to="/admin/schedule" icon={<CalendarDays className="w-[18px] h-[18px]" />} label="Schedule" collapsed={collapsed} />

        <SectionLabel label="Configuration" collapsed={collapsed} />
        <NavItem to="/admin/ai-rules" icon={<Bot className="w-[18px] h-[18px]" />} label="AI Rules" collapsed={collapsed} />
        <NavItem to="/admin/languages" icon={<Languages className="w-[18px] h-[18px]" />} label="Languages" collapsed={collapsed} />
        <NavItem to="/admin/seo" icon={<Search className="w-[18px] h-[18px]" />} label="SEO" collapsed={collapsed} />
        <NavItem to="/admin/seo-audit" icon={<TrendingUp className="w-[18px] h-[18px]" />} label="SEO Audit" collapsed={collapsed} badge="New" />
        <NavItem to="/admin/redirects" icon={<Link2 className="w-[18px] h-[18px]" />} label="Redirects" collapsed={collapsed} />
        <NavItem to="/admin/activity" icon={<History className="w-[18px] h-[18px]" />} label="Activity Log" collapsed={collapsed} />
        <NavItem to="/admin/health" icon={<Activity className="w-[18px] h-[18px]" />} label="System Health" collapsed={collapsed} />
        <NavItem to="/admin/settings" icon={<Settings className="w-[18px] h-[18px]" />} label="Settings" collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div className="border-t border-border/40 p-2 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl bg-muted/40">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[11px] font-bold text-primary-foreground flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{user?.email || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Administrator
              </p>
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
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors text-xs',
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
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-xs',
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
