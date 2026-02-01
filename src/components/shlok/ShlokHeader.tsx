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
    <div className="mb-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/chapters">Chapters</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/chapters/${shlok.chapter?.chapter_number}`}>
                Chapter {shlok.chapter?.chapter_number}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Shlok {shlok.verse_number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="text-center">
        <Badge variant="secondary" className="mb-4 text-sm px-4 py-1">
          Bhagavad Gita
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Chapter {shlok.chapter?.chapter_number} | Shlok {shlok.verse_number}
        </h1>
        <p className="text-muted-foreground text-lg">
          {shlok.chapter?.title_english}
        </p>
      </div>
    </div>
  );
}
