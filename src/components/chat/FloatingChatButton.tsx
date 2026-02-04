import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FloatingChatButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  // Don't show on chat page
  const isChatPage = location.pathname === '/chat';

  // Hide pulse after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isChatPage) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      )}
    >
      {/* Tooltip */}
      <div 
        className={cn(
          "absolute bottom-full right-0 mb-3 whitespace-nowrap transition-all duration-200",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        )}
      >
        <div className="bg-foreground text-background text-sm font-medium px-4 py-2 rounded-xl shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Ask Gita Wisdom AI</span>
          </div>
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-foreground"></div>
        </div>
      </div>

      {/* Main Button */}
      <Button
        onClick={() => navigate('/chat')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative w-16 h-16 rounded-full shadow-2xl",
          "bg-gradient-to-br from-primary via-primary to-amber-500",
          "hover:from-primary hover:via-amber-500 hover:to-primary",
          "hover:scale-110 hover:shadow-primary/40 hover:shadow-2xl",
          "transition-all duration-300 group"
        )}
      >
        {/* Pulse ring */}
        {showPulse && (
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/40" />
        )}
        
        {/* Glow effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-amber-500 blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
        
        {/* Icon */}
        <span className="relative flex items-center justify-center">
          <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
        </span>

        {/* Notification dot */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      </Button>
    </div>
  );
}
