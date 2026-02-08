import { supabase } from '@/integrations/supabase/client';

export async function trackVerseRead(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('reading_activity')
    .select('id, verses_read_count')
    .eq('user_id', userId)
    .eq('activity_date', today)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('reading_activity')
      .update({ verses_read_count: existing.verses_read_count + 1 })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('reading_activity')
      .insert({ user_id: userId, activity_date: today, verses_read_count: 1 });
  }
}
