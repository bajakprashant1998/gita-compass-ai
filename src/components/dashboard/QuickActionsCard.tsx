import { Link } from 'react-router-dom';
import { MessageCircle, BookOpen, Sparkles, ChevronRight, CalendarDays, Trophy, Compass } from 'lucide-react';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import { motion } from 'framer-motion';

const actions = [
  {
    to: '/chat',
    icon: MessageCircle,
    title: 'Talk to Krishna',
    desc: 'AI-powered Gita guidance',
    highlight: true,
  },
  {
    to: '/chapters',
    icon: BookOpen,
    title: 'Browse Chapters',
    desc: 'Explore all 18 chapters',
    highlight: false,
  },
  {
    to: '/problems',
    icon: Compass,
    title: 'Find by Problem',
    desc: 'Solutions for life challenges',
    highlight: false,
  },
  {
    to: '/reading-plans',
    icon: CalendarDays,
    title: 'Reading Plans',
    desc: 'Guided spiritual journeys',
    highlight: false,
  },
  {
    to: '/mood',
    icon: Sparkles,
    title: 'Mood Finder',
    desc: 'Wisdom for how you feel',
    highlight: false,
  },
  {
    to: '/badges',
    icon: Trophy,
    title: 'Your Badges',
    desc: 'Track your achievements',
    highlight: false,
  },
];

export function QuickActionsCard() {
  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-amber-500">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <h2 className="text-lg font-bold">Continue Your Journey</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {actions.map((action, i) => (
            <Link key={action.to + action.title} to={action.to}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={`p-3 rounded-xl transition-all duration-200 cursor-pointer group flex flex-col items-center text-center gap-2 touch-target min-h-[88px] justify-center ${
                  action.highlight
                    ? 'bg-gradient-to-br from-primary/10 to-amber-500/5 hover:from-primary/15 hover:to-amber-500/10 hover:shadow-md border border-primary/20'
                    : 'bg-muted/40 hover:bg-muted hover:shadow-sm border border-transparent hover:border-border/50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${
                    action.highlight
                      ? 'bg-gradient-to-br from-primary to-amber-500 shadow-sm'
                      : 'bg-card border border-border/50'
                  }`}
                >
                  <action.icon className={`h-4 w-4 ${action.highlight ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs group-hover:text-primary transition-colors leading-tight">
                    {action.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 hidden sm:block">{action.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </GradientBorderCard>
  );
}
