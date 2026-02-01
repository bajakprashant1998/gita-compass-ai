import { Users } from 'lucide-react';

export function TrustBadges() {
  // Sample avatar colors for the stacked avatars
  const avatarColors = [
    'bg-amber-400',
    'bg-blue-400',
    'bg-green-400',
    'bg-purple-400',
    'bg-pink-400',
  ];

  return (
    <div className="flex items-center gap-4">
      {/* Stacked Avatars */}
      <div className="flex -space-x-3">
        {avatarColors.map((color, index) => (
          <div
            key={index}
            className={`w-10 h-10 rounded-full ${color} border-2 border-background flex items-center justify-center`}
            style={{ zIndex: avatarColors.length - index }}
          >
            <Users className="h-4 w-4 text-white/80" />
          </div>
        ))}
        <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold text-muted-foreground">
          +10K
        </div>
      </div>

      {/* Trust Text */}
      <div className="text-left">
        <p className="text-sm font-medium text-foreground">
          Trusted by 10,000+ seekers
        </p>
        <p className="text-xs text-muted-foreground">
          Finding clarity through ancient wisdom
        </p>
      </div>
    </div>
  );
}
