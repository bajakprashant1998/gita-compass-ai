import { Flame, HelpCircle, Heart, Sparkles, Brain, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsBarProps {
  onQuickAction: (text: string) => void;
  disabled?: boolean;
}

const quickActions = [
  { icon: Heart, label: 'I need peace', text: "I'm feeling overwhelmed and need inner peace. How can the Gita help me find calm?", color: 'hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400' },
  { icon: HelpCircle, label: 'Help me decide', text: "I'm facing a difficult decision and can't figure out what to do. Can you guide me?", color: 'hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400' },
  { icon: Brain, label: "I'm anxious", text: "I'm experiencing anxiety about my future. What wisdom does the Gita offer?", color: 'hover:border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400' },
  { icon: Shield, label: "I'm afraid", text: "I'm dealing with fear that's holding me back. How can I overcome it?", color: 'hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400' },
  { icon: Flame, label: "I'm angry", text: "I'm struggling with anger and frustration. What does the Gita teach about managing these emotions?", color: 'hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400' },
  { icon: Sparkles, label: 'Random wisdom', text: "Share a meaningful verse from the Bhagavad Gita that I can reflect on today.", color: 'hover:border-primary/50 hover:bg-primary/10 hover:text-primary' },
];

export function QuickActionsBar({ onQuickAction, disabled }: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => onQuickAction(action.text)}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-full",
            "bg-card border border-border/50 text-sm font-medium text-muted-foreground",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            action.color
          )}
        >
          <action.icon className="h-3.5 w-3.5" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
