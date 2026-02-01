import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIGenerateButtonProps {
  label?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onGenerate: () => Promise<string | void>;
  onSuccess?: (content: string) => void;
  onError?: (error: string) => void;
}

export function AIGenerateButton({
  label = 'Generate',
  disabled = false,
  className,
  variant = 'outline',
  size = 'sm',
  onGenerate,
  onSuccess,
  onError,
}: AIGenerateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    try {
      const result = await onGenerate();
      if (result && onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Generation failed';
      if (onError) {
        onError(message);
      }
      console.error('AI generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn('gap-1.5', className)}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );
}
