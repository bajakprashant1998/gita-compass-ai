import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Shlok } from '@/types';

interface ShlokHeaderProps {
  shlok: Shlok;
}

export function ShlokHeader({ shlok }: ShlokHeaderProps) {
  return (
    <div className="mb-12 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/chapters" className="hover:text-primary transition-colors">Chapters</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/chapters/${shlok.chapter?.chapter_number}`} className="hover:text-primary transition-colors">
                Chapter {shlok.chapter?.chapter_number}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">Verse {shlok.verse_number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title - WebFX inspired bold typography */}
      <div className="text-center space-y-4">
        <Badge 
          variant="secondary" 
          className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border-0"
        >
          Bhagavad Gita
        </Badge>
        
        <h1 className="headline-bold text-gradient">
          Chapter {shlok.chapter?.chapter_number}: {shlok.chapter?.title_english}
        </h1>
        
        <h2 className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Verse {shlok.verse_number}
        </h2>

        {/* Quick stats bar */}
        <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Active Wisdom</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span>3 min read</span>
        </div>
      </div>
    </div>
  );
}
