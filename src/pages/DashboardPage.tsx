import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useChatCount } from '@/hooks/useChatHistory';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ReadingProgressCard } from '@/components/dashboard/ReadingProgressCard';
import { SavedWisdomCard } from '@/components/dashboard/SavedWisdomCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { ReadingPlansWidget } from '@/components/dashboard/ReadingPlansWidget';
import { PreferencesCard } from '@/components/dashboard/PreferencesCard';
import { RecommendedVerses } from '@/components/dashboard/RecommendedVerses';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';
import { DailyAffirmation } from '@/components/dashboard/DailyAffirmation';
import { RecentlyReadWidget } from '@/components/dashboard/RecentlyReadWidget';
import { RadialGlow } from '@/components/ui/decorative-elements';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, BookOpen, Sparkles, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, signOut, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { data: favorites } = useFavorites(user?.id);
  const { data: progress } = useUserProgress(user?.id);
  const { data: chatCount } = useChatCount(user?.id);
  const { data: preferences, updatePreference } = useUserPreferences(user?.id);
  const { data: plansCompleted = 0 } = useQuery({
    queryKey: ['plans-completed-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_reading_plans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'completed');
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const [activeTab, setActiveTab] = useState('overview');
  const isSigningOut = useRef(false);

  useEffect(() => {
    if (!loading && !user && !isSigningOut.current) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 space-y-4">
          <div className="h-32 animate-pulse rounded-3xl bg-muted" />
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 animate-pulse rounded-2xl bg-muted" />
            <div className="h-64 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    isSigningOut.current = true;
    try {
      await Promise.race([
        signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
    } catch {
      // Sign out locally even if the API call fails or times out
    }
    toast.success('Signed out successfully');
    navigate('/');
  };

  const stagger = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      <div className="relative overflow-hidden min-h-[80vh]">
        {/* Subtle decorative glows */}
        <RadialGlow position="top-left" color="primary" className="opacity-30" />
        <RadialGlow position="bottom-right" color="amber" className="opacity-15" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10 max-w-7xl">
          {/* Hero */}
          <DashboardHero
            displayName={profile?.display_name}
            memberSince={profile?.created_at}
            onSignOut={handleSignOut}
            currentStreak={progress?.currentStreak || 0}
            versesRead={progress?.shloksRead.length || 0}
          />

          {/* Stats */}
          <DashboardStats
            favoritesCount={favorites?.length || 0}
            chaptersExplored={progress?.chaptersExplored.length || 0}
            versesRead={progress?.shloksRead.length || 0}
            currentStreak={progress?.currentStreak || 0}
            chatCount={chatCount || 0}
            language={profile?.preferred_language || 'english'}
            plansCompleted={plansCompleted}
          />

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-muted/50 border border-border/40 rounded-xl h-11 p-1">
              <TabsTrigger value="overview" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg gap-1.5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Daily Affirmation - Hero spot */}
              <motion.div {...stagger} transition={{ delay: 0.1 }}>
                <DailyAffirmation userId={user.id} versesRead={progress?.shloksRead || []} />
              </motion.div>

              {/* 3-column layout: Progress + Saved + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                <motion.div {...stagger} transition={{ delay: 0.15 }} className="lg:col-span-2">
                  <ReadingProgressCard
                    chaptersExplored={progress?.chaptersExplored.length || 0}
                    versesRead={progress?.shloksRead.length || 0}
                  />
                </motion.div>
                <motion.div {...stagger} transition={{ delay: 0.2 }}>
                  <SavedWisdomCard favorites={favorites || []} />
                </motion.div>
              </div>

              {/* Quick Actions - full width */}
              <motion.div {...stagger} transition={{ delay: 0.25 }}>
                <QuickActionsCard />
              </motion.div>
            </TabsContent>

            {/* PROGRESS TAB */}
            <TabsContent value="progress" className="mt-6 space-y-6">
              {/* Streak Calendar - full width hero */}
              <motion.div {...stagger} transition={{ delay: 0.1 }}>
                <StreakCalendar userId={user.id} currentStreak={progress?.currentStreak || 0} />
              </motion.div>

              {/* Two columns: Recently Read + Reading Plans */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                <motion.div {...stagger} transition={{ delay: 0.15 }}>
                  <RecentlyReadWidget shloksRead={progress?.shloksRead || []} />
                </motion.div>
                <motion.div {...stagger} transition={{ delay: 0.2 }}>
                  <ReadingPlansWidget userId={user.id} />
                </motion.div>
              </div>
            </TabsContent>

            {/* DISCOVER TAB */}
            <TabsContent value="discover" className="mt-6 space-y-6">
              <motion.div {...stagger} transition={{ delay: 0.1 }}>
                <RecommendedVerses userId={user.id} />
              </motion.div>
              <motion.div {...stagger} transition={{ delay: 0.15 }}>
                <SavedWisdomCard favorites={favorites || []} />
              </motion.div>
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="settings" className="mt-6">
              <motion.div {...stagger} transition={{ delay: 0.1 }} className="max-w-lg">
                <PreferencesCard
                  language={profile?.preferred_language || 'english'}
                  dailyWisdom={preferences?.dailyWisdomEnabled ?? true}
                  weeklyDigest={preferences?.weeklyDigestEnabled ?? true}
                  onLanguageChange={async (lang) => {
                    await updateProfile({ preferred_language: lang as 'english' | 'hindi' });
                  }}
                  onDailyWisdomChange={async (enabled) => {
                    updatePreference.mutate({ daily_wisdom_enabled: enabled });
                  }}
                  onWeeklyDigestChange={async (enabled) => {
                    updatePreference.mutate({ weekly_digest_enabled: enabled });
                  }}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
