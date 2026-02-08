
-- Feature 2: Bookmark Collections
CREATE TABLE public.bookmark_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookmark_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collections"
  ON public.bookmark_collections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.collection_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.bookmark_collections(id) ON DELETE CASCADE,
  shlok_id UUID NOT NULL REFERENCES public.shloks(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, shlok_id)
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collection items"
  ON public.collection_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.bookmark_collections
    WHERE bookmark_collections.id = collection_items.collection_id
    AND bookmark_collections.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bookmark_collections
    WHERE bookmark_collections.id = collection_items.collection_id
    AND bookmark_collections.user_id = auth.uid()
  ));

-- Feature 4: Reading Activity
CREATE TABLE public.reading_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  verses_read_count INTEGER NOT NULL DEFAULT 1,
  chapters_visited INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

ALTER TABLE public.reading_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reading activity"
  ON public.reading_activity FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_bookmark_collections_updated_at
  BEFORE UPDATE ON public.bookmark_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
