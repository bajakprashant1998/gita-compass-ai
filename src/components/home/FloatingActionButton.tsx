import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, MessageCircle, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const actions = [
  {
    icon: MessageCircle,
    label: 'Chat with AI',
    href: '/chat',
    color: 'bg-primary hover:bg-primary/90',
  },
  {
    icon: Sparkles,
    label: 'Random Wisdom',
    href: '/#daily-wisdom',
    color: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    icon: BookOpen,
    label: 'Explore Chapters',
    href: '/chapters',
    color: 'bg-teal-500 hover:bg-teal-600',
  },
];

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Action buttons */}
      <div className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action) => (
          <Link key={action.href} to={action.href} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-3 justify-end">
              <span className="bg-card shadow-lg px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap">
                {action.label}
              </span>
              <Button
                size="icon"
                className={`h-12 w-12 rounded-full shadow-lg text-white ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
              </Button>
            </div>
          </Link>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 ${
          isOpen 
            ? 'bg-muted-foreground hover:bg-muted-foreground/90 rotate-45' 
            : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
