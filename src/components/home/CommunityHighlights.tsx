import { Link } from 'react-router-dom';
import { Users, BookOpen, MessageCircle, Trophy, ArrowRight, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function CommunityHighlights() {
  const { data: stats } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const [reflections, discussions, groups] = await Promise.all([
        supabase.from('verse_reflections').select('id', { count: 'exact', head: true }),
        supabase.from('verse_discussions').select('id', { count: 'exact', head: true }),
        supabase.from('study_groups').select('id', { count: 'exact', head: true }).eq('is_public', true),
      ]);
      return {
        reflections: reflections.count || 0,
        discussions: discussions.count || 0,
        groups: groups.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const highlights = [
    {
      icon: MessageCircle,
      label: 'Reflections Shared',
      value: stats?.reflections || 0,
      color: 'from-primary to-amber-500',
      href: '/chapters',
    },
    {
      icon: Flame,
      label: 'Active Discussions',
      value: stats?.discussions || 0,
      color: 'from-amber-500 to-orange-500',
      href: '/chapters',
    },
    {
      icon: Users,
      label: 'Study Groups',
      value: stats?.groups || 0,
      color: 'from-orange-500 to-red-500',
      href: '/study-groups',
    },
    {
      icon: Trophy,
      label: 'Badges to Earn',
      value: '12+',
      color: 'from-red-500 to-pink-500',
      href: '/badges',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Join the Community
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            Learn <span className="text-gradient">Together</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of seekers sharing wisdom, reflections, and supporting each other's spiritual journey.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {highlights.map((item, i) => (
            <Link
              key={item.label}
              to={item.href}
              className="group animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative rounded-2xl border-2 border-border/50 bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-extrabold text-gradient mb-1">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{item.label}</div>
                <div className="flex items-center justify-center text-primary text-xs font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/study-groups">
            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all duration-300 hover:scale-105">
              <Users className="h-5 w-5" />
              Browse Study Groups
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}