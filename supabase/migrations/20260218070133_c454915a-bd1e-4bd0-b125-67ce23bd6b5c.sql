-- Add foreign key from study_groups.creator_id to profiles.user_id
ALTER TABLE public.study_groups
ADD CONSTRAINT study_groups_creator_id_profiles_fkey
FOREIGN KEY (creator_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;