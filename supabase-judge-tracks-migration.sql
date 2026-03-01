ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS judge_tracks TEXT[] DEFAULT '{}';
