import { HelpCircle, Heart, Sparkles, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickActionsBarProps {
  onQuickAction: (text: string) => void;
  disabled?: boolean;
}

const quickActions = [
  { 
    icon: Heart, 
    label: 'I need peace', 
    text: "I'm feeling overwhelmed and need inner peace. How can the Gita help me find calm?", 
    color: 'hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400',
    tooltip: 'Find guidance for inner peace and calm'
  },
  { 
    icon: HelpCircle, 
    label: 'Help me decide', 
    text: "I'm facing a difficult decision and can't figure out what to do. Can you guide me?", 
    color: 'hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400',
    tooltip: 'Get help with difficult decisions'
  },
  { 
    icon: Brain, 
    label: "I'm anxious", 
    text: "I'm experiencing anxiety about my future. What wisdom does the Gita offer?", 
    color: 'hover:border-teal-500/50 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400',
    tooltip: 'Wisdom for dealing with anxiety'
  },
  { 
    icon: Sparkles, 
    label: 'Random wisdom', 
    text: "Share a meaningful verse from the Bhagavad Gita that I can reflect on today.", 
    color: 'hover:border-primary/50 hover:bg-primary/10 hover:text-primary',
    tooltip: 'Get a random verse for reflection'
  },
];

export function QuickActionsBar({ onQuickAction, disabled }: QuickActionsBarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-2 mb-3 overflow-x-auto md:flex-wrap md:overflow-visible scrollbar-hide pb-1 md:pb-0 snap-x snap-mandatory md:snap-none">
        {quickActions.map((action) => (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onQuickAction(action.text)}
                disabled={disabled}
                className={cn(
                  "inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full min-h-[40px] md:min-h-[44px]",
                  "bg-card border border-border/50 text-xs md:text-sm font-medium text-muted-foreground",
                  "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none",
                  "whitespace-nowrap flex-shrink-0 snap-start",
                  action.color
                )}
              >
                <action.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>{action.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px]">
              <p>{action.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
