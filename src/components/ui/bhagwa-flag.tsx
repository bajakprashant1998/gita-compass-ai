import { cn } from '@/lib/utils';

interface BhagwaFlagProps {
  className?: string;
}

export function BhagwaFlag({ className }: BhagwaFlagProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={cn("h-5 w-5", className)} 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pole */}
      <rect x="3" y="2" width="2" height="20" rx="1" fill="currentColor" />
      {/* Triangular saffron flag */}
      <path 
        d="M5 4L19 10L5 16V4Z" 
        fill="currentColor"
      />
    </svg>
  );
}
