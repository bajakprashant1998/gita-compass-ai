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

        // Fetch member counts separately to avoid RLS issues
        const groupIds = data.map(g => g.id);
        const { data: memberCounts } = await supabase
          .from('study_group_members')
          .select('group_id')
          .in('group_id', groupIds);
        
        const countMap = new Map<string, number>();
        memberCounts?.forEach(m => {
          countMap.set(m.group_id, (countMap.get(m.group_id) || 0) + 1);
        });

        // Fetch creator names separately
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
      // Auto-join as creator
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Users className="h-4 w-4" />
              Community
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Study Groups</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join a community of seekers. Study the Gita together and share your insights.
            </p>
          </div>

          {/* Create Button */}
          {user && (
            <div className="flex justify-end mb-6">
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
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
                      className="w-full"
                    >
                      {createGroup.isPending ? 'Creating...' : 'Create Group'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {!user && (
            <Card className="mb-8 border-primary/20">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">Sign in to join or create study groups</p>
                <Link to="/auth"><Button>Sign In</Button></Link>
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
            <Card>
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
                    className="hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
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
                              className="gap-1"
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
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">No Groups Yet</h2>
                <p className="text-muted-foreground mb-4">Be the first to create a study group!</p>
                {user && (
                  <Button onClick={() => setCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Create First Group
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
