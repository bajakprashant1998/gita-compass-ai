-- Add modern_story and problem_solution columns to shloks table
ALTER TABLE public.shloks 
ADD COLUMN IF NOT EXISTS modern_story TEXT,
ADD COLUMN IF NOT EXISTS problem_context TEXT,
ADD COLUMN IF NOT EXISTS solution_gita TEXT;

-- Insert Chapter 1, Shlok 1 with complete data
INSERT INTO public.shloks (
  chapter_id,
  verse_number,
  sanskrit_text,
  transliteration,
  hindi_meaning,
  english_meaning,
  life_application,
  practical_action,
  modern_story,
  problem_context,
  solution_gita
) VALUES (
  (SELECT id FROM public.chapters WHERE chapter_number = 1),
  1,
  'धृतराष्ट्र उवाच |
धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |
मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||१||',
  'dhṛtarāṣṭra uvāca
dharma-kṣetre kuru-kṣetre samavetā yuyutsavaḥ
māmakāḥ pāṇḍavāś caiva kim akurvata sañjaya',
  'धृतराष्ट्र ने कहा: हे संजय! धर्मभूमि कुरुक्षेत्र में युद्ध के लिए एकत्रित मेरे और पाण्डु के पुत्रों ने क्या किया?',
  'Dhritarashtra said: O Sanjaya, what did my sons and the sons of Pandu do when they gathered on the sacred field of Kurukshetra, eager for battle?',
  'When facing conflict, the first step is awareness. Before reacting, pause and observe the situation objectively. This verse teaches us to seek clarity before making decisions in moments of tension.',
  'Today, when you face a disagreement or conflict, pause for 30 seconds before responding. Ask yourself: "What is really happening here?" This simple pause can transform reactive behavior into mindful action.',
  'Rahul was the newly appointed CEO of a family-owned manufacturing company. His first board meeting was tense—his own cousins sat across the table, some supportive, others openly hostile about his appointment.

As the meeting progressed, accusations flew. "You''re too young." "You don''t understand the business." The conference room felt like a battlefield.

That night, Rahul called his mentor, an old professor. "I feel like I''m at war with my own family," he said.

His mentor replied, "Before you fight, understand the field. What values does your company stand for? Who really wants what''s best for the business? Observe before you act."

The next morning, Rahul didn''t prepare counter-arguments. Instead, he scheduled one-on-one coffees with each board member. He listened. He understood their fears—job security, legacy, change.

Within six months, the same cousins who opposed him became his strongest allies. Not because he won the argument, but because he first sought to understand the battlefield.

The lesson was clear: In family conflicts, in boardroom battles, in personal disputes—awareness before action changes everything.',
  'Modern life is full of conflicts—workplace politics, family disagreements, competitive pressures. We often react emotionally without understanding the full picture. This leads to escalation, broken relationships, and poor decisions. The challenge is: How do we respond wisely when everyone around us seems ready to fight?',
  'The Gita begins not with a solution, but with a question. Dhritarashtra, though blind, seeks to understand what is happening. This teaches us that wisdom starts with inquiry. Before taking sides, before fighting, we must first clearly see the situation. The sacred field represents our conscience—every conflict has a moral dimension. Recognizing this helps us act with integrity, not just strategy.'
) ON CONFLICT (chapter_id, verse_number) DO UPDATE SET
  sanskrit_text = EXCLUDED.sanskrit_text,
  transliteration = EXCLUDED.transliteration,
  hindi_meaning = EXCLUDED.hindi_meaning,
  english_meaning = EXCLUDED.english_meaning,
  life_application = EXCLUDED.life_application,
  practical_action = EXCLUDED.practical_action,
  modern_story = EXCLUDED.modern_story,
  problem_context = EXCLUDED.problem_context,
  solution_gita = EXCLUDED.solution_gita;

-- Add unique constraint for chapter_id and verse_number if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shloks_chapter_verse_unique'
  ) THEN
    ALTER TABLE public.shloks ADD CONSTRAINT shloks_chapter_verse_unique UNIQUE (chapter_id, verse_number);
  END IF;
END $$;

-- Link shlok 1 to relevant problems
INSERT INTO public.shlok_problems (shlok_id, problem_id, relevance_score)
SELECT 
  s.id,
  p.id,
  CASE 
    WHEN p.slug = 'confusion' THEN 10
    WHEN p.slug = 'decision-making' THEN 9
    WHEN p.slug = 'leadership' THEN 8
    WHEN p.slug = 'relationships' THEN 7
    ELSE 5
  END
FROM public.shloks s
CROSS JOIN public.problems p
WHERE s.verse_number = 1 
  AND s.chapter_id = (SELECT id FROM public.chapters WHERE chapter_number = 1)
  AND p.slug IN ('confusion', 'decision-making', 'leadership', 'relationships')
ON CONFLICT DO NOTHING;