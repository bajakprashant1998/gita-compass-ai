

# Seed SEO Landing Pages + Verify Existing Features

All five features you listed are **already implemented** in the codebase:

1. **Admin Web Stories** -- `AdminWebStories.tsx` exists with full CRUD, slide editor, gradient picker, and is in the admin sidebar
2. **SEO Internal Links** -- `SEOInternalLinks.tsx` on homepage + "Related Wisdom" section in `BlogPostPage.tsx`
3. **Weekly Auto-Blog** -- `auto-blog-publish` edge function with 24 topics, pg_cron job, and `auto_blog_enabled` toggle
4. **Web Stories Viewer** -- `/stories/:slug` with fullscreen swipeable slides, keyboard/tap nav, progress bar
5. **Internal Links** -- Homepage has the `SEOInternalLinks` component; blog posts have "Related Wisdom" footer

The **only remaining task** is seeding the `seo_landing_pages` table with initial data.

---

## Seed Data Plan

Insert 8 landing page records using the insert tool (not migration):

**Audience pages** (page_type = 'audience'):
| slug | title | keywords |
|------|-------|----------|
| students | Bhagavad Gita for Students — Exam Stress, Focus & Purpose | exam stress, student life, career guidance, focus, discipline |
| working-professionals | Bhagavad Gita for Working Professionals — Career & Leadership | workplace stress, leadership, career growth, work-life balance |
| parents | Bhagavad Gita for Parents — Raising Children with Values | parenting, family values, detached love, duty, children |

**Quote pages** (page_type = 'quotes'):
| slug | title | keywords |
|------|-------|----------|
| love | Krishna Quotes on Love — Divine Teachings on Devotion | love, devotion, bhakti, relationships, divine love |
| karma | Krishna Quotes on Karma — Action Without Attachment | karma yoga, action, duty, detachment, selfless work |
| peace | Krishna Quotes on Peace — Inner Calm & Serenity | peace, meditation, anxiety relief, inner calm, serenity |
| life | Krishna Quotes on Life — Purpose & Meaning | purpose, meaning of life, self-realization, dharma |
| fear | Krishna Quotes on Fear — Courage from the Gita | fear, courage, bravery, overcoming anxiety, strength |

Each record will have a custom `meta_title`, `meta_description`, `description`, and `keywords` array optimized for SEO.

## Implementation

Single SQL INSERT via the insert tool with all 8 rows. No code changes needed -- the pages already query this table and use the data when available.

