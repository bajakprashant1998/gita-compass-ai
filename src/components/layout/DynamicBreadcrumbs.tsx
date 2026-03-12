import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function buildBreadcrumbs(pathname: string, params: Record<string, string | undefined>): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [];

  if (pathname === '/') return [];

  // Chapter detail
  if (pathname.startsWith('/chapters/') && params.chapterNumber && params.verseNumber) {
    crumbs.push({ label: 'Chapters', href: '/chapters' });
    crumbs.push({ label: `Chapter ${params.chapterNumber}`, href: `/chapters/${params.chapterNumber}` });
    crumbs.push({ label: `Verse ${params.verseNumber}` });
    return crumbs;
  }
  if (pathname.startsWith('/chapters/') && params.chapterNumber) {
    crumbs.push({ label: 'Chapters', href: '/chapters' });
    crumbs.push({ label: `Chapter ${params.chapterNumber}` });
    return crumbs;
  }
  if (pathname === '/chapters') {
    crumbs.push({ label: 'Chapters' });
    return crumbs;
  }

  // Problems
  if (pathname.startsWith('/problems/') && params.slug) {
    crumbs.push({ label: 'Life Problems', href: '/problems' });
    crumbs.push({ label: params.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
    return crumbs;
  }
  if (pathname === '/problems') {
    crumbs.push({ label: 'Life Problems' });
    return crumbs;
  }

  // Blog
  if (pathname.startsWith('/blog/') && params.slug) {
    crumbs.push({ label: 'Blog', href: '/blog' });
    crumbs.push({ label: params.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
    return crumbs;
  }
  if (pathname === '/blog') {
    crumbs.push({ label: 'Blog' });
    return crumbs;
  }

  // Reading plans
  if (pathname.startsWith('/reading-plans/') && params.planId) {
    crumbs.push({ label: 'Reading Plans', href: '/reading-plans' });
    crumbs.push({ label: 'Plan Details' });
    return crumbs;
  }
  if (pathname === '/reading-plans') {
    crumbs.push({ label: 'Reading Plans' });
    return crumbs;
  }

  // Hindi routes
  if (pathname.startsWith('/hi/chapters/') && params.chapterNumber && params.verseNumber) {
    crumbs.push({ label: 'हिंदी', href: '/hi' });
    crumbs.push({ label: `अध्याय ${params.chapterNumber}`, href: `/hi/chapters/${params.chapterNumber}` });
    crumbs.push({ label: `श्लोक ${params.verseNumber}` });
    return crumbs;
  }
  if (pathname.startsWith('/hi/chapters/') && params.chapterNumber) {
    crumbs.push({ label: 'हिंदी', href: '/hi' });
    crumbs.push({ label: `अध्याय ${params.chapterNumber}` });
    return crumbs;
  }

  // Simple page names
  const pageNames: Record<string, string> = {
    '/chat': 'Talk to Krishna',
    '/mood': 'Mood Finder',
    '/compare': 'Compare Verses',
    '/contact': 'Contact',
    '/donate': 'Donate',
    '/badges': 'Badges',
    '/study-groups': 'Study Groups',
    '/install': 'Install App',
    '/dashboard': 'Dashboard',
    '/hi': 'हिंदी',
  };

  if (pageNames[pathname]) {
    crumbs.push({ label: pageNames[pathname] });
    return crumbs;
  }

  // Programmatic SEO pages
  if (pathname.startsWith('/bhagavad-gita-on-')) {
    const topic = pathname.replace('/bhagavad-gita-on-', '').replace(/-/g, ' ');
    crumbs.push({ label: `Gita on ${topic.replace(/\b\w/g, c => c.toUpperCase())}` });
    return crumbs;
  }

  return crumbs;
}

export function DynamicBreadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const crumbs = buildBreadcrumbs(location.pathname, params);

  if (crumbs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bhagavadgitagyan.com' },
      ...crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.label,
        ...(c.href ? { item: `https://www.bhagavadgitagyan.com${c.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-2.5">
        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-muted-foreground">
          <li className="inline-flex items-center">
            <Link to="/" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </li>
          {crumbs.map((crumb, i) => (
            <li key={i} className="inline-flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              {crumb.href && i < crumbs.length - 1 ? (
                <Link to={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate max-w-[200px]">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
