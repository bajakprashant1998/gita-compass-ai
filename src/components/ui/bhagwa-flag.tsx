import { cn } from '@/lib/utils';

interface BhagwaFlagProps {
  className?: string;
}

export function BhagwaFlag({ className }: BhagwaFlagProps) {
  return (
    <img 
      src="/logo.png" 
      alt="Bhagavad Gita Gyan" 
      className={cn("object-contain", className)}
    />
  );
}
