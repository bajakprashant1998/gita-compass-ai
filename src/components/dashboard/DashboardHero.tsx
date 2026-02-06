import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeroProps {
  displayName?: string | null;
  memberSince?: string | null;
  onSignOut: () => void;
}

export function DashboardHero({ displayName, memberSince, onSignOut }: DashboardHeroProps) {
  const name = displayName || 'Seeker';
  const initials = name.slice(0, 2).toUpperCase();
  const joinDate = memberSince
    ? new Date(memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-8">
      {/* Avatar */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-xl sm:text-2xl shadow-lg shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
          Welcome, <span className="text-gradient">{name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Continue your journey of wisdom
          {joinDate && <span className="hidden sm:inline"> · Member since {joinDate}</span>}
        </p>
      </div>

      <Button
        variant="outline"
        onClick={onSignOut}
        className="gap-2 self-start sm:self-center touch-target"
      >
        <LogOut className="h-4 w-4" />
        <span className="sm:inline">Sign Out</span>
      </Button>
    </div>
  );
}
