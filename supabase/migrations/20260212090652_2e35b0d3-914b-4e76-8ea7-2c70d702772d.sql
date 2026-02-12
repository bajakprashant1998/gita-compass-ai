
-- =============================================
-- READING PLANS TABLES
-- =============================================

CREATE TABLE public.reading_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 7,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  icon TEXT DEFAULT '📖',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reading plans"
ON public.reading_plans FOR SELECT USING (true);

CREATE POLICY "Admins can manage reading plans"
ON public.reading_plans FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =============================================

CREATE TABLE public.reading_plan_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  shlok_id UUID NOT NULL REFERENCES public.shloks(id) ON DELETE CASCADE,
  reflection_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id, day_number)
);

ALTER TABLE public.reading_plan_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reading plan days"
ON public.reading_plan_days FOR SELECT USING (true);

CREATE POLICY "Admins can manage reading plan days"
ON public.reading_plan_days FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =============================================

CREATE TABLE public.user_reading_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.reading_plans(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

ALTER TABLE public.user_reading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reading plans"
ON public.user_reading_plans FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- COMMUNITY REFLECTIONS TABLES
-- =============================================

CREATE TABLE public.verse_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shlok_id UUID NOT NULL REFERENCES public.shloks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.verse_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reflections"
ON public.verse_reflections FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reflections"
ON public.verse_reflections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
ON public.verse_reflections FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
ON public.verse_reflections FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================

CREATE TABLE public.reflection_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reflection_id UUID NOT NULL REFERENCES public.verse_reflections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, reflection_id)
);

ALTER TABLE public.reflection_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reflection likes"
ON public.reflection_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like reflections"
ON public.reflection_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike reflections"
ON public.reflection_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA: 4 READING PLANS
-- =============================================

INSERT INTO public.reading_plans (id, title, description, duration_days, difficulty, icon, display_order) VALUES
  ('a1b2c3d4-1111-1111-1111-111111111111', '7 Days to Inner Peace', 'A week-long journey through verses that guide you from restlessness to deep inner calm. Each day builds on the last, helping you cultivate lasting tranquility.', 7, 'beginner', '🕊️', 1),
  ('a1b2c3d4-2222-2222-2222-222222222222', 'Overcoming Fear in 5 Days', 'Conquer your deepest fears with Krishna''s timeless wisdom. Five carefully selected verses that transform anxiety into courage and confidence.', 5, 'intermediate', '🦁', 2),
  ('a1b2c3d4-3333-3333-3333-333333333333', 'Finding Your Purpose', 'Discover your dharma through 6 powerful verses. This plan helps you understand your unique role in the world and align your actions with your higher calling.', 6, 'beginner', '🎯', 3),
  ('a1b2c3d4-4444-4444-4444-444444444444', 'Karma Yoga in Daily Life', 'Learn the art of selfless action through 7 transformative verses. Apply the principles of Karma Yoga to your work, relationships, and everyday decisions.', 7, 'advanced', '⚡', 4);

-- Seed plan days using actual shlok IDs from the database
INSERT INTO public.reading_plan_days (plan_id, day_number, shlok_id, reflection_prompt) VALUES
  -- 7 Days to Inner Peace
  ('a1b2c3d4-1111-1111-1111-111111111111', 1, '6156883b-d8e6-43d3-9198-6bce27f67a5f', 'What does inner peace mean to you personally?'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 2, 'd2b8245f-7beb-4128-bdc1-4bee42df3917', 'How do you currently handle moments of restlessness?'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 3, '625e17a8-40ab-4053-9471-5b6417eb3197', 'What attachments create turbulence in your mind?'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 4, '0cf00d72-e8ca-4c99-8698-3410e4057b45', 'Reflect on a time you found peace amidst chaos.'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 5, '893b6c56-7a3f-415a-90c9-6d7d563657c8', 'What daily practice could help you stay centered?'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 6, '71d128e6-5a9e-492f-8110-f5488e5ea2cf', 'How can you bring more stillness into your routine?'),
  ('a1b2c3d4-1111-1111-1111-111111111111', 7, '4b202158-1737-499a-b7b4-d933d817f44d', 'Write your personal commitment to inner peace.'),
  -- Overcoming Fear in 5 Days
  ('a1b2c3d4-2222-2222-2222-222222222222', 1, 'da5776e0-761f-4793-a6ff-5168d646089f', 'What is your biggest fear right now?'),
  ('a1b2c3d4-2222-2222-2222-222222222222', 2, 'a4490c2f-8bf7-4e56-81ec-c2e2b8943012', 'How does fear limit your potential?'),
  ('a1b2c3d4-2222-2222-2222-222222222222', 3, 'c48a2913-a2ec-4bc8-8d23-29dd3d682786', 'What would you do if you were not afraid?'),
  ('a1b2c3d4-2222-2222-2222-222222222222', 4, 'e0db45bf-0f2f-44c7-a94c-25a0c2a2dda5', 'Recall a fear you have already overcome.'),
  ('a1b2c3d4-2222-2222-2222-222222222222', 5, '955faa7e-a2e2-4071-9623-4ebc522a39cf', 'Write an affirmation of courage for yourself.'),
  -- Finding Your Purpose
  ('a1b2c3d4-3333-3333-3333-333333333333', 1, '6d9fc75e-471d-430a-9cc3-30ea83ca6045', 'What activities make you lose track of time?'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 2, '1267001e-f9ef-4105-bb2b-0427ffd16a4a', 'What skills come naturally to you?'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 3, 'eda84aca-b730-4446-8513-198ed8d2ddb9', 'How can your talents serve others?'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 4, '261fcd31-cf28-4718-a1c8-6439f719ef47', 'What legacy do you want to leave behind?'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 5, '5167b98f-fe52-496c-9cce-2d638fbd3db8', 'How does your work align with your values?'),
  ('a1b2c3d4-3333-3333-3333-333333333333', 6, 'ecbbe4b9-aebb-43f1-adf6-428d945b6f7d', 'Write a purpose statement for your life.'),
  -- Karma Yoga in Daily Life
  ('a1b2c3d4-4444-4444-4444-444444444444', 1, '3c8d1393-a1a0-4b42-bbb3-cde08380f07e', 'What motivates your daily actions?'),
  ('a1b2c3d4-4444-4444-4444-444444444444', 2, '339d624a-9c37-4a20-bb6c-8457b6aa9fc0', 'Can you act without expecting a reward?'),
  ('a1b2c3d4-4444-4444-4444-444444444444', 3, 'a999371c-375b-4cff-bd3a-23725669b86b', 'How do you handle outcomes beyond your control?'),
  ('a1b2c3d4-4444-4444-4444-444444444444', 4, '029fe3b3-0080-4358-aa3f-e199a43b6744', 'What does selfless service mean to you?'),
  ('a1b2c3d4-4444-4444-4444-444444444444', 5, '044ed267-8b0c-4254-8dc6-cc122c4b54b8', 'How can you bring more mindfulness to your work?'),
  ('a1b2c3d4-4444-4444-4444-444444444444', 6, '712cba0d-d744-4e20-8f53-5aded3928615', 'Reflect on a time you helped someone without expecting anything.'),
  ('a1b2c3d4-4444-4444-4444-444444444444', 7, '3b13f56f-4c7b-42af-9639-fe839fcfa6d8', 'Write your Karma Yoga commitment for the week ahead.');
