
ALTER TABLE public.blog_posts ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.user_preferences ADD COLUMN weekly_digest_enabled BOOLEAN DEFAULT TRUE;
