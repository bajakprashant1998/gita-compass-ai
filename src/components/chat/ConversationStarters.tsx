import { Briefcase, Heart, Brain, Compass, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationStartersProps {
  onSelect: (text: string) => void;
}

const categories = [
  {
    icon: Briefcase,
    label: 'Work & Career',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'hover:border-blue-500/30',
    prompts: [
      "I'm burned out at work and don't know how to find balance",
      "I'm facing an ethical dilemma at my job",
      "I feel stuck in my career and want purpose",
    ],
  },
  {
    icon: Heart,
    label: 'Relationships',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    textColor: 'text-pink-700 dark:text-pink-400',
    borderColor: 'hover:border-pink-500/30',
    prompts: [
      "I'm struggling to forgive someone who hurt me",
      "I feel disconnected from my loved ones",
      "How do I maintain peace in difficult relationships?",
    ],
  },
  {
    icon: Brain,
    label: 'Inner Peace',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    textColor: 'text-teal-700 dark:text-teal-400',
    borderColor: 'hover:border-teal-500/30',
    prompts: [
      "My mind is constantly racing with worries",
      "I can't seem to let go of past regrets",
      "How do I find contentment with what I have?",
    ],
  },
  {
    icon: Compass,
    label: 'Life Decisions',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    borderColor: 'hover:border-amber-500/30',
    prompts: [
      "I'm at a crossroads and don't know which path to take",
      "I'm afraid of making the wrong choice",
      "How do I know what my true purpose is?",
    ],
  },
];

export function ConversationStarters({ onSelect }: ConversationStartersProps) {
  return (
    <div className="h-full flex items-center justify-center p-4 md:p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 text-primary mb-4 animate-fade-in shadow-lg shadow-primary/10">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold mb-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
            How can I help you today?
          </h3>
          <p className="text-muted-foreground animate-fade-in text-sm" style={{ animationDelay: '150ms' }}>
            Share what's on your mind, or choose a topic to explore
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category, catIndex) => (
            <div 
              key={category.label} 
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: `${200 + catIndex * 100}ms` }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg",
                  category.color
                )}>
                  <category.icon className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">
                  {category.label}
                </span>
              </div>
              
              {/* Prompts */}
              <div className="space-y-2">
                {category.prompts.slice(0, 2).map((prompt, promptIndex) => (
                  <button
                    key={prompt}
                    onClick={() => onSelect(prompt)}
                    className={cn(
                      "group w-full text-left p-3 rounded-xl border border-border/50 bg-card",
                      "text-sm transition-all duration-200",
                      "hover:bg-muted/50 hover:shadow-lg hover:-translate-y-0.5",
                      category.borderColor
                    )}
                    style={{ animationDelay: `${300 + catIndex * 100 + promptIndex * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                        {prompt}
                      </span>
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                        "opacity-0 group-hover:opacity-100 transition-all",
                        "bg-gradient-to-r",
                        category.color
                      )}>
                        <ArrowRight className="h-3 w-3 text-white group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick tip */}
        <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p className="text-xs text-muted-foreground">
            💡 Tip: Be specific about your situation for more personalized guidance
          </p>
        </div>
      </div>
    </div>
  );
}
