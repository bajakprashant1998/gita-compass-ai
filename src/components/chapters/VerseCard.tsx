import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Shlok } from '@/types';
import { cn } from '@/lib/utils';

interface VerseCardProps {
  shlok: Shlok;
  chapterNumber: number;
  animationDelay?: number;
  compact?: boolean;
}

export function VerseCard({ shlok, chapterNumber, animationDelay = 0, compact = false }: VerseCardProps) {
  return (
    <Link 
      to={`/chapters/${chapterNumber}/verse/${shlok.verse_number}`}
      className="block animate-fade-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <article className={cn(
        "verse-card group relative overflow-hidden rounded-2xl bg-card border border-border/50",
        "transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
      )}>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Left Gradient Border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-amber-500 to-orange-500 rounded-l-2xl" />
        
        {/* Card Content */}
        <div className={cn("pl-6 pr-6", compact ? "py-4" : "py-6")}>
          {/* Header: Verse Number + Arrow */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Verse
              </span>
              <span className={cn(
                "font-extrabold text-gradient",
                compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
              )}>
                {shlok.verse_number}
              </span>
            </div>
            
            <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="text-sm mr-2 hidden sm:block">Read Now</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-amber-500 flex items-center justify-center">
                <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </header>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-primary/30 via-amber-500/30 to-transparent mb-4" />
          
          {/* Sanskrit Text Block - Bold with saffron gradient */}
          <div className={cn("mb-4", compact && "hidden md:block")}>
            <p className={cn(
              "sanskrit text-center font-bold",
              "bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent",
              "whitespace-pre-line leading-relaxed",
              compact ? "text-base line-clamp-2" : "text-base md:text-lg line-clamp-3"
            )}>
              ॥ {shlok.sanskrit_text.split('\n').slice(0, 2).join(' ')} ॥
            </p>
          </div>
          
          {/* Divider */}
          {!compact && (
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />
          )}
          
          {/* English Meaning */}
          <p className={cn(
            "text-muted-foreground leading-relaxed mb-4",
            compact ? "text-sm line-clamp-1" : "text-sm md:text-base line-clamp-2"
          )}>
            "{shlok.english_meaning}"
          </p>
          
          {/* Context Indicators */}
          <footer className="flex flex-wrap gap-2">
            {shlok.modern_story && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <span>📖</span>
                <span className="line-clamp-1 max-w-[180px]">Story included</span>
              </div>
            )}
            {shlok.life_application && !shlok.modern_story && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <span>💡</span>
                <span className="line-clamp-1 max-w-[180px]">Life application</span>
              </div>
            )}
            {shlok.practical_action && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">
                <span>✨</span>
                <span>Action step</span>
              </div>
            )}
          </footer>
        </div>
      </article>
    </Link>
  );
}
