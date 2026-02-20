-- Fix study_group_members SELECT policy to allow anyone to 
-- view member counts for public groups (needed for the study groups listing page)
DROP POLICY IF EXISTS "Members are visible to group members" ON public.study_group_members;

-- New policy: members of public groups are visible to everyone;
-- members of private groups are visible only to the creator or members themselves
CREATE POLICY "Public group members are visible to everyone"
  ON public.study_group_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_groups
      WHERE study_groups.id = study_group_members.group_id
        AND study_groups.is_public = true
    )
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.study_groups
      WHERE study_groups.id = study_group_members.group_id
        AND study_groups.creator_id = auth.uid()
    )
  );
