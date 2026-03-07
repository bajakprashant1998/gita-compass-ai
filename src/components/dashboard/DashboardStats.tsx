import {
  Bookmark,
  BookOpen,
  ScrollText,
  Flame,
  MessageCircle,
  Globe,
  CalendarDays,
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  index: number;
  accentClass?: string;
}

function StatItem({ icon, value, label, trend, index, accentClass = 'from-primary/15 to-primary/5' }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.35 }}
      className="group relative flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-2xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-default overflow-hidden"
    >
      {/* Gradient highlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-amber-500/5 transition-all duration-300 rounded-2xl" />

      <div className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${accentClass} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="relative text-xl sm:text-2xl font-bold text-foreground leading-none tabular-nums">
        {value}
      </div>
      <div className="relative text-[10px] sm:text-xs text-muted-foreground text-center leading-tight font-medium">{label}</div>
      {trend && (
        <div className="relative flex items-center gap-0.5 text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
          {trend}
        </div>
      )}
    </motion.div>
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
        trend={currentStreak > 0 ? `🔥 Active` : undefined}
        index={0}
        accentClass="from-orange-500/15 to-red-500/5"
      />
      <StatItem
        icon={<ScrollText className="h-5 w-5 text-primary" />}
        value={versesRead}
        label="Verses Read"
        index={1}
      />
      <StatItem
        icon={<BookOpen className="h-5 w-5 text-primary" />}
        value={`${chaptersExplored}/18`}
        label="Chapters"
        trend={progressPercent > 0 ? `${progressPercent}%` : undefined}
        index={2}
      />
      <StatItem
        icon={<Bookmark className="h-5 w-5 text-amber-500" />}
        value={favoritesCount}
        label="Saved"
        index={3}
        accentClass="from-amber-500/15 to-orange-500/5"
      />
      <StatItem
        icon={<MessageCircle className="h-5 w-5 text-primary" />}
        value={chatCount}
        label="AI Chats"
        index={4}
      />
      <StatItem
        icon={<CalendarDays className="h-5 w-5 text-primary" />}
        value={plansCompleted}
        label="Plans Done"
        index={5}
      />
      <StatItem
        icon={<Globe className="h-5 w-5 text-primary" />}
        value={langLabel}
        label="Language"
        index={6}
      />
    </div>
  );
}
