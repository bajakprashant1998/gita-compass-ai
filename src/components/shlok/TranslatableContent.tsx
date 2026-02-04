import { ReactNode } from 'react';
import { getScriptClass, isRTL } from './PageLanguageSelector';

interface TranslatableContentProps {
  children: ReactNode;
  languageCode: string;
  className?: string;
  as?: 'p' | 'span' | 'div';
}

export function TranslatableContent({ 
  children, 
  languageCode, 
  className = '',
  as: Component = 'p'
}: TranslatableContentProps) {
  const scriptClass = getScriptClass(languageCode);
  const rtl = isRTL(languageCode);

  return (
    <Component 
      className={`${scriptClass} ${className}`}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {children}
    </Component>
  );
}
