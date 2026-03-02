import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, UserPlus, Crown, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { RadialGlow, FloatingOm } from '@/components/ui/decorative-elements';

export default function StudyGroupsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ['study-groups'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('study_groups')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) return [];

        const groupIds = data.map(g => g.id);
        const { data: memberCounts, error: memberError } = await supabase
          .from('study_group_members')
          .select('group_id')
          .in('group_id', groupIds);
        if (memberError) console.warn('Member counts unavailable:', memberError.message);

        const countMap = new Map<string, number>();
        memberCounts?.forEach(m => {
          countMap.set(m.group_id, (countMap.get(m.group_id) || 0) + 1);
        });

        const creatorIds = [...new Set(data.map(g => g.creator_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', creatorIds);
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

        return data.map(g => ({
          ...g,
          creator_name: profileMap.get(g.creator_id) || 'Unknown',
          member_count: countMap.get(g.id) || 0,
        }));
      } catch (error) {
        console.error('Failed to load study groups:', error);
        toast.error('Failed to load study groups');
        return [];
      }
    },
  });

  const { data: myMemberships } = useQuery({
    queryKey: ['my-memberships', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user!.id);
      if (error) throw error;
      return new Set(data.map(m => m.group_id));
    },
    enabled: !!user,
  });

  const createGroup = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('study_groups')
        .insert({ name, description, creator_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      await supabase.from('study_group_members').insert({
        group_id: data.id,
        user_id: user!.id,
        role: 'creator',
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
      setCreateOpen(false);
      setName('');
      setDescription('');
      toast.success('Study group created!');
    },
    onError: () => toast.error('Failed to create group'),
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('study_group_members')
        .insert({ group_id: groupId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
      toast.success('Joined group!');
    },
    onError: () => toast.error('Failed to join group'),
  });

  const leaveGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
      toast.success('Left group');
    },
  });

  return (
    <Layout>
      <SEOHead
        title="Study Groups - Learn Together"
        description="Join or create Bhagavad Gita study groups. Learn together with like-minded seekers and deepen your understanding."
        keywords={['study groups', 'Bhagavad Gita community', 'spiritual learning']}
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
                <Users className="h-4 w-4" />
                Community
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight animate-fade-in">
                Study{' '}
                <span className="text-gradient">Groups</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in">
                Join a community of seekers. Study the Gita together and share your insights.
              </p>

              {groups && groups.length > 0 && (
                <div className="mt-8 flex items-center justify-center gap-8 animate-fade-in">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-primary">{groups.length}</div>
                    <div className="text-xs text-muted-foreground mt-1">Active Groups</div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-foreground">
                      {groups.reduce((sum: number, g: any) => sum + (g.member_count || 0), 0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Total Members</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-4xl mx-auto">
            {/* Create Button */}
            {user && (
              <div className="flex justify-end mb-6">
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                      <Plus className="h-4 w-4" /> Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a Study Group</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input
                        placeholder="Group name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                      <Textarea
                        placeholder="Describe what your group will study..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                      <Button
                        onClick={() => createGroup.mutate()}
                        disabled={!name.trim() || createGroup.isPending}
                        className="w-full bg-gradient-to-r from-primary to-primary/80"
                      >
                        {createGroup.isPending ? 'Creating...' : 'Create Group'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {!user && (
              <Card className="mb-8 border-primary/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">Sign in to join or create study groups</p>
                  <Link to="/auth"><Button className="bg-gradient-to-r from-primary to-primary/80">Sign In</Button></Link>
                </CardContent>
              </Card>
            )}

            {/* Groups List */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : isError ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-bold mb-2">Failed to Load Groups</h2>
                  <p className="text-muted-foreground mb-4">Something went wrong. Please try again.</p>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['study-groups'] })}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : groups && groups.length > 0 ? (
              <div className="space-y-4">
                {groups.map((group: any, idx: number) => {
                  const isMember = myMemberships?.has(group.id);
                  const memberCount = group.member_count || 0;

                  return (
                    <Card
                      key={group.id}
                      className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 animate-fade-in border-border/50"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-orange-500" />
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h2 className="text-lg font-bold">{group.name}</h2>
                              {isMember && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                  Joined
                                </Badge>
                              )}
                            </div>
                            {group.description && (
                              <p className="text-muted-foreground text-sm mb-3">{group.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> {memberCount} members
                              </span>
                              <span className="flex items-center gap-1">
                                <Crown className="h-3 w-3" /> {group.creator_name || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {format(new Date(group.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          {user && (
                            isMember ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => leaveGroup.mutate(group.id)}
                              >
                                Leave
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => joinGroup.mutate(group.id)}
                                className="gap-1 bg-gradient-to-r from-primary to-primary/80"
                              >
                                <UserPlus className="h-4 w-4" /> Join
                              </Button>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-bold mb-2">No Groups Yet</h2>
                  <p className="text-muted-foreground mb-4">Be the first to create a study group!</p>
                  {user && (
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                      <Plus className="h-4 w-4" /> Create First Group
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
