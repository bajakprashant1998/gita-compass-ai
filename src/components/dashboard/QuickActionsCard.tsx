import { Link } from 'react-router-dom';
import { MessageCircle, BookOpen, TrendingUp, Sparkles, ChevronRight, Sun } from 'lucide-react';
import { GradientBorderCard } from '@/components/ui/decorative-elements';

const actions = [
  {
    to: '/chat',
    icon: MessageCircle,
    title: 'Talk to AI Coach',
    desc: 'Get personalized Gita guidance',
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
    icon: TrendingUp,
    title: 'Find by Problem',
    desc: 'Solutions for life challenges',
    highlight: false,
  },
  {
    to: '/',
    icon: Sun,
    title: 'Daily Wisdom',
    desc: "Today's verse inspiration",
    highlight: false,
  },
];

export function QuickActionsCard() {
  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Continue Your Journey</h2>
        </div>

        <div className="space-y-2">
          {actions.map((action, i) => (
            <Link key={action.to + action.title} to={action.to}>
              <div
                className={`p-3 sm:p-4 rounded-xl transition-all duration-200 cursor-pointer group flex items-center gap-3 sm:gap-4 touch-target animate-fade-in ${
                  action.highlight
                    ? 'bg-primary/10 hover:bg-primary/20 hover:shadow-md'
                    : 'bg-muted/50 hover:bg-muted hover:shadow-sm'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    action.highlight
                      ? 'bg-gradient-to-br from-primary/30 to-primary/10'
                      : 'bg-muted'
                  }`}
                >
                  <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{action.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </GradientBorderCard>
  );
}
