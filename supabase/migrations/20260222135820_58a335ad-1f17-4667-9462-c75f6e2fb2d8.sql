
-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  track TEXT NOT NULL,
  skills_needed TEXT[] NOT NULL DEFAULT '{}',
  max_members INT NOT NULL DEFAULT 4 CHECK (max_members >= 3 AND max_members <= 6),
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'leader' or 'member'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_applications table
CREATE TABLE public.team_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Anyone authenticated can view teams"
  ON public.teams FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leaders can update their teams"
  ON public.teams FOR UPDATE TO authenticated
  USING (auth.uid() = leader_id);

CREATE POLICY "Team leaders can delete their teams"
  ON public.teams FOR DELETE TO authenticated
  USING (auth.uid() = leader_id);

-- Team members policies
CREATE POLICY "Anyone authenticated can view team members"
  ON public.team_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team leaders can add members"
  ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT leader_id FROM public.teams WHERE id = team_id)
    OR auth.uid() = user_id
  );

CREATE POLICY "Team leaders can remove members"
  ON public.team_members FOR DELETE TO authenticated
  USING (
    auth.uid() IN (SELECT leader_id FROM public.teams WHERE id = team_id)
    OR auth.uid() = user_id
  );

-- Team applications policies
CREATE POLICY "Applicants and team leaders can view applications"
  ON public.team_applications FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT leader_id FROM public.teams WHERE id = team_id)
  );

CREATE POLICY "Authenticated users can apply"
  ON public.team_applications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team leaders can update application status"
  ON public.team_applications FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (SELECT leader_id FROM public.teams WHERE id = team_id)
  );

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_applications_updated_at
  BEFORE UPDATE ON public.team_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
