import { supabase } from "@/integrations/supabase/client";

export type ActivityType = "team_created" | "member_joined" | "project_submitted" | "announcement_posted";

export async function postActivity(type: ActivityType, actorName: string, detail?: string) {
  const { error } = await supabase.from("activity_feed").insert({
    type,
    actor_name: actorName,
    detail: detail || null,
  });
  if (error) console.error("Failed to post activity:", error);
}
