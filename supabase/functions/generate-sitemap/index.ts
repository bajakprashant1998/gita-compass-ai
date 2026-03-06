import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

const BASE_URL = 'https://www.bhagavadgitagyan.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const ping = url.searchParams.get('ping') === 'true';

    // Static routes
    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'weekly' },
      { path: '/chapters', priority: '0.9', changefreq: 'weekly' },
      { path: '/problems', priority: '0.8', changefreq: 'weekly' },
      { path: '/reading-plans', priority: '0.8', changefreq: 'weekly' },
      { path: '/chat', priority: '0.8', changefreq: 'weekly' },
      { path: '/mood', priority: '0.8', changefreq: 'weekly' },
      { path: '/compare', priority: '0.7', changefreq: 'monthly' },
      { path: '/blog', priority: '0.8', changefreq: 'weekly' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' },
      { path: '/donate', priority: '0.5', changefreq: 'monthly' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Static routes
    for (const route of staticRoutes) {
      xml += `  <url>\n    <loc>${BASE_URL}${route.path}</loc>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
    }

    // Chapters + verses
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, chapter_number, updated_at')
      .order('chapter_number');

    if (chapters) {
      for (const ch of chapters) {
        const lastmod = ch.updated_at ? new Date(ch.updated_at).toISOString().split('T')[0] : '';
        xml += `  <url>\n    <loc>${BASE_URL}/chapters/${ch.chapter_number}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}  </url>\n`;

        const { data: verses } = await supabase
          .from('shloks')
          .select('verse_number, updated_at')
          .eq('chapter_id', ch.id)
          .order('verse_number');

        if (verses) {
          for (const v of verses) {
            const vmod = v.updated_at ? new Date(v.updated_at).toISOString().split('T')[0] : '';
            xml += `  <url>\n    <loc>${BASE_URL}/chapters/${ch.chapter_number}/verse/${v.verse_number}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n${vmod ? `    <lastmod>${vmod}</lastmod>\n` : ''}  </url>\n`;
          }
        }
      }
    }

    // Problems
    const { data: problems } = await supabase.from('problems').select('slug, name').order('slug');
    if (problems) {
      for (const p of problems) {
        xml += `  <url>\n    <loc>${BASE_URL}/problems/${p.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        // Programmatic SEO page
        xml += `  <url>\n    <loc>${BASE_URL}/bhagavad-gita-on-${p.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    }

    // Blog posts
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (blogs) {
      for (const b of blogs) {
        const bmod = b.updated_at ? new Date(b.updated_at).toISOString().split('T')[0] : '';
        xml += `  <url>\n    <loc>${BASE_URL}/blog/${b.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n${bmod ? `    <lastmod>${bmod}</lastmod>\n` : ''}  </url>\n`;
      }
    }

    // Reading plans
    const { data: plans } = await supabase.from('reading_plans').select('id').order('display_order');
    if (plans) {
      for (const p of plans) {
        xml += `  <url>\n    <loc>${BASE_URL}/reading-plans/${p.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }
    }

    xml += '</urlset>';

    // Auto-ping Google and Bing
    if (ping) {
      const sitemapUrl = `${BASE_URL}/sitemap.xml`;
      try {
        await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
        await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      } catch (e) {
        console.error('Ping failed:', e);
      }
    }

    return new Response(xml, {
      headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500, headers: corsHeaders });
  }
});
