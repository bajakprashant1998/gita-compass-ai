import { LogOut, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

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
    <div className="relative rounded-2xl overflow-hidden mb-8 animate-fade-in">
      {/* Gradient background */}
      <div className="relative bg-gradient-to-br from-primary/8 via-background to-accent/10 border border-border/50 rounded-2xl p-6 sm:p-8">
        <RadialGlow position="top-right" color="primary" className="opacity-20" />
        <FloatingOm className="top-4 right-6 !text-4xl md:!text-6xl hidden md:block" />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-xl sm:text-2xl shadow-lg shadow-primary/20 shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome, <span className="text-gradient">{name}</span>
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5 flex-wrap">
              <span>Continue your journey of wisdom</span>
              {joinDate && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                  <Calendar className="h-3 w-3" />
                  Since {joinDate}
                </span>
              )}
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={onSignOut}
            className="gap-2 self-start sm:self-center touch-target"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
