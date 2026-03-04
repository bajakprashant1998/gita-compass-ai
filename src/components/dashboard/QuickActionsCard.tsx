import { Link } from 'react-router-dom';
import { MessageCircle, BookOpen, TrendingUp, Sparkles, ChevronRight, CalendarDays, Trophy, Compass } from 'lucide-react';
import { GradientBorderCard } from '@/components/ui/decorative-elements';

const actions = [
  {
    to: '/chat',
    icon: MessageCircle,
    title: 'Talk to Krishna',
    desc: 'AI-powered Gita guidance',
    highlight: true,
    gradient: 'from-primary/20 to-amber-500/10',
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
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold">Continue Your Journey</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actions.map((action, i) => (
            <Link key={action.to + action.title} to={action.to}>
              <div
                className={`p-3 rounded-xl transition-all duration-200 cursor-pointer group flex items-center gap-3 touch-target animate-fade-in ${
                  action.highlight
                    ? 'bg-gradient-to-r from-primary/10 to-amber-500/5 hover:from-primary/15 hover:to-amber-500/10 hover:shadow-md border border-primary/20'
                    : 'bg-muted/50 hover:bg-muted hover:shadow-sm'
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 ${
                    action.highlight
                      ? 'bg-gradient-to-br from-primary to-amber-500 shadow-sm'
                      : 'bg-card border border-border/50'
                  }`}
                >
                  <action.icon className={`h-5 w-5 ${action.highlight ? 'text-white' : 'text-muted-foreground group-hover:text-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">{action.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </GradientBorderCard>
  );
}
