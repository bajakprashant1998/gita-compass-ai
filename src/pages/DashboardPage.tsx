import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bookmark, 
  MessageCircle, 
  TrendingUp,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { data: favorites } = useFavorites(user?.id);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {profile?.display_name || 'Seeker'}
            </h1>
            <p className="text-muted-foreground">
              Continue your journey of wisdom
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Bookmark className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{favorites?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Saved Verses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">AI Chats</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {profile?.preferred_language === 'hindi' ? 'हिंदी' : 'EN'}
              </div>
              <div className="text-sm text-muted-foreground">Language</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Favorites */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Saved Wisdom
              </CardTitle>
              {favorites && favorites.length > 0 && (
                <Badge variant="secondary">{favorites.length}</Badge>
              )}
            </CardHeader>
            <CardContent>
              {favorites && favorites.length > 0 ? (
                <div className="space-y-3">
                  {favorites.slice(0, 5).map((fav) => (
                    <Link key={fav.id} to={`/chapters/${fav.shlok?.chapter?.chapter_number}/verse/${fav.shlok?.verse_number}`}>
                      <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-1">
                              Chapter {fav.shlok?.chapter?.chapter_number}, Verse {fav.shlok?.verse_number}
                            </Badge>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {fav.shlok?.english_meaning}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bookmark className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No saved verses yet
                  </p>
                  <Link to="/chapters">
                    <Button variant="outline">Explore Chapters</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Continue Your Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/chat">
                  <div className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer group flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        Talk to AI Coach
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Get personalized guidance
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </Link>

                <Link to="/chapters">
                  <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <Bookmark className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        Browse Chapters
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Explore all 18 chapters
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </Link>

                <Link to="/problems">
                  <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        Find by Problem
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Browse by life challenge
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
