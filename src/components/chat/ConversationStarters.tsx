import { Briefcase, Heart, Brain, Compass, Sparkles, ArrowRight } from 'lucide-react';

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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 text-primary mb-6 animate-fade-in">
            <Sparkles className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold mb-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
            How can I help you today?
          </h3>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '150ms' }}>
            Share what's on your mind, or choose a topic to explore
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {categories.map((category, catIndex) => (
            <div 
              key={category.label} 
              className="space-y-3 animate-fade-in"
              style={{ animationDelay: `${200 + catIndex * 100}ms` }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                  <category.icon className={`h-5 w-5 ${category.textColor}`} />
                </div>
                <span className={`font-semibold ${category.textColor}`}>
                  {category.label}
                </span>
              </div>
              
              {/* Prompts */}
              <div className="space-y-2 pl-1">
                {category.prompts.slice(0, 2).map((prompt, promptIndex) => (
                  <button
                    key={prompt}
                    onClick={() => onSelect(prompt)}
                    className="group w-full text-left p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                    style={{ animationDelay: `${300 + catIndex * 100 + promptIndex * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex-1">{prompt}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
