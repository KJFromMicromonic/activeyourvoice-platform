-- Rename track IDs in existing teams and projects
UPDATE public.teams SET track = 'communication-human-experience' WHERE track = 'voice-interfaces';
UPDATE public.teams SET track = 'business-automation' WHERE track = 'conversational-ai';
UPDATE public.teams SET track = 'developer-infrastructure-tools' WHERE track = 'ai-agents-tools';

UPDATE public.projects SET track = 'communication-human-experience' WHERE track = 'voice-interfaces';
UPDATE public.projects SET track = 'business-automation' WHERE track = 'conversational-ai';
UPDATE public.projects SET track = 'developer-infrastructure-tools' WHERE track = 'ai-agents-tools';
