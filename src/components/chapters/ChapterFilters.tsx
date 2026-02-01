import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChapterFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedThemes: string[];
  onThemeToggle: (theme: string) => void;
  availableThemes: string[];
}

const themeColors: Record<string, string> = {
  'Karma': 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
  'Bhakti': 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400',
  'Jnana': 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  'Yoga': 'bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-400',
  'default': 'bg-muted text-muted-foreground hover:bg-muted/80',
};

export function ChapterFilters({
  searchQuery,
  onSearchChange,
  selectedThemes,
  onThemeToggle,
  availableThemes,
}: ChapterFiltersProps) {
  const hasFilters = searchQuery || selectedThemes.length > 0;

  const clearFilters = () => {
    onSearchChange('');
    selectedThemes.forEach(onThemeToggle);
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search chapters by title or theme..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Theme filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Filter by theme:</span>
        {availableThemes.map((theme) => {
          const isSelected = selectedThemes.includes(theme);
          const colorClass = Object.keys(themeColors).find(key => 
            theme.toLowerCase().includes(key.toLowerCase())
          );
          const colors = colorClass ? themeColors[colorClass] : themeColors.default;
          
          return (
            <button
              key={theme}
              onClick={() => onThemeToggle(theme)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isSelected 
                  ? `${colors} ring-2 ring-offset-2 ring-primary` 
                  : colors
              }`}
            >
              {theme}
            </button>
          );
        })}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
