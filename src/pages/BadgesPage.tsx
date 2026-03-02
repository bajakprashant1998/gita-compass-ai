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
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

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

      <div className="relative overflow-hidden">
        {/* Premium Hero */}
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b border-border/50">
          <RadialGlow position="top-left" color="primary" className="opacity-30" />
          <RadialGlow position="bottom-right" color="amber" className="opacity-20" />
          <FloatingOm className="top-8 right-8 animate-float hidden lg:block" />

          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in border border-primary/20">
                <Trophy className="h-4 w-4" />
                Achievement System
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight animate-fade-in">
                Your Spiritual{' '}
                <span className="text-gradient">Badges</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in">
                Track your progress and earn badges as you deepen your understanding of the Bhagavad Gita.
              </p>

              {user && (
                <div className="mt-8 flex items-center justify-center gap-8 animate-fade-in">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-primary">{earnedIds.size}</div>
                    <div className="text-xs text-muted-foreground mt-1">Earned</div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-foreground">{badges?.length || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total</div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-foreground">{progress?.shloksRead.length || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Verses Read</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto">
            {!user && (
              <Card className="mb-8 border-primary/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Sign in to track your badges and progress</p>
                  <Link to="/auth">
                    <Button className="bg-gradient-to-r from-primary to-primary/80">Sign In</Button>
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
                              "group relative overflow-hidden transition-all duration-300 animate-fade-in hover:-translate-y-1",
                              earned
                                ? "border-primary/30 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15"
                                : "opacity-60 grayscale hover:opacity-80"
                            )}
                            style={{ animationDelay: `${idx * 80}ms` }}
                          >
                            {earned && (
                              <>
                                <div className={cn("h-1.5 bg-gradient-to-r", cat.color)} />
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              </>
                            )}
                            <CardContent className="p-5 text-center relative">
                              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{badge.icon}</div>
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
      </div>
    </Layout>
  );
}
