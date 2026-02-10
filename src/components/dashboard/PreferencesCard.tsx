import { useState } from 'react';
import { Settings, Globe, Sun, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { GradientBorderCard } from '@/components/ui/decorative-elements';
import { toast } from 'sonner';

interface PreferencesCardProps {
  language: string;
  dailyWisdom: boolean;
  onLanguageChange: (lang: string) => Promise<void>;
  onDailyWisdomChange: (enabled: boolean) => Promise<void>;
}

export function PreferencesCard({
  language,
  dailyWisdom,
  onLanguageChange,
  onDailyWisdomChange,
}: PreferencesCardProps) {
  const isHindi = language === 'hindi';
  const [langSaving, setLangSaving] = useState(false);
  const [wisdomSaving, setWisdomSaving] = useState(false);

  const handleLanguageToggle = async (checked: boolean) => {
    setLangSaving(true);
    try {
      await onLanguageChange(checked ? 'hindi' : 'english');
      toast.success(`Language changed to ${checked ? 'हिंदी' : 'English'}`);
    } catch {
      toast.error('Failed to update language');
    } finally {
      setLangSaving(false);
    }
  };

  const handleWisdomToggle = async (checked: boolean) => {
    setWisdomSaving(true);
    try {
      await onDailyWisdomChange(checked);
      toast.success(checked ? 'Daily wisdom enabled' : 'Daily wisdom disabled');
    } catch {
      toast.error('Failed to update preference');
    } finally {
      setWisdomSaving(false);
    }
  };

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Quick Settings</h2>
        </div>

        <div className="space-y-3">
          {/* Language Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 touch-target transition-colors hover:bg-muted">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Language</p>
                <p className="text-xs text-muted-foreground">
                  {isHindi ? 'हिंदी' : 'English'}
                </p>
              </div>
            </div>
            <Switch
              checked={isHindi}
              onCheckedChange={handleLanguageToggle}
              disabled={langSaving}
            />
          </div>

          {/* Daily Wisdom Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 touch-target transition-colors hover:bg-muted">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sun className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Daily Wisdom</p>
                <p className="text-xs text-muted-foreground">
                  Receive daily verse inspiration
                </p>
              </div>
            </div>
            <Switch
              checked={dailyWisdom}
              onCheckedChange={handleWisdomToggle}
              disabled={wisdomSaving}
            />
          </div>

          {/* Saved indicator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Check className="h-3 w-3" />
            <span>Settings saved automatically</span>
          </div>
        </div>
      </div>
    </GradientBorderCard>
  );
}
