import {
  Bookmark,
  BookOpen,
  ScrollText,
  Flame,
  MessageCircle,
  Globe,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';

interface DashboardStatsProps {
  favoritesCount: number;
  chaptersExplored: number;
  versesRead: number;
  currentStreak: number;
  chatCount: number;
  language: string;
  plansCompleted?: number;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  trend?: string;
  accentColor?: string;
}

function StatItem({ icon, value, label, trend, accentColor = 'primary' }: StatItemProps) {
  return (
    <div className="group relative flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-default animate-fade-in overflow-hidden">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${accentColor} to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-foreground leading-none">
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">{label}</div>
      {trend && (
        <div className="flex items-center gap-0.5 text-[9px] font-medium text-primary">
          <TrendingUp className="h-2.5 w-2.5" />
          {trend}
        </div>
      )}
    </div>
  );
}

export function DashboardStats({
  favoritesCount,
  chaptersExplored,
  versesRead,
  currentStreak,
  chatCount,
  language,
  plansCompleted = 0,
}: DashboardStatsProps) {
  const langLabel = language === 'hindi' ? 'हिंदी' : 'EN';
  const progressPercent = Math.round((chaptersExplored / 18) * 100);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3 mb-8">
      <StatItem
        icon={<Flame className="h-5 w-5 text-orange-500" />}
        value={currentStreak}
        label="Day Streak"
        trend={currentStreak > 0 ? 'Active' : undefined}
      />
      <StatItem
        icon={<ScrollText className="h-5 w-5 text-primary" />}
        value={versesRead}
        label="Verses Read"
      />
      <StatItem
        icon={<BookOpen className="h-5 w-5 text-primary" />}
        value={`${chaptersExplored}/18`}
        label="Chapters"
        trend={progressPercent > 0 ? `${progressPercent}%` : undefined}
      />
      <StatItem
        icon={<Bookmark className="h-5 w-5 text-amber-500" />}
        value={favoritesCount}
        label="Saved"
      />
      <StatItem
        icon={<MessageCircle className="h-5 w-5 text-primary" />}
        value={chatCount}
        label="AI Chats"
      />
      <StatItem
        icon={<CalendarDays className="h-5 w-5 text-primary" />}
        value={plansCompleted}
        label="Plans Done"
      />
      <StatItem
        icon={<Globe className="h-5 w-5 text-primary" />}
        value={langLabel}
        label="Language"
      />
    </div>
  );
}
