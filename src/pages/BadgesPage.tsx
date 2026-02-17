import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { useBadgeDefinitions, useUserBadges } from '@/hooks/useBadges';
import { useAuth } from '@/hooks/useAuth';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function BadgesPage() {
  const { user } = useAuth();
  const { data: badges, isLoading } = useBadgeDefinitions();
  const { data: userBadges } = useUserBadges(user?.id);
  const { data: progress } = useUserProgress(user?.id);

  const earnedIds = new Set(userBadges?.map(b => b.badge_id) || []);

  const categories = [
    { key: 'reading', label: '📖 Reading', color: 'from-primary to-amber-500' },
    { key: 'streak', label: '🔥 Streaks', color: 'from-orange-500 to-red-500' },
    { key: 'exploration', label: '🗺️ Exploration', color: 'from-blue-500 to-cyan-500' },
    { key: 'community', label: '✍️ Community', color: 'from-purple-500 to-pink-500' },
    { key: 'plans', label: '🌟 Plans', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <Layout>
      <SEOHead
        title="Spiritual Progress Badges"
        description="Track your Bhagavad Gita reading journey with achievement badges. Earn rewards for reading verses, maintaining streaks, and exploring chapters."
        keywords={['badges', 'achievements', 'progress', 'Bhagavad Gita']}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Trophy className="h-4 w-4" />
              Achievement System
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Your Spiritual Badges</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Track your progress and earn badges as you deepen your understanding of the Bhagavad Gita.
            </p>

            {user && (
              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{earnedIds.size}</strong> / {badges?.length || 0} earned
                </span>
                <div className="h-4 w-px bg-border" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{progress?.shloksRead.length || 0}</strong> verses read
                </span>
              </div>
            )}
          </div>

          {!user && (
            <Card className="mb-8 border-primary/20">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">Sign in to track your badges and progress</p>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            categories.map(cat => {
              const catBadges = badges?.filter(b => b.category === cat.key) || [];
              if (catBadges.length === 0) return null;

              return (
                <div key={cat.key} className="mb-10">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    {cat.label}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catBadges.map((badge, idx) => {
                      const earned = earnedIds.has(badge.id);
                      return (
                        <Card
                          key={badge.id}
                          className={cn(
                            "relative overflow-hidden transition-all duration-300 animate-fade-in",
                            earned
                              ? "border-primary/30 shadow-lg shadow-primary/10"
                              : "opacity-60 grayscale"
                          )}
                          style={{ animationDelay: `${idx * 80}ms` }}
                        >
                          {earned && (
                            <div className={cn("h-1 bg-gradient-to-r", cat.color)} />
                          )}
                          <CardContent className="p-5 text-center">
                            <div className="text-4xl mb-3">{badge.icon}</div>
                            <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                            {earned ? (
                              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                <Sparkles className="h-3 w-3 mr-1" /> Earned
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" /> Locked
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
