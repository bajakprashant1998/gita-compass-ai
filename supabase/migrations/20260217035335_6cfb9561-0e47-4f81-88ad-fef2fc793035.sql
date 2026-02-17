
-- 1. Achievement Badges system
CREATE TABLE public.badge_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'reading',
  requirement_type TEXT NOT NULL,
  requirement_value INT NOT NULL DEFAULT 1,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are publicly readable" ON public.badge_definitions FOR SELECT USING (true);

-- Seed some badges
INSERT INTO public.badge_definitions (name, description, icon, category, requirement_type, requirement_value, display_order) VALUES
('First Step', 'Read your first verse', '📖', 'reading', 'verses_read', 1, 1),
('Curious Mind', 'Read 10 verses', '🧠', 'reading', 'verses_read', 10, 2),
('Devoted Reader', 'Read 50 verses', '📚', 'reading', 'verses_read', 50, 3),
('Gita Scholar', 'Read 100 verses', '🎓', 'reading', 'verses_read', 100, 4),
('Verse Master', 'Read all 701 verses', '👑', 'reading', 'verses_read', 701, 5),
('3-Day Streak', 'Maintain a 3-day reading streak', '🔥', 'streak', 'streak_days', 3, 6),
('7-Day Streak', 'Maintain a 7-day reading streak', '⚡', 'streak', 'streak_days', 7, 7),
('30-Day Streak', 'One month of daily reading', '💎', 'streak', 'streak_days', 30, 8),
('Explorer', 'Explore 5 chapters', '🗺️', 'exploration', 'chapters_explored', 5, 9),
('Navigator', 'Explore all 18 chapters', '🧭', 'exploration', 'chapters_explored', 18, 10),
('Reflector', 'Write your first reflection', '✍️', 'community', 'reflections_written', 1, 11),
('Wisdom Seeker', 'Complete a reading plan', '🌟', 'plans', 'plans_completed', 1, 12);

CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Blog/Commentary posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author TEXT NOT NULL DEFAULT 'Bhagavad Gita Gyan',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts are publicly readable" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage posts" ON public.blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. Discussion threads
CREATE TABLE public.verse_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shlok_id UUID NOT NULL REFERENCES public.shloks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.verse_discussions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verse_discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discussions are publicly readable" ON public.verse_discussions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create discussions" ON public.verse_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own discussions" ON public.verse_discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own discussions" ON public.verse_discussions FOR DELETE USING (auth.uid() = user_id);

-- 4. Study Groups
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.reading_plans(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  max_members INT DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public groups are readable" ON public.study_groups FOR SELECT USING (is_public = true OR auth.uid() = creator_id);
CREATE POLICY "Authenticated users can create groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update groups" ON public.study_groups FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete groups" ON public.study_groups FOR DELETE USING (auth.uid() = creator_id);

CREATE TABLE public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members are visible to group members" ON public.study_group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.study_groups WHERE id = group_id AND (is_public = true OR creator_id = auth.uid()))
);
CREATE POLICY "Users can join groups" ON public.study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.study_group_members FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_verse_discussions_updated_at BEFORE UPDATE ON public.verse_discussions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at BEFORE UPDATE ON public.study_groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
