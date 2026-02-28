import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, ArrowRight, Flame } from 'lucide-react';
import { PopularBadge } from '@/components/ui/decorative-elements';

const chapterTeachings: Record<number, string[]> = {
  1: ['Arjuna\'s moral dilemma', 'The conflict of duty', 'Seeking divine guidance'],
  2: ['The immortal soul', 'Karma Yoga introduction', 'Equanimity in action'],
  3: ['Importance of action', 'Selfless service', 'Leading by example'],
  4: ['Divine incarnation', 'Sacrifice of knowledge', 'Finding a teacher'],
  5: ['Renunciation vs action', 'True renunciation', 'Inner peace'],
  6: ['Meditation practices', 'Controlling the mind', 'Self-discipline'],
  7: ['Knowledge and wisdom', 'Material and spiritual nature', 'Surrendering to God'],
  8: ['The eternal question', 'Remembrance at death', 'Path to liberation'],
  9: ['Royal knowledge', 'Supreme secret', 'Devotion\'s power'],
  10: ['Divine manifestations', 'Glory of God', 'Recognition of divinity'],
  11: ['Universal form vision', 'Cosmic perspective', 'Awe and devotion'],
  12: ['Path of devotion', 'Personal vs formless', 'Qualities of devotees'],
  13: ['Field and knower', 'Knowledge of self', 'Liberation path'],
  14: ['Three gunas', 'Nature\'s qualities', 'Transcendence'],
  15: ['Supreme person', 'Tree of life analogy', 'Ultimate reality'],
  16: ['Divine vs demonic', 'Character qualities', 'Path to elevation'],
  17: ['Three types of faith', 'Food and worship', 'Austerity forms'],
  18: ['Final teachings', 'Surrender completely', 'Attaining liberation'],
};

const popularChapters = [2, 11, 18];

const chapterGradients: Record<number, string> = {
  1: 'from-rose-500 to-pink-600',
  2: 'from-primary to-amber-500',
  3: 'from-orange-500 to-red-500',
  4: 'from-amber-500 to-yellow-500',
  5: 'from-emerald-500 to-teal-500',
  6: 'from-cyan-500 to-blue-500',
  7: 'from-blue-500 to-indigo-500',
  8: 'from-indigo-500 to-purple-500',
  9: 'from-purple-500 to-pink-500',
  10: 'from-primary to-orange-500',
  11: 'from-amber-500 to-primary',
  12: 'from-rose-500 to-primary',
  13: 'from-teal-500 to-cyan-500',
  14: 'from-violet-500 to-purple-500',
  15: 'from-sky-500 to-blue-500',
  16: 'from-red-500 to-rose-500',
  17: 'from-orange-400 to-amber-500',
  18: 'from-primary to-amber-600',
};

interface Chapter {
  id: string;
  chapter_number: number;
  title_english: string;
  title_sanskrit?: string | null;
  theme: string;
  verse_count: number | null;
  description_english?: string | null;
}

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
}

export function ChapterCard({ chapter, index }: ChapterCardProps) {
  const teachings = chapterTeachings[chapter.chapter_number] || [];
  const isPopular = popularChapters.includes(chapter.chapter_number);
  const gradient = chapterGradients[chapter.chapter_number] || 'from-primary to-amber-500';

  return (
    <Link
      id={`chapter-${chapter.chapter_number}`}
      to={`/chapters/${chapter.chapter_number}`}
      className="animate-fade-in block"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="group h-full relative rounded-2xl overflow-hidden">
        {/* Accent top bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10",
          gradient
        )} />

        {/* Left gradient border */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b z-10 transition-all duration-300 group-hover:w-1.5", gradient)} />

        <div className={cn(
          "h-full border border-l-0 border-border/40 bg-card rounded-r-2xl transition-all duration-500",
          "group-hover:border-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2"
        )}>
          {/* Watermark chapter number */}
          <div className="absolute -top-2 -right-2 text-[7rem] font-black text-muted/[0.06] select-none pointer-events-none transition-all duration-700 group-hover:text-primary/[0.08] group-hover:scale-110 group-hover:-translate-y-2 leading-none">
            {chapter.chapter_number}
          </div>

          <div className="relative p-5 sm:p-6 flex flex-col h-full">
            {/* Top row: badge + verse count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-white text-xs font-bold uppercase tracking-wider shadow-sm bg-gradient-to-r",
                  gradient
                )}>
                  <span className="opacity-80 text-[10px]">CH</span>
                  {chapter.chapter_number}
                </span>
                {isPopular && <PopularBadge />}
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium bg-muted/50 px-2.5 py-1 rounded-full">
                <BookOpen className="h-3.5 w-3.5" />
                {chapter.verse_count}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-primary transition-colors duration-300 leading-tight">
              {chapter.title_english}
            </h2>
            {chapter.title_sanskrit && (
              <p className="text-sm text-muted-foreground/70 sanskrit mb-3 leading-relaxed">
                {chapter.title_sanskrit}
              </p>
            )}

            {/* Theme pill */}
            <div className="mb-4">
              <span className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-300",
                "bg-primary/5 text-primary border-primary/15 group-hover:bg-primary/10 group-hover:border-primary/25"
              )}>
                {chapter.theme}
              </span>
            </div>

            {/* Key teachings */}
            {teachings.length > 0 && (
              <ul className="hidden sm:flex flex-col gap-1.5 text-sm text-muted-foreground mb-5">
                {teachings.slice(0, 2).map((teaching) => (
                  <li key={teaching} className="flex items-start gap-2">
                    <Flame className="h-3.5 w-3.5 mt-0.5 text-primary/60 shrink-0" />
                    <span className="leading-snug">{teaching}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA footer */}
            <div className="flex items-center text-sm font-semibold mt-auto pt-4 border-t border-border/30">
              <span className={cn(
                "bg-gradient-to-r bg-clip-text text-transparent",
                gradient
              )}>
                Explore Chapter
              </span>
              <ArrowRight className="h-4 w-4 ml-auto text-primary transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
