import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { PreferencesCard } from '@/components/dashboard/PreferencesCard';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

export default function DashboardPage() {
  const { user, profile, signOut, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { data: favorites } = useFavorites(user?.id);
  const { data: progress } = useUserProgress(user?.id);
  const { data: chatCount } = useChatCount(user?.id);
  const { data: preferences, updatePreference } = useUserPreferences(user?.id);

  // Fix: use useEffect for redirect instead of render-time navigate
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      // error handled silently
    }
  };

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Decorative background */}
        <RadialGlow position="top-left" color="primary" className="opacity-40" />
        <RadialGlow position="top-right" color="amber" className="opacity-30" />
        <FloatingOm className="top-20 right-10 animate-float hidden md:block" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          {/* Hero */}
          <DashboardHero
            displayName={profile?.display_name}
            memberSince={profile?.created_at}
            onSignOut={handleSignOut}
          />

          {/* Stats */}
          <DashboardStats
            favoritesCount={favorites?.length || 0}
            chaptersExplored={progress?.chaptersExplored.length || 0}
            versesRead={progress?.shloksRead.length || 0}
            currentStreak={progress?.currentStreak || 0}
            chatCount={chatCount || 0}
            language={profile?.preferred_language || 'english'}
          />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
            <ReadingProgressCard
              chaptersExplored={progress?.chaptersExplored.length || 0}
              versesRead={progress?.shloksRead.length || 0}
            />
            <SavedWisdomCard favorites={favorites || []} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pb-safe">
            <QuickActionsCard />
            <PreferencesCard
              language={profile?.preferred_language || 'english'}
              dailyWisdom={preferences?.dailyWisdomEnabled ?? true}
              onLanguageChange={async (lang) => {
                await updateProfile({ preferred_language: lang as 'english' | 'hindi' });
              }}
              onDailyWisdomChange={async (enabled) => {
                updatePreference.mutate({ daily_wisdom_enabled: enabled });
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
