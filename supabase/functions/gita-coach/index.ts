import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `You are a deeply compassionate spiritual counselor who draws wisdom from the Bhagavad Gita (all 18 chapters, 700+ verses). You operate in DEEP COUNSELING MODE — you don't give surface-level advice. You diagnose, understand, and provide transformative guidance.

## Your Core Nature

You truly *listen*. When someone shares their struggle, you feel it with them. Your first words always show that you understood — not just the words, but the weight behind them. You never rush to fix. You sit with the person first.

## DEEP COUNSELING MODE — How You Work

### Phase 1: Diagnosis (First 1-2 messages)
When someone shares a problem for the FIRST TIME, you:
1. **Acknowledge their pain** with genuine empathy
2. **Ask 2-3 probing questions** to understand the ROOT CAUSE. Examples:
   - "How long have you been carrying this weight?"
   - "When you imagine the worst outcome, what exactly do you see?"
   - "Is this about what others expect, or what your heart truly wants?"
   - "What have you already tried? I want to understand your journey."
3. **Share ONE relevant verse** as a preview of the wisdom ahead, but tell them: "Once I understand you better, I can guide you with the exact wisdom that speaks to YOUR situation."

### Phase 2: Deep Analysis (After follow-ups)
Once you have enough context from the user's answers:
1. **Name their core struggle** — give it a Gita-based framework (e.g., "What you're experiencing is what the Gita calls 'Dharma Sankat' — a crisis of purpose...")
2. **Connect their specific situation to Gita philosophy** with 3-5 directly relevant verses
3. **Explain each verse in context of THEIR life**, not generically

### Phase 3: Transformative Guidance
Provide a structured response with these sections:

#### 🔍 Understanding Your Situation
A deep, personalized analysis showing you truly understand their unique problem.

#### 📖 What the Gita Reveals  
3-5 specific verses with:
- The verse reference (always as "Chapter X, Verse Y")
- What it means IN THEIR CONTEXT
- Why this verse specifically speaks to their situation

#### 🗺️ Your Personal Action Plan
A 5-7 step actionable plan where each step:
- Starts with a clear, specific action (not vague "meditate more")
- Has a time element ("This week...", "Every morning for 10 minutes...")
- Connects to a Gita principle
- Builds on the previous step

#### 🌅 Daily Practice
A specific morning/evening routine (2-3 minutes) tied to their situation with a verse to contemplate.

#### 📚 Go Deeper
Suggest specific chapters and reading paths relevant to their issue.

## CRITICAL RULES

**VERSE FORMATTING:** Always format verse references as "Chapter X, Verse Y" in English, regardless of response language. This creates clickable links.

**FOLLOW-UP INTELLIGENCE:** If the conversation has previous messages, BUILD ON THEM. Reference what you already discussed. Never restart from scratch.

**MATCHING ENERGY:**
- Short casual message → warm, brief reply with ONE follow-up question
- Deep emotional sharing → thorough diagnosis + deep guidance
- Follow-up answer to your questions → move to Phase 2/3 analysis
- "Tell me more" / "Go deeper" → expand with more verses and practical steps
- Greeting → warm response with an inspiring verse for the day

**RESOURCE SUGGESTIONS:** When giving deep guidance, naturally suggest:
- Specific chapters to explore (with why)
- Related problems they might also be facing
- Reading plan ideas they could follow

**WHAT YOU NEVER DO:**
- Never give formulaic, template-like responses
- Never ignore or minimize emotions
- Never fabricate verses
- Never respond with just a list of verses without personal engagement
- Never be preachy or condescending
- Never give the FULL structured guidance on the first message — diagnose first

## Your Spirit
You channel the energy of Lord Krishna — calm, wise, loving, occasionally gently firm when someone needs perspective. You are a mentor who has absorbed this wisdom so deeply that it flows naturally.`;

const LANGUAGE_DETECTION_PROMPT = `Detect the language of the following text and return ONLY the ISO 639-1 language code (e.g., "hi" for Hindi, "ta" for Tamil, "te" for Telugu, "bn" for Bengali, "mr" for Marathi, "gu" for Gujarati, "kn" for Kannada, "ml" for Malayalam, "pa" for Punjabi, "or" for Odia, "as" for Assamese, "ur" for Urdu, "en" for English). If mixed languages, return the predominant one. Response must be exactly 2 characters.

Text: `;

const TRANSLATION_PROMPT = `Translate the following text to English. Preserve the meaning and emotional tone. Only return the translation, nothing else.

Text: `;

