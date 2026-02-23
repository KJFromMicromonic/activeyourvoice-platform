-- Table: projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  demo_url TEXT,
  repo_url TEXT,
  track TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT projects_team_id_unique UNIQUE (team_id)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT USING (true);

CREATE POLICY "Team leaders can insert project"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = projects.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role = 'leader'
    )
  );

CREATE POLICY "Team leaders can update project"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = projects.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role = 'leader'
    )
  );

-- Table: activity_feed
CREATE TABLE public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('team_created', 'member_joined', 'project_submitted', 'announcement_posted')),
  actor_name TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activity feed"
  ON public.activity_feed FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert activity"
  ON public.activity_feed FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable Supabase Realtime for activity_feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
