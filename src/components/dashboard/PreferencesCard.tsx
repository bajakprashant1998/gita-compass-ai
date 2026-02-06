import { Settings, Globe, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { GradientBorderCard } from '@/components/ui/decorative-elements';

interface PreferencesCardProps {
  language: string;
  dailyWisdom: boolean;
  onLanguageChange: (lang: string) => void;
  onDailyWisdomChange: (enabled: boolean) => void;
}

export function PreferencesCard({
  language,
  dailyWisdom,
  onLanguageChange,
  onDailyWisdomChange,
}: PreferencesCardProps) {
  const isHindi = language === 'hindi';

  return (
    <GradientBorderCard>
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Quick Settings</h2>
        </div>

        <div className="space-y-4">
          {/* Language Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 touch-target">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Language</p>
                <p className="text-xs text-muted-foreground">
                  {isHindi ? 'हिंदी' : 'English'}
                </p>
              </div>
            </div>
            <Switch
              checked={isHindi}
              onCheckedChange={(checked) =>
                onLanguageChange(checked ? 'hindi' : 'english')
              }
            />
          </div>

          {/* Daily Wisdom Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 touch-target">
            <div className="flex items-center gap-3">
              <Sun className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Daily Wisdom</p>
                <p className="text-xs text-muted-foreground">
                  Receive daily verse inspiration
                </p>
              </div>
            </div>
            <Switch
              checked={dailyWisdom}
              onCheckedChange={onDailyWisdomChange}
            />
          </div>
        </div>
      </div>
    </GradientBorderCard>
  );
}
