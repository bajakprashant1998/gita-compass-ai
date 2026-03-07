import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLOG_TOPICS = [
  "How to Practice Karma Yoga in Daily Life According to Bhagavad Gita",
  "Bhagavad Gita's Solution to Anxiety and Overthinking",
  "5 Lessons from Bhagavad Gita for Working Professionals",
  "Understanding Detachment (Vairagya) from the Bhagavad Gita",
  "Bhagavad Gita on Decision Making: Krishna's Guide to Clarity",
  "The Science of Meditation as Taught in the Bhagavad Gita",
  "Bhagavad Gita Chapter 2 Explained: The Yoga of Knowledge",
  "How Lord Krishna's Teachings Help with Relationship Problems",
  "Bhagavad Gita for Students: Finding Focus and Purpose",
  "The Concept of Dharma in the Bhagavad Gita Explained Simply",
  "Bhagavad Gita on Anger Management: Practical Steps",
  "Why the Bhagavad Gita is Relevant in the 21st Century",
  "Bhagavad Gita Quotes on Love, Duty, and Selfless Service",
  "Understanding the Three Gunas from the Bhagavad Gita",
  "Bhagavad Gita's Teaching on Fear and How to Overcome It",
  "The Role of Surrender (Sharanagati) in the Bhagavad Gita",
  "Bhagavad Gita on Self-Discipline: Building Inner Strength",
  "What the Bhagavad Gita Teaches About Success and Failure",
  "Bhagavad Gita for Parents: Raising Children with Values",
  "The Path of Devotion (Bhakti Yoga) in the Bhagavad Gita",
  "How to Handle Workplace Stress Using Bhagavad Gita Wisdom",
  "Bhagavad Gita on Leadership: Lessons for Modern Leaders",
  "The Meaning of Life According to the Bhagavad Gita",
  "Bhagavad Gita on Mental Health and Emotional Balance",
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if auto-blog is enabled
    const { data: setting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'auto_blog_enabled')
      .maybeSingle();

    if (setting?.value !== 'true') {
      return new Response(
        JSON.stringify({ message: "Auto-blog is disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing blog slugs to avoid duplicates
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug');
    const existingSlugs = new Set(existingPosts?.map(p => p.slug) || []);

    // Pick a topic that hasn't been used
    const availableTopics = BLOG_TOPICS.filter(t => !existingSlugs.has(generateSlug(t)));
    if (availableTopics.length === 0) {
      return new Response(
        JSON.stringify({ message: "All predefined topics have been published" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pick deterministic topic based on week number
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const topic = availableTopics[weekNum % availableTopics.length];

    // Call admin-ai-generate to create the blog post
    const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/admin-ai-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        type: "blog_post",
        blog_topic: topic,
        blog_tone: "informative, warm, and practical",
        blog_length: "1000-1200 words",
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI generation failed: ${aiResponse.status} ${errText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.content || "";

    // Parse the JSON from AI response
    let blogData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      blogData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      throw new Error("Failed to parse AI-generated blog content");
    }

    const slug = generateSlug(blogData.title || topic);

    // Check slug doesn't already exist
    if (existingSlugs.has(slug)) {
      return new Response(
        JSON.stringify({ message: "Blog post with this slug already exists", slug }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert blog post
    const { data: post, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        title: blogData.title || topic,
        slug,
        excerpt: blogData.excerpt || "",
        content: blogData.content || "",
        tags: blogData.tags || ["bhagavad gita", "spiritual wisdom"],
        meta_title: blogData.meta_title || blogData.title?.slice(0, 60),
        meta_description: blogData.meta_description || blogData.excerpt?.slice(0, 155),
        meta_keywords: blogData.meta_keywords || [],
        published: true,
        author: "Bhagavad Gita Gyan",
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    // Log activity
    await supabase.from('admin_activity_log').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      action: 'auto_publish',
      entity_type: 'blog_post',
      entity_id: post.id,
      new_value: { title: blogData.title, slug, auto_generated: true },
    });

    return new Response(
      JSON.stringify({ success: true, slug, title: blogData.title }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("auto-blog-publish error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
