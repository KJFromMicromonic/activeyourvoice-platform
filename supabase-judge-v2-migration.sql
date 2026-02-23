-- Drop the old judge_scores table and recreate with simplified 7-slider schema
DROP TABLE IF EXISTS public.judge_scores;

CREATE TABLE public.judge_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  -- 7 scoring criteria
  conversation_ux INT CHECK (conversation_ux BETWEEN 0 AND 20),
  task_autonomy INT CHECK (task_autonomy BETWEEN 0 AND 15),
  memory_adaptivity INT CHECK (memory_adaptivity BETWEEN 0 AND 20),
  real_world_impact INT CHECK (real_world_impact BETWEEN 0 AND 15),
  technical_depth INT CHECK (technical_depth BETWEEN 0 AND 10),
  partner_utilisation INT CHECK (partner_utilisation BETWEEN 0 AND 10),
  product_story INT CHECK (product_story BETWEEN 0 AND 10),
  -- Notes
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One score per judge per project
  CONSTRAINT judge_scores_unique UNIQUE (judge_id, project_id)
);

ALTER TABLE public.judge_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scores" ON public.judge_scores FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert scores" ON public.judge_scores FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Judges can update own scores" ON public.judge_scores FOR UPDATE USING (judge_id = auth.uid());