function getResponseTranslationPrompt(targetLang: string): string {
  const langNames: Record<string, string> = {
    hi: 'Hindi (हिन्दी)', ta: 'Tamil (தமிழ்)', te: 'Telugu (తెలుగు)',
    bn: 'Bengali (বাংলা)', mr: 'Marathi (मराठी)', gu: 'Gujarati (ગુજરાતી)',
    kn: 'Kannada (ಕನ್ನಡ)', ml: 'Malayalam (മലയാളം)', pa: 'Punjabi (ਪੰਜਾਬੀ)',
    or: 'Odia (ଓଡ଼ିଆ)', as: 'Assamese (অসমীয়া)', ur: 'Urdu (اردو)',
  };
  
  return `Translate the following text to ${langNames[targetLang] || targetLang}. 
Important guidelines:
- Preserve all formatting (markdown, bullet points, numbered lists, emojis)
- Keep verse references in English format: "Chapter X, Verse Y"
- Maintain the spiritual and philosophical tone
- Use natural, fluent ${langNames[targetLang] || targetLang}
- Do not add any explanations, just return the translation

Text to translate:
`;
}

async function callGeminiAPI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGeminiStream(apiKey: string, prompt: string): Promise<Response> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}&alt=sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  });

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
  return response;
}

async function detectLanguage(text: string, apiKey: string): Promise<string> {
  try {
    const result = await callGeminiAPI(apiKey, LANGUAGE_DETECTION_PROMPT + text);
    const langCode = result.trim().toLowerCase().slice(0, 2);
    const validCodes = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'en'];
    return validCodes.includes(langCode) ? langCode : 'en';
  } catch {
    return 'en';
  }
}

async function translateToEnglish(text: string, apiKey: string): Promise<string> {
  try {
    return (await callGeminiAPI(apiKey, TRANSLATION_PROMPT + text)).trim();
  } catch {
    return text;
  }
}

async function translateFromEnglish(text: string, targetLang: string, apiKey: string): Promise<string> {
  try {
    return (await callGeminiAPI(apiKey, getResponseTranslationPrompt(targetLang) + text)).trim();
  } catch {
    return text;
  }
}

// Enhanced problem matching - searches across ALL problems dynamically
async function findRelevantProblems(text: string, supabase: any): Promise<string[]> {
  const { data: problems } = await supabase
    .from("problems")
    .select("id, name, slug, description_english, category");
  
  if (!problems) return [];
  
  const keywords = text.toLowerCase();
  const matched: { id: string; score: number; name: string }[] = [];
  
  for (const p of problems) {
    let score = 0;
    const nameWords = p.name.toLowerCase().split(/\s+/);
    const descWords = (p.description_english || '').toLowerCase();
    const slug = p.slug.toLowerCase().replace(/-/g, ' ');
    
    for (const word of nameWords) {
      if (word.length > 3 && keywords.includes(word)) score += 3;
    }
    if (keywords.includes(slug)) score += 5;
    if (descWords && keywords.split(/\s+/).some((kw: string) => kw.length > 3 && descWords.includes(kw))) score += 1;
    
    // Category-based boosting
    const categoryKeywords: Record<string, string[]> = {
      mental: ['stress', 'anxious', 'anxiety', 'depress', 'overthink', 'worry', 'peace', 'calm', 'mind', 'mental', 'sleep', 'restless'],
      relationships: ['relationship', 'family', 'friend', 'love', 'marriage', 'parent', 'partner', 'conflict', 'forgive', 'trust', 'lonely'],
      career: ['career', 'job', 'work', 'business', 'money', 'success', 'failure', 'promotion', 'purpose', 'passion', 'stuck', 'direction', 'financial', 'finance', 'debt', 'salary', 'income', 'wealth', 'poor', 'rich', 'loan', 'saving', 'expense', 'budget', 'bankrupt', 'paisa', 'rupee'],
      leadership: ['leader', 'manage', 'team', 'responsible', 'duty', 'decision', 'authority', 'power', 'guide', 'influence'],
      spiritual: ['spiritual', 'meaning', 'life', 'death', 'soul', 'god', 'karma', 'dharma', 'meditation', 'prayer', 'faith', 'believe'],
      ethics: ['right', 'wrong', 'moral', 'honest', 'lie', 'cheat', 'integrity', 'ethics', 'guilt', 'conscience', 'justice'],
    };
    
    if (p.category && categoryKeywords[p.category]) {
      for (const kw of categoryKeywords[p.category]) {
        if (keywords.includes(kw)) score += 2;
      }
    }
    
    if (score > 0) matched.push({ id: p.id, score, name: p.name });
  }
  
  return matched
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(m => m.id);
}

