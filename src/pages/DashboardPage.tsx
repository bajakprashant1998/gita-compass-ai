import { useEffect, useRef } from 'react';
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
import { PreferencesCard } from '@/components/dashboard/PreferencesCard';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, profile, signOut, loading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { data: favorites } = useFavorites(user?.id);
  const { data: progress } = useUserProgress(user?.id);
  const { data: chatCount } = useChatCount(user?.id);
  const { data: preferences, updatePreference } = useUserPreferences(user?.id);

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
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
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

  return (
    <Layout>
      <div className="relative overflow-hidden min-h-[80vh]">
        {/* Decorative background */}
        <RadialGlow position="top-left" color="primary" className="opacity-40" />
        <RadialGlow position="bottom-right" color="amber" className="opacity-20" />
        <FloatingOm className="top-20 right-10 animate-float hidden lg:block" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
            <ReadingProgressCard
              chaptersExplored={progress?.chaptersExplored.length || 0}
              versesRead={progress?.shloksRead.length || 0}
            />
            <SavedWisdomCard favorites={favorites || []} />
          </div>

          {/* Streak Calendar */}
          <div className="mb-5 sm:mb-6">
            <StreakCalendar userId={user.id} currentStreak={progress?.currentStreak || 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 pb-safe">
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
