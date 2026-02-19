import { Users, Shield, Star } from 'lucide-react';

export function TrustBadges() {
  const avatarInitials = ['R', 'P', 'A', 'S', 'V'];
  const avatarColors = [
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Stacked Avatars */}
      <div className="flex items-center gap-4">
        <div className="flex -space-x-3">
          {avatarInitials.map((initial, index) => (
            <div
              key={index}
              className={`w-10 h-10 rounded-full ${avatarColors[index]} border-2 border-background flex items-center justify-center text-white font-bold text-sm shadow-md`}
              style={{ zIndex: avatarInitials.length - index }}
            >
              {initial}
            </div>
          ))}
          <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold text-muted-foreground">
            +10K
          </div>
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-foreground">
            Trusted by 10,000+ seekers
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">4.9/5</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-10 bg-border" />

      {/* Security badge */}
      <div className="flex items-center gap-2 text-sm">
        <Shield className="h-5 w-5 text-emerald-500" />
        <span className="text-muted-foreground font-medium">100% Free & Private</span>
      </div>
    </div>
  );
}