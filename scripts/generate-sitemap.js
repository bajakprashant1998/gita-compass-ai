
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars manually since we don't have dotenv
const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    let cleanValue = value.trim();
                    if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
                        (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
                        cleanValue = cleanValue.slice(1, -1);
                    }
                    process.env[key.trim()] = cleanValue;
                }
            });
        }
    } catch (e) {
        console.error('Error loading .env file', e);
    }
};

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE_URL = 'https://www.bhagavadgitagyan.com';

async function generateSitemap() {
    console.log('Generating sitemap...');

    // Static routes
    const staticRoutes = [
        { path: '', priority: '1.0', changefreq: 'weekly' },
        { path: '/chapters', priority: '0.9', changefreq: 'weekly' },
        { path: '/problems', priority: '0.8', changefreq: 'weekly' },
        { path: '/chat', priority: '0.8', changefreq: 'weekly' },
        { path: '/contact', priority: '0.5', changefreq: 'monthly' },
        { path: '/donate', priority: '0.5', changefreq: 'monthly' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static routes
    staticRoutes.forEach(route => {
        xml += `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
    });

    try {
        // Fetch Chapters with verse counts
        const { data: chapters } = await supabase
            .from('chapters')
            .select('id, chapter_number')
            .order('chapter_number');

        if (chapters) {
            for (const chapter of chapters) {
                // Add chapter page
                xml += `  <url>
    <loc>${BASE_URL}/chapters/${chapter.chapter_number}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;

                // Fetch verses for this chapter
                const { data: verses } = await supabase
                    .from('shloks')
                    .select('verse_number')
                    .eq('chapter_id', chapter.id)
                    .order('verse_number');

                if (verses) {
                    verses.forEach(verse => {
                        xml += `  <url>
    <loc>${BASE_URL}/chapters/${chapter.chapter_number}/verse/${verse.verse_number}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
                    });
                }
            }
        }

        // Fetch Problems
        const { data: problems } = await supabase
            .from('problems')
            .select('slug')
            .order('slug');

        if (problems) {
            problems.forEach(problem => {
                xml += `  <url>
    <loc>${BASE_URL}/problems/${problem.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
            });
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }

    xml += '</urlset>';

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicDir = path.resolve(__dirname, '../public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');

    fs.writeFileSync(sitemapPath, xml);
    console.log(`Sitemap generated at ${sitemapPath}`);
    
    // Count URLs
    const urlCount = (xml.match(/<url>/g) || []).length;
    console.log(`Total URLs in sitemap: ${urlCount}`);
}

generateSitemap();