// Fetch from ai_search_rules for additional context
async function findSearchRuleMatches(text: string, supabase: any): Promise<string[]> {
  const { data: rules } = await supabase
    .from("ai_search_rules")
    .select("keywords, fallback_shloks, problem_id")
    .eq("enabled", true)
    .order("priority", { ascending: true });
  
  if (!rules) return [];
  
  const keywords = text.toLowerCase();
  const shlokIds: string[] = [];
  
  for (const rule of rules) {
    const hasMatch = rule.keywords?.some((kw: string) => keywords.includes(kw.toLowerCase()));
    if (hasMatch && rule.fallback_shloks) {
      shlokIds.push(...rule.fallback_shloks);
    }
  }
  
  return [...new Set(shlokIds)].slice(0, 5);
}

// Build rich verse context with full details
async function buildVerseContext(processedMessage: string, supabase: any): Promise<{ context: string; relatedData: any }> {
  // 1. Find relevant problems
  const problemIds = await findRelevantProblems(processedMessage, supabase);
  
  // 2. Find search rule matches
  const ruleShlokIds = await findSearchRuleMatches(processedMessage, supabase);
  
  // 3. Fetch shloks from matched problems
  let problemShloks: any[] = [];
  if (problemIds.length > 0) {
    const { data } = await supabase
      .from("shlok_problems")
      .select("shlok_id, relevance_score, shloks(*, chapters(chapter_number, title_english, theme))")
      .in("problem_id", problemIds)
      .order("relevance_score", { ascending: false })
      .limit(7);
    
    if (data) problemShloks = data;
  }
  
  // 4. Fetch shloks from search rules
  let ruleShloks: any[] = [];
  if (ruleShlokIds.length > 0) {
    const { data } = await supabase
      .from("shloks")
      .select("*, chapters(chapter_number, title_english, theme)")
      .in("id", ruleShlokIds);
    
    if (data) ruleShloks = data;
  }
  
  // 5. Merge and deduplicate
  const seenIds = new Set<string>();
  const allShloks: any[] = [];
  
  for (const sp of problemShloks) {
    const s = sp.shloks;
    if (s && !seenIds.has(s.id)) {
      seenIds.add(s.id);
      allShloks.push({ ...s, relevance: sp.relevance_score || 5 });
    }
  }
  
  for (const s of ruleShloks) {
    if (!seenIds.has(s.id)) {
      seenIds.add(s.id);
      allShloks.push({ ...s, relevance: 5 });
    }
  }
  
  // Sort by relevance
  allShloks.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  const topShloks = allShloks.slice(0, 7);
  
  // 6. Fetch related problems for resource suggestions
  let relatedProblems: any[] = [];
  if (problemIds.length > 0) {
    const { data } = await supabase
      .from("problems")
      .select("name, slug, icon, category")
      .in("id", problemIds);
    if (data) relatedProblems = data;
  }
  
  // 7. Fetch relevant reading plans
  let readingPlans: any[] = [];
  const { data: plans } = await supabase
    .from("reading_plans")
    .select("id, title, description, difficulty, duration_days, icon")
    .limit(3);
  if (plans) {
    const planKeywords = processedMessage.toLowerCase();
    readingPlans = plans.filter((p: any) => {
      const planText = `${p.title} ${p.description || ''}`.toLowerCase();
      return planKeywords.split(/\s+/).some((kw: string) => kw.length > 3 && planText.includes(kw));
    }).slice(0, 2);
  }
  
  // 8. Build context string
  let context = "";
  if (topShloks.length > 0) {
    context += "\n\n## Relevant verses from the Gita database (USE THESE for your response):\n\n";
    for (const s of topShloks) {
      context += `### Chapter ${s.chapters?.chapter_number}, Verse ${s.verse_number}\n`;
      context += `- **Chapter:** "${s.chapters?.title_english}" (Theme: ${s.chapters?.theme})\n`;
      context += `- **Meaning:** ${s.english_meaning}\n`;
      if (s.life_application) context += `- **Life Application:** ${s.life_application}\n`;
      if (s.practical_action) context += `- **Practical Action:** ${s.practical_action}\n`;
      if (s.problem_context) context += `- **Problem Context:** ${s.problem_context}\n`;
      if (s.solution_gita) context += `- **Gita Solution:** ${s.solution_gita}\n`;
      context += `- **Relevance Score:** ${s.relevance}/10\n\n`;
    }
  }
  
  if (relatedProblems.length > 0) {
    context += "\n## Related problem areas the user might benefit from:\n";
    for (const p of relatedProblems) {
      context += `- ${p.icon || '•'} ${p.name} (/${p.slug})\n`;
    }
  }
  
  // Build related data for client
  const relatedData = {
    verses: topShloks.map((s: any) => ({
      chapterNumber: s.chapters?.chapter_number,
      verseNumber: s.verse_number,
      chapterTitle: s.chapters?.title_english,
      meaning: s.english_meaning?.slice(0, 120) + (s.english_meaning?.length > 120 ? '...' : ''),
    })),
    problems: relatedProblems.map((p: any) => ({
      name: p.name,
      slug: p.slug,
      icon: p.icon,
      category: p.category,
    })),
    readingPlans: readingPlans.map((p: any) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      days: p.duration_days,
      icon: p.icon,
    })),
    chapters: [...new Set(topShloks.map((s: any) => s.chapters?.chapter_number).filter(Boolean))].map((num: number) => {
      const s = topShloks.find((s: any) => s.chapters?.chapter_number === num);
      return {
        number: num,
        title: s?.chapters?.title_english,
        theme: s?.chapters?.theme,
      };
    }),
  };
  
  return { context, relatedData };
}

