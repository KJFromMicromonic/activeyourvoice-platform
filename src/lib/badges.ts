import { supabase } from "@/integrations/supabase/client";

export interface BadgeDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  points: number;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: "early_bird", icon: "\ud83c\udf05", name: "Early Bird", desc: "Registered before Feb 26", points: 10 },
  { id: "crew_ready", icon: "\u2705", name: "Crew Ready", desc: "Profile 100% complete", points: 20 },
  { id: "team_player", icon: "\ud83e\udd1d", name: "Team Player", desc: "Joined or created a team", points: 30 },
  { id: "idea_machine", icon: "\ud83d\udca1", name: "Idea Machine", desc: "Posted an idea", points: 10 },
  { id: "icebreaker", icon: "\ud83e\uddca", name: "Icebreaker", desc: "Added bio, skills & looking for", points: 15 },
  { id: "shipped_it", icon: "\ud83d\ude80", name: "Shipped It", desc: "Team submitted a project", points: 25 },
];

const PROFILE_FIELDS = [
  "first_name", "last_name", "avatar_url", "bio", "company", "role", "linkedin", "dietary", "team_status",
] as const;
const PROFILE_ARRAY_FIELDS = ["skills", "looking_for"] as const;

function isProfileComplete(profile: any): boolean {
  for (const f of PROFILE_FIELDS) {
    if (!profile[f] || !String(profile[f]).trim()) return false;
  }
  for (const f of PROFILE_ARRAY_FIELDS) {
    if (!Array.isArray(profile[f]) || profile[f].length === 0) return false;
  }
  return true;
}

export interface EarnedBadge extends BadgeDef {
  earned: boolean;
  earnedDate?: string;
}

export async function computeBadges(userId: string): Promise<EarnedBadge[]> {
  // Fetch all needed data in parallel
  const [profileRes, memberRes, projectRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).single(),
    supabase.from("team_members").select("team_id").eq("user_id", userId),
    supabase.from("team_members").select("team_id").eq("user_id", userId),
  ]);

  const profile = profileRes.data;
  if (!profile) return BADGE_DEFS.map((b) => ({ ...b, earned: false }));

  const teamIds = (memberRes.data || []).map((m: any) => m.team_id);
  const inTeam = teamIds.length > 0;

  // Check if any of the user's teams submitted a project
  let hasProject = false;
  if (teamIds.length > 0) {
    const { data: projects } = await supabase.from("projects").select("id").in("team_id", teamIds).limit(1);
    hasProject = (projects || []).length > 0;
  }

  // Check if user posted an idea (announcements with "Idea:" prefix by this user's name)
  const userName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim();
  let postedIdea = false;
  if (userName) {
    const { data: ideas } = await supabase
      .from("announcements")
      .select("id")
      .like("title", "Idea:%")
      .like("body", `%${userName}%`)
      .limit(1);
    postedIdea = (ideas || []).length > 0;
  }

  const registeredAt = new Date(profile.created_at);
  const earlyBirdDeadline = new Date("2026-02-26T00:00:00+01:00");

  const hasBio = !!profile.bio && profile.bio.trim().length > 0;
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  const hasLookingFor = Array.isArray(profile.looking_for) && profile.looking_for.length > 0;

  const checks: Record<string, { earned: boolean; date?: string }> = {
    early_bird: { earned: registeredAt < earlyBirdDeadline, date: registeredAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
    crew_ready: { earned: isProfileComplete(profile) },
    team_player: { earned: inTeam },
    idea_machine: { earned: postedIdea },
    icebreaker: { earned: hasBio && hasSkills && hasLookingFor },
    shipped_it: { earned: hasProject },
  };

  return BADGE_DEFS.map((b) => ({
    ...b,
    earned: checks[b.id]?.earned || false,
    earnedDate: checks[b.id]?.earned ? checks[b.id]?.date : undefined,
  }));
}
