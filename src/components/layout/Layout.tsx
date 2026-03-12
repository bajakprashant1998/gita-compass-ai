import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { DynamicBreadcrumbs } from './DynamicBreadcrumbs';

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
  hideBreadcrumbs?: boolean;
}

export function Layout({ children, hideFooter, hideHeader, hideBreadcrumbs }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <Header />}
      {!hideBreadcrumbs && <DynamicBreadcrumbs />}
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
