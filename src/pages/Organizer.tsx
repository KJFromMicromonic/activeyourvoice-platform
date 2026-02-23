import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Utensils, Send, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { postActivity } from "@/lib/activity";
import { rankProjects, CRITERIA } from "@/lib/scoring";
import MeshBackground from "@/components/MeshBackground";

interface Profile {
  onboarding_completed: boolean;
  team_status: string | null;
  skills: string[] | null;
  dietary: string | null;
  meat_preference: string | null;
  allergies_detail: string | null;
  drinks_beer: string | null;
  staying_overnight: string | null;
}

const Organizer = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Post form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);

  // Scores state
  const [ranked, setRanked] = useState<ReturnType<typeof rankProjects>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [profilesRes, teamsRes, membersRes] = await Promise.all([
        supabase.from("profiles").select("onboarding_completed, team_status, skills, dietary, meat_preference, allergies_detail, drinks_beer, staying_overnight"),
        supabase.from("teams").select("id", { count: "exact", head: true }),
        supabase.from("team_members").select("id", { count: "exact", head: true }),
      ]);
      if (profilesRes.data) setProfiles(profilesRes.data);
      setTeamCount(teamsRes.count ?? 0);
      setMemberCount(membersRes.count ?? 0);

      // Fetch scores for leaderboard
      const [projectsRes, scoresRes] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("judge_scores").select("*"),
      ]);
      if (projectsRes.data && scoresRes.data) {
        const teamIds = [...new Set(projectsRes.data.map((p: any) => p.team_id))];
        const teamNames: Record<string, string> = {};
        if (teamIds.length > 0) {
          const { data: teams } = await supabase.from("teams").select("id, name").in("id", teamIds);
          if (teams) teams.forEach((t: any) => { teamNames[t.id] = t.name; });
        }
        const projectsWithNames = projectsRes.data.map((p: any) => ({ ...p, team_name: teamNames[p.team_id] || "Unknown" }));
        setRanked(rankProjects(projectsWithNames, scoresRes.data as any));
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const onboarded = profiles.filter((p) => p.onboarding_completed);
  const inTeam = onboarded.filter((p) => p.team_status === "Yes").length;
  const lookingForTeam = onboarded.filter((p) => p.team_status === "Looking").length;
  const solo = onboarded.length - inTeam - lookingForTeam;

  // Skills distribution
  const skillCounts: Record<string, number> = {};
  for (const p of onboarded) {
    for (const s of p.skills ?? []) {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    }
  }
  const sortedSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]);

  // Catering stats
  const dietaryCounts = { Vegetarian: 0, Vegan: 0, Allergies: 0, "No restrictions": 0 };
  const allergyDetails: string[] = [];
  const meatCounts: Record<string, number> = { Chicken: 0, Beef: 0, Fish: 0, Any: 0 };
  let beerYes = 0, beerNo = 0, overnightYes = 0, overnightNo = 0;

  for (const p of onboarded) {
    const d = p.dietary ?? "";
    if (d === "Vegetarian") dietaryCounts.Vegetarian++;
    else if (d === "Vegan") dietaryCounts.Vegan++;
    else if (d === "Allergies") {
      dietaryCounts.Allergies++;
      if (p.allergies_detail) allergyDetails.push(p.allergies_detail);
    } else dietaryCounts["No restrictions"]++;

    if (d !== "Vegetarian" && d !== "Vegan") {
      const m = p.meat_preference ?? "Any";
      meatCounts[m] = (meatCounts[m] || 0) + 1;
    }

    if (p.drinks_beer === "Yes") beerYes++;
    else beerNo++;

    if (p.staying_overnight === "Yes") overnightYes++;
    else overnightNo++;
  }

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setPosting(true);
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      body: body.trim(),
      pinned,
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Announcement posted!");
      await postActivity("announcement_posted", "Organizer", `posted "${title.trim()}"`);
      setTitle("");
      setBody("");
      setPinned(false);
    }
  };

  const Stat = ({ label, value }: { label: string; value: number | string }) => (
    <div className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 px-5 pt-12 pb-28 md:pb-12 max-w-lg md:max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Aggregated participant data</p>
        </motion.div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading data...</p>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1 gap-1.5">
                <Users className="w-3.5 h-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="catering" className="flex-1 gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> Catering
              </TabsTrigger>
              <TabsTrigger value="post" className="flex-1 gap-1.5">
                <Send className="w-3.5 h-3.5" /> Post
              </TabsTrigger>
              <TabsTrigger value="scores" className="flex-1 gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Scores
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="glass-card p-5 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Registration</h3>
                <Stat label="Total registered (onboarded)" value={onboarded.length} />
                <Stat label="Total profiles" value={profiles.length} />
              </div>

              <div className="glass-card p-5 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Team Formation</h3>
                <Stat label="Teams formed" value={teamCount} />
                <Stat label="Participants in teams" value={memberCount} />
                <Stat label="In a team (profile)" value={inTeam} />
                <Stat label="Looking for team" value={lookingForTeam} />
                <Stat label="Solo / unset" value={solo} />
              </div>

              <div className="glass-card p-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Skills Distribution</h3>
                {sortedSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills data yet</p>
                ) : (
                  <div className="space-y-2">
                    {sortedSkills.map(([skill, count]) => (
                      <div key={skill} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{skill}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full gradient-bar"
                              style={{ width: `${Math.round((count / onboarded.length) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Catering Tab */}
            <TabsContent value="catering" className="space-y-4 mt-4">
              <div className="glass-card p-5 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Dietary Requirements</h3>
                <Stat label="Vegetarian" value={dietaryCounts.Vegetarian} />
                <Stat label="Vegan" value={dietaryCounts.Vegan} />
                <Stat label="Allergies" value={dietaryCounts.Allergies} />
                <Stat label="No restrictions" value={dietaryCounts["No restrictions"]} />
              </div>

              {allergyDetails.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Allergy Details</h3>
                  <ul className="space-y-1">
                    {allergyDetails.map((d, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {d}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="glass-card p-5 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Meat Preferences (non-restricted)</h3>
                {Object.entries(meatCounts).map(([k, v]) => (
                  <Stat key={k} label={k} value={v} />
                ))}
              </div>

              <div className="glass-card p-5 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Beverages</h3>
                <Stat label="Beer — Yes" value={beerYes} />
                <Stat label="Beer — No" value={beerNo} />
              </div>

              <div className="glass-card p-5 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Overnight Stay</h3>
                <Stat label="Staying overnight" value={overnightYes} />
                <Stat label="Not staying" value={overnightNo} />
              </div>
            </TabsContent>

            {/* Post Tab */}
            <TabsContent value="post" className="space-y-4 mt-4">
              <div className="glass-card p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">New Announcement</h3>
                <div className="space-y-2">
                  <Label htmlFor="ann-title" className="text-sm">Title</Label>
                  <Input
                    id="ann-title"
                    placeholder="Announcement title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ann-body" className="text-sm">Body</Label>
                  <Textarea
                    id="ann-body"
                    placeholder="Write your announcement..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="ann-pinned" checked={pinned} onCheckedChange={setPinned} />
                  <Label htmlFor="ann-pinned" className="text-sm cursor-pointer">Pin this announcement</Label>
                </div>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handlePost}
                  disabled={posting}
                >
                  {posting ? "Posting..." : "Post Announcement"}
                </Button>
              </div>
            </TabsContent>

            {/* Scores Tab */}
            <TabsContent value="scores" className="space-y-3 mt-4">
              {ranked.length === 0 || ranked.every((r) => r.judgeCount === 0) ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">No scores submitted yet</p>
                </div>
              ) : (
                ranked.filter((r) => r.judgeCount > 0).map((r) => {
                  const formatTrack = (t: string) => t.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <div
                      key={r.projectId}
                      className={`glass-card p-4 space-y-2 ${r.rank <= 3 ? "glow-border" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          r.rank === 1 ? "gradient-primary text-white" :
                          r.rank === 2 ? "bg-amber-500/20 text-amber-400" :
                          r.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {r.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{r.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">{r.teamName}</span>
                            <Badge variant="skill" className="text-[9px]">{formatTrack(r.track)}</Badge>
                          </div>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-xl font-black gradient-text">{r.avgTotal}</p>
                          <p className="text-[9px] text-muted-foreground">{r.judgeCount} judge{r.judgeCount !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                        {CRITERIA.map((c) => (
                          <div key={c.key} className="text-center">
                            <div className="h-1 rounded-full bg-muted overflow-hidden mb-1">
                              <div className="h-full gradient-bar" style={{ width: `${(r.avgScores[c.key] / c.max) * 100}%` }} />
                            </div>
                            <p className="text-[10px] font-medium">{r.avgScores[c.key]}/{c.max}</p>
                            <p className="text-[8px] text-muted-foreground leading-tight truncate">{c.label.split(" ")[0]}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
              {ranked.some((r) => r.judgeCount > 0) && (
                <div className="glass-card p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    Tie-break: 1) Memory &amp; Adaptivity &rarr; 2) Conversation Feel &rarr; 3) Judge vote
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Organizer;
