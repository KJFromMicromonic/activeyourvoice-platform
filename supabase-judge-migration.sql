CREATE TABLE public.judge_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  -- Section 1: Voice Experience (5 criteria, each 1-5)
  voice_naturalness INT CHECK (voice_naturalness BETWEEN 1 AND 5),
  voice_turn_taking INT CHECK (voice_turn_taking BETWEEN 1 AND 5),
  voice_persona INT CHECK (voice_persona BETWEEN 1 AND 5),
  voice_multimodal INT CHECK (voice_multimodal BETWEEN 1 AND 5),
  voice_accessibility INT CHECK (voice_accessibility BETWEEN 1 AND 5),
  -- Section 2: Technical Execution (5 criteria)
  tech_stability INT CHECK (tech_stability BETWEEN 1 AND 5),
  tech_architecture INT CHECK (tech_architecture BETWEEN 1 AND 5),
  tech_actions INT CHECK (tech_actions BETWEEN 1 AND 5),
  tech_complexity INT CHECK (tech_complexity BETWEEN 1 AND 5),
  tech_autonomy INT CHECK (tech_autonomy BETWEEN 1 AND 5),
  -- Section 3: Memory & Adaptivity (4 criteria)
  memory_short_term INT CHECK (memory_short_term BETWEEN 1 AND 5),
  memory_long_term INT CHECK (memory_long_term BETWEEN 1 AND 5),
  memory_adaptivity INT CHECK (memory_adaptivity BETWEEN 1 AND 5),
  memory_improvement INT CHECK (memory_improvement BETWEEN 1 AND 5),
  -- Section 4: Real-World Impact — Common (2 criteria)
  impact_problem_clarity INT CHECK (impact_problem_clarity BETWEEN 1 AND 5),
  impact_feasibility INT CHECK (impact_feasibility BETWEEN 1 AND 5),
  -- Section 4: Track-Specific (2 criteria)
  track_criterion_1 INT CHECK (track_criterion_1 BETWEEN 1 AND 5),
  track_criterion_2 INT CHECK (track_criterion_2 BETWEEN 1 AND 5),
  -- Section 5: Presentation (2 criteria)
  presentation_clarity INT CHECK (presentation_clarity BETWEEN 1 AND 5),
  presentation_qa INT CHECK (presentation_qa BETWEEN 1 AND 5),
  -- Notes
  notes_strengths TEXT,
  notes_improvements TEXT,
  notes_overall TEXT,
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
