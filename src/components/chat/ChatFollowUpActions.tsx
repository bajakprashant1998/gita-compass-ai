import { Button } from '@/components/ui/button';
import { Lightbulb, ListChecks, BookOpen, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatFollowUpActionsProps {
  onAction: (text: string) => void;
  disabled?: boolean;
  messageCount: number;
  className?: string;
}

export function ChatFollowUpActions({ onAction, disabled, messageCount, className }: ChatFollowUpActionsProps) {
  // Show different actions based on conversation depth
  const isEarlyConversation = messageCount <= 2;
  
  const actions = isEarlyConversation ? [
    { icon: MessageCircle, label: "Go deeper into this", prompt: "I want to explore this more deeply. Please ask me more questions to understand my situation better." },
    { icon: BookOpen, label: "Show me relevant verses", prompt: "Can you show me the most relevant Bhagavad Gita verses for my situation?" },
  ] : [
    { icon: ListChecks, label: "Create my action plan", prompt: "Please create a detailed personal action plan for me based on our conversation, with daily Gita practices." },
    { icon: Lightbulb, label: "Explain differently", prompt: "Can you explain this in a different way? Maybe with a modern story or example from daily life." },
    { icon: BookOpen, label: "More verses on this", prompt: "Show me more Bhagavad Gita verses related to my situation with practical applications." },
    { icon: MessageCircle, label: "I have a follow-up", prompt: "" },
  ];

  return (
    <div className={cn("ml-10 md:ml-12 flex flex-wrap gap-1.5 mt-1", className)}>
      {actions.map((action, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => action.prompt && onAction(action.prompt)}
          className="h-7 text-[11px] gap-1.5 rounded-full border-primary/15 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/25 transition-all"
        >
          <action.icon className="h-3 w-3" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
