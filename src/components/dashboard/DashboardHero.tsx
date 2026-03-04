import { LogOut, Calendar, Sun, Moon, Sunset, Sunrise } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

interface DashboardHeroProps {
  displayName?: string | null;
  memberSince?: string | null;
  onSignOut: () => void;
  currentStreak?: number;
  versesRead?: number;
}

function getGreeting(): { text: string; icon: typeof Sun; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { text: 'Good Night', icon: Moon, emoji: '🌙' };
  if (hour < 12) return { text: 'Good Morning', icon: Sunrise, emoji: '🙏' };
  if (hour < 17) return { text: 'Good Afternoon', icon: Sun, emoji: '☀️' };
  if (hour < 21) return { text: 'Good Evening', icon: Sunset, emoji: '🪔' };
  return { text: 'Good Night', icon: Moon, emoji: '🌙' };
}

const motivations = [
  "Every verse brings you closer to truth.",
  "The journey of wisdom continues today.",
  "Knowledge is the purest form of liberation.",
  "Your dedication to learning inspires growth.",
  "Seek wisdom, and peace will follow.",
];

export function DashboardHero({ displayName, memberSince, onSignOut, currentStreak = 0, versesRead = 0 }: DashboardHeroProps) {
  const name = displayName || 'Seeker';
  const initials = name.slice(0, 2).toUpperCase();
  const joinDate = memberSince
    ? new Date(memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;
  const greeting = getGreeting();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const motivation = motivations[dayOfYear % motivations.length];

  return (
    <div className="relative rounded-2xl overflow-hidden mb-8 animate-fade-in">
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-border/50 rounded-2xl">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-400" />

        <RadialGlow position="top-right" color="primary" className="opacity-15" />
        <FloatingOm className="top-4 right-6 !text-5xl md:!text-7xl hidden md:block" />

        <div className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            {/* Avatar with ring */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-2xl sm:text-3xl shadow-xl shadow-primary/25 ring-4 ring-background"
                style={{ width: '4.5rem', height: '4.5rem' }}
              >
                {initials}
              </div>
              {currentStreak > 0 && (
                <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-lg">
                  🔥 {currentStreak}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Greeting badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
                <greeting.icon className="h-3 w-3" />
                {greeting.text} {greeting.emoji}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                <span className="text-gradient">{name}</span>
              </h1>

              <p className="text-muted-foreground mt-1 text-sm sm:text-base italic">
                "{motivation}"
              </p>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {joinDate && (
                  <span className="inline-flex items-center gap-1 text-xs bg-muted/80 px-2.5 py-1 rounded-full text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Member since {joinDate}
                  </span>
                )}
                {versesRead > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 px-2.5 py-1 rounded-full text-primary font-medium">
                    📖 {versesRead} verses explored
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onSignOut}
              className="gap-2 self-start sm:self-center touch-target border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
