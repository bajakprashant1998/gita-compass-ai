import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INDIAN_LANGUAGES } from './LanguageSelector';

interface LanguageBadgeProps {
  languageCode: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function LanguageBadge({ 
  languageCode, 
  className,
  showIcon = true,
  size = 'sm'
}: LanguageBadgeProps) {
  const language = INDIAN_LANGUAGES.find(l => l.code === languageCode);
  
  if (!language || languageCode === 'en') return null;

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 rounded-full",
        "bg-primary/10 text-primary border border-primary/20",
        size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {showIcon && <Globe className={cn(size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />}
      <span className="font-medium">{language.nativeName}</span>
    </span>
  );
}