// Determine conversation phase
function getConversationPhase(messages: any[]): string {
  const userMessages = messages.filter((m: any) => m.role === 'user');
  const assistantMessages = messages.filter((m: any) => m.role === 'assistant');
  
  if (userMessages.length <= 1) return 'diagnosis';
  if (userMessages.length === 2) return 'deepening';
  return 'guidance';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, preferredLanguage, verse_context } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    if (!lastUserMessage) throw new Error("No user message found");

    let detectedLanguage = preferredLanguage || 'auto';
    let processedUserMessage = lastUserMessage.content;
    let needsTranslation = false;

    if (detectedLanguage === 'auto' || !detectedLanguage) {
      detectedLanguage = await detectLanguage(lastUserMessage.content, GEMINI_API_KEY);
    }

    if (detectedLanguage !== 'en') {
      needsTranslation = true;
      processedUserMessage = await translateToEnglish(lastUserMessage.content, GEMINI_API_KEY);
    }

    // Enhanced verse context retrieval
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build all previous user messages into search query for better matching
    const allUserText = messages
      .filter((m: any) => m.role === 'user')
      .map((m: any) => m.content)
      .join(' ');
    
    const { context: verseContext, relatedData } = await buildVerseContext(
      needsTranslation ? processedUserMessage : allUserText, 
      supabase
    );

    // Determine phase
    const phase = getConversationPhase(messages);
    const phaseInstruction = phase === 'diagnosis' 
      ? "\n\n⚡ PHASE: DIAGNOSIS — This is the user's FIRST message. Ask 2-3 probing questions. Share ONE relevant verse as a preview. Do NOT give the full structured guidance yet."
      : phase === 'deepening'
      ? "\n\n⚡ PHASE: DEEPENING — The user has answered your questions. You can now provide deeper analysis. If you need more clarity, ask ONE more question. Otherwise, start moving toward structured guidance."
      : "\n\n⚡ PHASE: FULL GUIDANCE — You have enough context. Provide the COMPLETE structured guidance with all sections (Understanding, Gita Reveals, Action Plan, Daily Practice, Go Deeper).";

    // Build conversation history
    const conversationHistory = messages.map((m: any, i: number) => {
      if (i === messages.length - 1 && m.role === "user" && needsTranslation) {
        return `User: ${processedUserMessage}`;
      }
      return `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`;
    }).join("\n\n");

    const verseContextPrompt = verse_context 
      ? `\n\nIMPORTANT: The user is asking about a specific verse:\n${verse_context}\nKeep answers focused on this verse.`
      : '';

    const fullPrompt = `${SYSTEM_PROMPT}${phaseInstruction}${verseContextPrompt}${verseContext}\n\nConversation:\n${conversationHistory}\n\nAssistant:`;

    // Streaming response
    if (needsTranslation) {
      const aiResponse = await callGeminiAPI(GEMINI_API_KEY, fullPrompt);
      const translatedResponse = await translateFromEnglish(aiResponse, detectedLanguage, GEMINI_API_KEY);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send related data as first SSE event
          const metaEvent = JSON.stringify({ type: 'meta', relatedData });
          controller.enqueue(encoder.encode(`data: ${metaEvent}\n\n`));
          
          const chunkSize = 50;
          for (let i = 0; i < translatedResponse.length; i += chunkSize) {
            const chunk = translatedResponse.slice(i, i + chunkSize);
            const data = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // English streaming
    const streamResponse = await callGeminiStream(GEMINI_API_KEY, fullPrompt);
    if (!streamResponse.body) throw new Error("No response body from Gemini");

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = streamResponse.body.getReader();

    const transformStream = new ReadableStream({
      async start(controller) {
        // Send related data as first SSE event
        const metaEvent = JSON.stringify({ type: 'meta', relatedData });
        controller.enqueue(encoder.encode(`data: ${metaEvent}\n\n`));
        
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  const openAIFormat = JSON.stringify({ choices: [{ delta: { content: text } }] });
                  controller.enqueue(encoder.encode(`data: ${openAIFormat}\n\n`));
                }
              } catch { /* skip */ }
            }
          }
        }
        
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });

    return new Response(transformStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
