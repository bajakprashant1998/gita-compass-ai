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
  Menu,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

function NavItem({ to, icon, label, collapsed }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {icon}
      {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const [contentOpen, setContentOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">GitaAdmin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="shrink-0"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem
            to="/admin"
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            collapsed={collapsed}
          />

          {/* Content Management */}
          {!collapsed ? (
            <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Content
                <ChevronLeft className={cn('h-4 w-4 transition-transform', contentOpen && '-rotate-90')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-2">
                <NavItem
                  to="/admin/shloks"
                  icon={<FileText className="w-5 h-5" />}
                  label="Shloks"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/admin/chapters"
                  icon={<BookOpen className="w-5 h-5" />}
                  label="Chapters"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/admin/problems"
                  icon={<Tags className="w-5 h-5" />}
                  label="Problems"
                  collapsed={collapsed}
                />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <>
              <NavItem
                to="/admin/shloks"
                icon={<FileText className="w-5 h-5" />}
                label="Shloks"
                collapsed={collapsed}
              />
              <NavItem
                to="/admin/chapters"
                icon={<BookOpen className="w-5 h-5" />}
                label="Chapters"
                collapsed={collapsed}
              />
              <NavItem
                to="/admin/problems"
                icon={<Tags className="w-5 h-5" />}
                label="Problems"
                collapsed={collapsed}
              />
            </>
          )}

          {/* Settings */}
          {!collapsed ? (
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider mt-4">
                Settings
                <ChevronLeft className={cn('h-4 w-4 transition-transform', settingsOpen && '-rotate-90')} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 ml-2">
                <NavItem
                  to="/admin/ai-rules"
                  icon={<Bot className="w-5 h-5" />}
                  label="AI Rules"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/admin/languages"
                  icon={<Languages className="w-5 h-5" />}
                  label="Languages"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/admin/activity"
                  icon={<History className="w-5 h-5" />}
                  label="Activity Log"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/admin/settings"
                  icon={<Settings className="w-5 h-5" />}
                  label="Settings"
                  collapsed={collapsed}
                />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <>
              <div className="my-4 border-t border-border" />
              <NavItem
                to="/admin/ai-rules"
                icon={<Bot className="w-5 h-5" />}
                label="AI Rules"
                collapsed={collapsed}
              />
              <NavItem
                to="/admin/languages"
                icon={<Languages className="w-5 h-5" />}
                label="Languages"
                collapsed={collapsed}
              />
              <NavItem
                to="/admin/activity"
                icon={<History className="w-5 h-5" />}
                label="Activity Log"
                collapsed={collapsed}
              />
              <NavItem
                to="/admin/settings"
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
                collapsed={collapsed}
              />
            </>
          )}
        </nav>

        {/* Footer - Auth disabled */}
        <div className="p-4 border-t border-border mt-auto">
          <Link
            to="/"
            className={cn(
              "w-full flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Back to Site</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
