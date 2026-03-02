import {
  Bookmark,
  BookOpen,
  ScrollText,
  Flame,
  MessageCircle,
  Globe,
  CalendarDays,
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
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="group relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 cursor-default animate-fade-in overflow-hidden">
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-foreground">
        {value}
      </div>
      <div className="text-xs text-muted-foreground text-center leading-tight">{label}</div>
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

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 mb-8">
      <StatItem icon={<Bookmark className="h-5 w-5 text-primary" />} value={favoritesCount} label="Saved Verses" />
      <StatItem icon={<BookOpen className="h-5 w-5 text-primary" />} value={chaptersExplored} label="Chapters" />
      <StatItem icon={<ScrollText className="h-5 w-5 text-primary" />} value={versesRead} label="Verses Read" />
      <StatItem icon={<Flame className="h-5 w-5 text-primary" />} value={currentStreak} label="Day Streak" />
      <StatItem icon={<MessageCircle className="h-5 w-5 text-primary" />} value={chatCount} label="AI Chats" />
      <StatItem icon={<CalendarDays className="h-5 w-5 text-primary" />} value={plansCompleted} label="Plans Done" />
      <StatItem icon={<Globe className="h-5 w-5 text-primary" />} value={langLabel} label="Language" />
    </div>
  );
}
