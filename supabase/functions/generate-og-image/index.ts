import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "image/svg+xml",
  "Cache-Control": "public, max-age=86400, s-maxage=604800",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const chapter = url.searchParams.get("chapter") || "1";
    const verse = url.searchParams.get("verse") || "1";

    // Fetch verse data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let sanskritText = "";
    let meaningSnippet = "";

    const { data: chapters } = await supabase
      .from("chapters")
      .select("id, title_english")
      .eq("chapter_number", parseInt(chapter))
      .limit(1);

    if (chapters?.length) {
      const { data: shloks } = await supabase
        .from("shloks")
        .select("sanskrit_text, english_meaning")
        .eq("chapter_id", chapters[0].id)
        .eq("verse_number", parseInt(verse))
        .limit(1);

      if (shloks?.length) {
        sanskritText = shloks[0].sanskrit_text.slice(0, 120);
        meaningSnippet = shloks[0].english_meaning.slice(0, 140);
        if (shloks[0].english_meaning.length > 140) meaningSnippet += "...";
      }
    }

    // Escape XML special chars
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    // Split meaning into lines for wrapping (approx 50 chars per line)
    const meaningLines: string[] = [];
    const words = meaningSnippet.split(" ");
    let currentLine = "";
    for (const word of words) {
      if ((currentLine + " " + word).length > 50 && currentLine) {
        meaningLines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += " " + word;
      }
    }
    if (currentLine.trim()) meaningLines.push(currentLine.trim());

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5F0E8"/>
      <stop offset="100%" stop-color="#EDE4D4"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="50%" stop-color="#8B4513"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Top border -->
  <rect x="30" y="25" width="1140" height="3" fill="url(#accent)" opacity="0.4"/>
  <!-- Bottom border -->
  <rect x="30" y="602" width="1140" height="3" fill="url(#accent)" opacity="0.4"/>
  <!-- Decorative circle -->
  <circle cx="1100" cy="80" r="200" fill="#8B4513" opacity="0.04"/>
  <circle cx="100" cy="550" r="150" fill="#8B4513" opacity="0.04"/>
  <!-- Branding -->
  <text x="600" y="70" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#8B4513" letter-spacing="4" font-weight="700">ॐ BHAGAVAD GITA GYAN</text>
  <!-- Chapter & Verse -->
  <text x="600" y="130" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#8B4513" font-weight="600" letter-spacing="2">Chapter ${esc(chapter)}, Verse ${esc(verse)}</text>
  <!-- Divider -->
  <rect x="550" y="150" width="100" height="3" fill="#8B4513" rx="1.5"/>
  <!-- Sanskrit -->
  <text x="600" y="210" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#8B4513" opacity="0.7">${esc(sanskritText)}</text>
  <!-- Quote mark -->
  <text x="600" y="290" text-anchor="middle" font-family="Georgia, serif" font-size="60" fill="#8B4513" opacity="0.2">"</text>
  <!-- Meaning lines -->
  ${meaningLines.map((line, i) => 
    `<text x="600" y="${320 + i * 38}" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#2D1810" font-weight="700">${esc(line)}</text>`
  ).join("\n  ")}
  <!-- Footer -->
  <text x="600" y="595" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#2D1810" opacity="0.5" letter-spacing="1">bhagavadgitagyan.com</text>
</svg>`;

    return new Response(svg, { headers: corsHeaders });
  } catch (error) {
    console.error("OG image error:", error);
    // Return a fallback SVG
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <rect width="1200" height="630" fill="#F5F0E8"/>
      <text x="600" y="315" text-anchor="middle" font-family="Georgia" font-size="32" fill="#8B4513">Bhagavad Gita Gyan</text>
    </svg>`;
    return new Response(fallback, { headers: corsHeaders });
  }
});
