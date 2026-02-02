import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Shlok } from '@/types';

interface VerseCardProps {
  shlok: Shlok;
  chapterNumber: number;
  animationDelay?: number;
}

export function VerseCard({ shlok, chapterNumber, animationDelay = 0 }: VerseCardProps) {
  return (
    <Link 
      to={`/chapters/${chapterNumber}/verse/${shlok.verse_number}`}
      className="block animate-fade-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <article className="verse-card group">
        {/* Left Gradient Border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-amber-500 to-orange-500 rounded-l-2xl" />
        
        {/* Card Content */}
        <div className="pl-6 pr-6 py-6">
          {/* Header: Verse Number + Arrow */}
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Verse
              </span>
              <span className="text-3xl md:text-4xl font-extrabold text-gradient">
                {shlok.verse_number}
              </span>
            </div>
            
            <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="text-sm mr-2 hidden sm:block">Read Now</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </header>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-primary/30 via-amber-500/30 to-transparent mb-5" />
          
          {/* Sanskrit Text Block */}
          <div className="mb-5">
            <p className="sanskrit text-base md:text-lg text-center font-bold bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent whitespace-pre-line line-clamp-3 leading-relaxed">
              ॥ {shlok.sanskrit_text.split('\n').slice(0, 2).join(' ')} ॥
            </p>
          </div>
          
          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-5" />
          
          {/* English Meaning */}
          <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
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
