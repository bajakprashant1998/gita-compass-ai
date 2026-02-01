import { Flame, HelpCircle, Heart, Sparkles, Brain, Shield } from 'lucide-react';

interface QuickActionsBarProps {
  onQuickAction: (text: string) => void;
  disabled?: boolean;
}

const quickActions = [
  { icon: Heart, label: 'I need peace', text: "I'm feeling overwhelmed and need inner peace. How can the Gita help me find calm?" },
  { icon: HelpCircle, label: 'Help me decide', text: "I'm facing a difficult decision and can't figure out what to do. Can you guide me?" },
  { icon: Brain, label: "I'm anxious", text: "I'm experiencing anxiety about my future. What wisdom does the Gita offer?" },
  { icon: Shield, label: "I'm afraid", text: "I'm dealing with fear that's holding me back. How can I overcome it?" },
  { icon: Flame, label: "I'm angry", text: "I'm struggling with anger and frustration. What does the Gita teach about managing these emotions?" },
  { icon: Sparkles, label: 'Random wisdom', text: "Share a meaningful verse from the Bhagavad Gita that I can reflect on today." },
];

export function QuickActionsBar({ onQuickAction, disabled }: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => onQuickAction(action.text)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <action.icon className="h-3.5 w-3.5" />
          {action.label}
        </button>
      ))}
    </div>
  );
}
