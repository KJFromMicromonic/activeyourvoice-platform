import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Trophy, Edit2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MeshBackground from "@/components/MeshBackground";
import JudgeScoringSheet from "@/components/JudgeScoringSheet";
import { CRITERIA, calcTotal, rankProjects, type ScoreRow, type ScoreKey } from "@/lib/scoring";

interface ProjectWithTeam {
  id: string;
  title: string;
  tagline: string;
  track: string;
  team_name: string;
  demo_url: string | null;
  repo_url: string | null;
}

interface ScoreData extends ScoreRow {
  id: string;
  judge_id: string;
  project_id: string;
  notes: string | null;
}

const Judge = () => {
  const [projects, setProjects] = useState<ProjectWithTeam[]>([]);
  const [allScores, setAllScores] = useState<ScoreData[]>([]);
  const [myScores, setMyScores] = useState<Record<string, ScoreData>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    // Get judge's assigned tracks
    let assignedTracks: string[] = [];
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("judge_tracks").eq("user_id", user.id).single();
      assignedTracks = profile?.judge_tracks || [];
    }

    const { data: projectsData } = await supabase.from("projects").select("*").order("submitted_at", { ascending: false });
    if (projectsData) {
      const teamIds = [...new Set(projectsData.map((p: any) => p.team_id))];
      const teamNames: Record<string, string> = {};
      if (teamIds.length > 0) {
        const { data: teams } = await supabase.from("teams").select("id, name").in("id", teamIds);
        if (teams) teams.forEach((t: any) => { teamNames[t.id] = t.name; });
      }
      let enriched = projectsData.map((p: any) => ({ ...p, team_name: teamNames[p.team_id] || "Unknown" }));
      if (assignedTracks.length > 0) {
        enriched = enriched.filter((p: any) => assignedTracks.includes(p.track));
      }
      setProjects(enriched);
    }

    const { data: scoresData } = await supabase.from("judge_scores").select("*");
    if (scoresData) {
      setAllScores(scoresData as ScoreData[]);
      if (user) {
        const mine: Record<string, ScoreData> = {};
        (scoresData as ScoreData[]).filter((s) => s.judge_id === user.id).forEach((s) => { mine[s.project_id] = s; });
        setMyScores(mine);
      }
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const scoredProjectIds = new Set(Object.keys(myScores));
  const ranked = rankProjects(projects, allScores as any);
  const scoredCount = projects.filter((p) => scoredProjectIds.has(p.id)).length;

  const formatTrack = (track: string) => track.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 px-4 pt-10 pb-28 md:pb-12 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold">Judging Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {scoredCount}/{projects.length} scored &middot; 7 criteria &middot; 100 pts
          </p>
        </motion.div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading...</p>
        ) : (
          <Tabs defaultValue="score">
            <TabsList className="w-full h-auto p-1">
              <TabsTrigger value="score" className="flex-1 text-xs py-2">Projects</TabsTrigger>
              <TabsTrigger value="mine" className="flex-1 text-xs py-2">My Scores</TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex-1 text-xs py-2 gap-1">
                <Trophy className="w-3 h-3" /> Board
              </TabsTrigger>
            </TabsList>

            {/* Projects to Score */}
            <TabsContent value="score" className="mt-3">
              {projects.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">No projects submitted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project, i) => {
                    const scored = scoredProjectIds.has(project.id);
                    const score = myScores[project.id];
                    const total = score ? calcTotal(score) : 0;

                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="glass-card-hover p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate">{project.title}</h3>
                              {scored && <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{project.team_name}</p>
                          </div>
                          {scored && (
                            <div className="text-center shrink-0">
                              <p className="text-lg font-bold gradient-text">{total}</p>
                              <p className="text-[9px] text-muted-foreground">/100</p>
                            </div>
                          )}
                        </div>

                        <Badge variant="skill" className="text-[10px]">{formatTrack(project.track)}</Badge>

                        <div className="flex gap-2">
                          {project.demo_url && (
                            <Button variant="glass" size="sm" className="rounded-xl border border-border text-xs flex-1 h-9"
                              onClick={() => window.open(project.demo_url!, "_blank", "noopener")}>
                              <ExternalLink className="w-3 h-3" /> Demo
                            </Button>
                          )}
                          {project.repo_url && (
                            <Button variant="glass" size="sm" className="rounded-xl border border-border text-xs flex-1 h-9"
                              onClick={() => window.open(project.repo_url!, "_blank", "noopener")}>
                              <Github className="w-3 h-3" /> Repo
                            </Button>
                          )}
                        </div>

                        <JudgeScoringSheet project={project} existingScore={score || null} onScored={fetchData}>
                          <Button
                            variant={scored ? "glass" : "gradient"}
                            className={`w-full rounded-xl text-sm h-11 ${scored ? "border border-border" : ""}`}
                          >
                            {scored ? <><Edit2 className="w-3.5 h-3.5" /> Edit Score ({total}/100)</> : "Score This Project"}
                          </Button>
                        </JudgeScoringSheet>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* My Scores */}
            <TabsContent value="mine" className="mt-3 space-y-3">
              {Object.keys(myScores).length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">You haven't scored any projects yet</p>
                </div>
              ) : (
                projects.filter((p) => scoredProjectIds.has(p.id)).map((project) => {
                  const score = myScores[project.id];
                  const total = calcTotal(score);

                  return (
                    <div key={project.id} className="glass-card p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">{project.title}</h3>
                          <p className="text-xs text-muted-foreground">{project.team_name}</p>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-2xl font-black gradient-text">{total}</p>
                          <p className="text-[10px] text-muted-foreground">/100</p>
                        </div>
                      </div>

                      {/* Criteria breakdown — 2 cols on mobile, 7 on desktop */}
                      <div className="grid grid-cols-2 gap-2">
                        {CRITERIA.map((c) => (
                          <div key={c.key} className="flex items-center justify-between glass-card p-2 rounded-lg">
                            <span className="text-[10px] text-muted-foreground truncate mr-2">{c.label}</span>
                            <span className="text-xs font-bold shrink-0">{score[c.key] ?? 0}<span className="text-muted-foreground font-normal">/{c.max}</span></span>
                          </div>
                        ))}
                      </div>

                      <JudgeScoringSheet project={project} existingScore={score} onScored={fetchData}>
                        <Button variant="glass" size="sm" className="w-full rounded-xl border border-border text-xs h-10">
                          <Edit2 className="w-3 h-3" /> Edit Score
                        </Button>
                      </JudgeScoringSheet>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* Leaderboard */}
            <TabsContent value="leaderboard" className="mt-3 space-y-3">
              {ranked.length === 0 || ranked.every((r) => r.judgeCount === 0) ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">No scores submitted yet</p>
                </div>
              ) : (
                ranked.filter((r) => r.judgeCount > 0).map((r) => (
                  <motion.div
                    key={r.projectId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`glass-card p-4 space-y-3 ${r.rank <= 3 ? "glow-border" : ""}`}
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
                        <p className="text-[11px] text-muted-foreground">{r.teamName}</p>
                      </div>
                      <div className="text-center shrink-0">
                        <p className="text-xl font-black gradient-text">{r.avgTotal}</p>
                        <p className="text-[9px] text-muted-foreground">{r.judgeCount}j</p>
                      </div>
                    </div>

                    {/* Criteria breakdown — stacked on mobile */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {CRITERIA.map((c) => (
                        <div key={c.key} className="flex items-center justify-between px-2 py-1">
                          <span className="text-[9px] text-muted-foreground truncate mr-1">{c.label}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                              <div className="h-full gradient-bar" style={{ width: `${(r.avgScores[c.key] / c.max) * 100}%` }} />
                            </div>
                            <span className="text-[9px] font-medium w-8 text-right">{r.avgScores[c.key]}/{c.max}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}

              {ranked.some((r) => r.judgeCount > 0) && (
                <div className="glass-card p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    Tie-break: 1) Memory &rarr; 2) Conversation &rarr; 3) Judge vote
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

export default Judge;
