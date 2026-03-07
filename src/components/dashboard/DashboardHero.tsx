import { LogOut, Calendar, Sun, Moon, Sunset, Sunrise, Zap, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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

function getLevel(versesRead: number): { level: number; title: string; next: number; progress: number } {
  const levels = [
    { min: 0, title: 'Curious Seeker', next: 10 },
    { min: 10, title: 'Devoted Reader', next: 30 },
    { min: 30, title: 'Wisdom Aspirant', next: 70 },
    { min: 70, title: 'Gita Scholar', next: 150 },
    { min: 150, title: 'Dharma Warrior', next: 300 },
    { min: 300, title: 'Enlightened Soul', next: 500 },
    { min: 500, title: 'Self-Realized', next: 700 },
  ];
  let current = levels[0];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (versesRead >= levels[i].min) { current = levels[i]; break; }
  }
  const levelIndex = levels.indexOf(current);
  const progress = Math.min(((versesRead - current.min) / (current.next - current.min)) * 100, 100);
  return { level: levelIndex + 1, title: current.title, next: current.next, progress };
}

const motivations = [
  "Every verse brings you closer to truth.",
  "The journey of wisdom continues today.",
  "Knowledge is the purest form of liberation.",
  "Your dedication to learning inspires growth.",
  "Seek wisdom, and peace will follow.",
  "You are the eternal self, unbound and free.",
  "Discipline is the bridge to your highest self.",
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
  const level = getLevel(versesRead);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden mb-8"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }} />

      {/* Top accent bar with shimmer */}
      <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
      </div>

      {/* Sanskrit watermark */}
      <div className="absolute top-4 right-6 text-primary/[0.04] font-bold select-none pointer-events-none hidden md:block">
        <span className="text-[6rem] leading-none sanskrit">ॐ</span>
      </div>

      <div className="p-6 sm:p-8 lg:p-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
          {/* Avatar with level ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="relative shrink-0"
          >
            <div className="relative">
              {/* Level ring SVG */}
              <svg className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)]" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="37" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle
                  cx="40" cy="40" r="37"
                  fill="none"
                  stroke="url(#levelGrad)"
                  strokeWidth="3"
                  strokeDasharray={`${level.progress * 2.33} 233`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
                <defs>
                  <linearGradient id="levelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div
                className="w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-primary-foreground font-bold text-2xl sm:text-3xl shadow-xl shadow-primary/20"
              >
                {initials}
              </div>
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card border border-border/60 text-[10px] font-bold rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md whitespace-nowrap">
              <Zap className="h-3 w-3 text-primary" />
              Lv.{level.level}
            </div>
            {currentStreak > 0 && (
              <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-lg">
                🔥 {currentStreak}
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            {/* Greeting pill */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2"
            >
              <greeting.icon className="h-3 w-3" />
              {greeting.text} {greeting.emoji}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight"
            >
              <span className="text-gradient">{name}</span>
            </motion.h1>

            {/* Level title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex items-center gap-2 mt-1"
            >
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Award className="h-3.5 w-3.5" />
                {level.title}
              </span>
              <span className="text-[10px] text-muted-foreground">
                · {versesRead}/{level.next} verses to next level
              </span>
            </motion.div>

            {/* XP progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-2.5 h-1.5 w-full max-w-xs rounded-full bg-muted overflow-hidden origin-left"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-1000"
                style={{ width: `${level.progress}%` }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-muted-foreground mt-2.5 text-sm italic"
            >
              "{motivation}"
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2.5 mt-3 flex-wrap"
            >
              {joinDate && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-muted/80 px-2.5 py-1 rounded-full text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Since {joinDate}
                </span>
              )}
              {versesRead > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 px-2.5 py-1 rounded-full text-primary font-medium">
                  <Target className="h-3 w-3" />
                  {versesRead} verses explored
                </span>
              )}
            </motion.div>
          </div>

          <Button
            variant="outline"
            onClick={onSignOut}
            className="gap-2 self-start touch-target border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
