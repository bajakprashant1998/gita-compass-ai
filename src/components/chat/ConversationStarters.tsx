import { Briefcase, Heart, Brain, Compass, Sparkles } from 'lucide-react';

interface ConversationStartersProps {
  onSelect: (text: string) => void;
}

const categories = [
  {
    icon: Briefcase,
    label: 'Work & Career',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    prompts: [
      "I'm burned out at work and don't know how to find balance",
      "I'm facing an ethical dilemma at my job",
      "I feel stuck in my career and want purpose",
    ],
  },
  {
    icon: Heart,
    label: 'Relationships',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    prompts: [
      "I'm struggling to forgive someone who hurt me",
      "I feel disconnected from my loved ones",
      "How do I maintain peace in difficult relationships?",
    ],
  },
  {
    icon: Brain,
    label: 'Inner Peace',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    prompts: [
      "My mind is constantly racing with worries",
      "I can't seem to let go of past regrets",
      "How do I find contentment with what I have?",
    ],
  },
  {
    icon: Compass,
    label: 'Life Decisions',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    prompts: [
      "I'm at a crossroads and don't know which path to take",
      "I'm afraid of making the wrong choice",
      "How do I know what my true purpose is?",
    ],
  },
];

export function ConversationStarters({ onSelect }: ConversationStartersProps) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
          <p className="text-muted-foreground">
            Share what's on your mind, or choose a topic to explore
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div key={category.label} className="space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${category.color}`}>
                <category.icon className="h-4 w-4" />
                {category.label}
              </div>
              <div className="space-y-2">
                {category.prompts.slice(0, 2).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onSelect(prompt)}
                    className="w-full text-left p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 text-sm transition-colors"
                  >
                    {prompt}
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
