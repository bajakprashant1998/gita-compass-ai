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

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // OG image for homepage
    xml += `  <url>\n    <loc>${BASE_URL}</loc>\n`;
    xml += `    <image:image>\n      <image:loc>${BASE_URL}/og-image.png</image:loc>\n      <image:title>Bhagavad Gita Gyan - Ancient Wisdom for Modern Problems</image:title>\n    </image:image>\n`;
    xml += `    <image:image>\n      <image:loc>${BASE_URL}/logo.png</image:loc>\n      <image:title>Bhagavad Gita Gyan Logo</image:title>\n    </image:image>\n`;
    xml += `  </url>\n`;

    // Blog post cover images
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('slug, title, cover_image')
      .eq('published', true)
      .not('cover_image', 'is', null)
      .order('created_at', { ascending: false });

    if (blogs) {
      for (const b of blogs) {
        if (b.cover_image) {
          xml += `  <url>\n    <loc>${BASE_URL}/blog/${b.slug}</loc>\n`;
          xml += `    <image:image>\n      <image:loc>${b.cover_image}</image:loc>\n      <image:title>${escapeXml(b.title)}</image:title>\n      <image:caption>${escapeXml(b.title)}</image:caption>\n    </image:image>\n`;
          xml += `  </url>\n`;
        }
      }
    }

    // Static blog cover images in public/images/blog
    const blogImages = [
      { path: '/images/blog/anxiety-gita-cover.jpg', title: 'Overcoming Anxiety with Bhagavad Gita' },
      { path: '/images/blog/detachment-cover.jpg', title: 'Detachment in Bhagavad Gita' },
      { path: '/images/blog/dharma-cover.jpg', title: 'Dharma in Modern Life' },
      { path: '/images/blog/karma-yoga-cover.jpg', title: 'Karma Yoga Explained' },
      { path: '/images/blog/krishna-lila-cover.jpg', title: 'Krishna Lila - Divine Play' },
      { path: '/images/blog/meditation-cover.jpg', title: 'Meditation in Bhagavad Gita' },
    ];

    for (const img of blogImages) {
      xml += `  <url>\n    <loc>${BASE_URL}/blog</loc>\n`;
      xml += `    <image:image>\n      <image:loc>${BASE_URL}${img.path}</image:loc>\n      <image:title>${escapeXml(img.title)}</image:title>\n    </image:image>\n`;
      xml += `  </url>\n`;
    }

    xml += '</urlset>';

    return new Response(xml, {
      headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=86400' },
    });
  } catch (error) {
    console.error('Image sitemap error:', error);
    return new Response('Error generating image sitemap', { status: 500, headers: corsHeaders });
  }
});

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
