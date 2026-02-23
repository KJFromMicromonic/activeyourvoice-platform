import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Trophy, CheckCircle, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MeshBackground from "@/components/MeshBackground";
import JudgeScoringSheet from "@/components/JudgeScoringSheet";
import { TRACK_MAP, calcSectionTotals, rankProjects, type ScoreRow } from "@/lib/scoring";

interface ProjectWithTeam {
  id: string;
  title: string;
  tagline: string;
  track: string;
  team_name: string;
  demo_url: string | null;
  repo_url: string | null;
}

interface ScoreData {
  id: string;
  judge_id: string;
  project_id: string;
  voice_naturalness: number | null;
  voice_turn_taking: number | null;
  voice_persona: number | null;
  voice_multimodal: number | null;
  voice_accessibility: number | null;
  tech_stability: number | null;
  tech_architecture: number | null;
  tech_actions: number | null;
  tech_complexity: number | null;
  tech_autonomy: number | null;
  memory_short_term: number | null;
  memory_long_term: number | null;
  memory_adaptivity: number | null;
  memory_improvement: number | null;
  impact_problem_clarity: number | null;
  impact_feasibility: number | null;
  track_criterion_1: number | null;
  track_criterion_2: number | null;
  presentation_clarity: number | null;
  presentation_qa: number | null;
  notes_strengths: string | null;
  notes_improvements: string | null;
  notes_overall: string | null;
}

const Judge = () => {
  const [projects, setProjects] = useState<ProjectWithTeam[]>([]);
  const [allScores, setAllScores] = useState<ScoreData[]>([]);
  const [myScores, setMyScores] = useState<Record<string, ScoreData>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    // Fetch projects with team names
    const { data: projectsData } = await supabase.from("projects").select("*").order("submitted_at", { ascending: false });
    if (projectsData) {
      const teamIds = [...new Set(projectsData.map((p: any) => p.team_id))];
      const teamNames: Record<string, string> = {};
      if (teamIds.length > 0) {
        const { data: teams } = await supabase.from("teams").select("id, name").in("id", teamIds);
        if (teams) teams.forEach((t: any) => { teamNames[t.id] = t.name; });
      }
      setProjects(projectsData.map((p: any) => ({ ...p, team_name: teamNames[p.team_id] || "Unknown" })));
    }

    // Fetch all scores
    const { data: scoresData } = await supabase.from("judge_scores").select("*");
    if (scoresData) {
      setAllScores(scoresData);
      if (user) {
        const mine: Record<string, ScoreData> = {};
        scoresData.filter((s: any) => s.judge_id === user.id).forEach((s: any) => { mine[s.project_id] = s; });
        setMyScores(mine);
      }
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const scoredProjectIds = new Set(Object.keys(myScores));
  const ranked = rankProjects(projects, allScores as any);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 px-5 pt-12 pb-28 md:pb-12 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Judging Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Score projects across 5 categories &middot; 100 points total</p>
        </motion.div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading...</p>
        ) : (
          <Tabs defaultValue="score">
            <TabsList className="w-full">
              <TabsTrigger value="score" className="flex-1">Projects to Score</TabsTrigger>
              <TabsTrigger value="mine" className="flex-1">My Scores</TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex-1 gap-1">
                <Trophy className="w-3.5 h-3.5" /> Leaderboard
              </TabsTrigger>
            </TabsList>

            {/* Projects to Score */}
            <TabsContent value="score" className="mt-4">
              {projects.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">No projects submitted yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projects.map((project, i) => {
                    const scored = scoredProjectIds.has(project.id);
                    const score = myScores[project.id];
                    const total = score ? calcSectionTotals(score as ScoreRow).total : 0;
                    const trackInfo = TRACK_MAP[project.track];

                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        className="glass-card-hover p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{project.title}</h3>
                            <p className="text-xs text-muted-foreground truncate">{project.tagline}</p>
                          </div>
                          {scored && (
                            <div className="text-center shrink-0">
                              <p className="text-lg font-bold gradient-text">{total}</p>
                              <p className="text-[9px] text-muted-foreground">/100</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="skill" className="text-[10px]">
                            {trackInfo?.judgingName || project.track}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">{project.team_name}</span>
                        </div>

                        <div className="flex gap-2">
                          {project.demo_url && (
                            <Button
                              variant="glass"
                              size="sm"
                              className="rounded-xl border border-border text-xs flex-1"
                              onClick={() => window.open(project.demo_url!, "_blank", "noopener")}
                            >
                              <ExternalLink className="w-3 h-3" /> Demo
                            </Button>
                          )}
                          {project.repo_url && (
                            <Button
                              variant="glass"
                              size="sm"
                              className="rounded-xl border border-border text-xs flex-1"
                              onClick={() => window.open(project.repo_url!, "_blank", "noopener")}
                            >
                              <Github className="w-3 h-3" /> Repo
                            </Button>
                          )}
                        </div>

                        <JudgeScoringSheet
                          project={project}
                          existingScore={score || null}
                          onScored={fetchData}
                        >
                          <Button
                            variant={scored ? "glass" : "gradient"}
                            className={`w-full rounded-xl text-sm ${scored ? "border border-border" : ""}`}
                          >
                            {scored ? (
                              <><Edit2 className="w-3.5 h-3.5" /> Edit Score</>
                            ) : (
                              "Score This Project"
                            )}
                          </Button>
                        </JudgeScoringSheet>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* My Scores */}
            <TabsContent value="mine" className="mt-4 space-y-3">
              {Object.keys(myScores).length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">You haven't scored any projects yet</p>
                </div>
              ) : (
                projects.filter((p) => scoredProjectIds.has(p.id)).map((project) => {
                  const score = myScores[project.id];
                  const totals = calcSectionTotals(score as ScoreRow);
                  const trackInfo = TRACK_MAP[project.track];

                  return (
                    <div key={project.id} className="glass-card p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm">{project.title}</h3>
                          <p className="text-xs text-muted-foreground">{project.team_name}</p>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-2xl font-black gradient-text">{totals.total}</p>
                          <p className="text-[10px] text-muted-foreground">/100</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { label: "Voice", score: totals.voice, max: 25 },
                          { label: "Tech", score: totals.tech, max: 25 },
                          { label: "Memory", score: totals.memory, max: 20 },
                          { label: "Impact", score: totals.impact, max: 20 },
                          { label: "Present.", score: totals.presentation, max: 10 },
                        ].map((s) => (
                          <div key={s.label} className="text-center">
                            <p className="text-xs font-bold">{s.score}</p>
                            <p className="text-[9px] text-muted-foreground">/{s.max}</p>
                            <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <JudgeScoringSheet
                        project={project}
                        existingScore={score}
                        onScored={fetchData}
                      >
                        <Button variant="glass" size="sm" className="w-full rounded-xl border border-border text-xs">
                          <Edit2 className="w-3 h-3" /> Edit Score
                        </Button>
                      </JudgeScoringSheet>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* Leaderboard */}
            <TabsContent value="leaderboard" className="mt-4 space-y-3">
              {ranked.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">No scores submitted yet</p>
                </div>
              ) : (
                ranked.map((r) => {
                  const trackInfo = TRACK_MAP[r.track];
                  return (
                    <motion.div
                      key={r.projectId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
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
                            <Badge variant="skill" className="text-[9px]">
                              {trackInfo?.judgingName || r.track}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-xl font-black gradient-text">{r.avgTotal}</p>
                          <p className="text-[9px] text-muted-foreground">{r.judgeCount} judge{r.judgeCount !== 1 ? "s" : ""}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {[
                          { label: "Voice", score: r.avgVoice, max: 25 },
                          { label: "Tech", score: r.avgTech, max: 25 },
                          { label: "Memory", score: r.avgMemory, max: 20 },
                          { label: "Impact", score: r.avgImpact, max: 20 },
                          { label: "Present.", score: r.avgPresentation, max: 10 },
                        ].map((s) => (
                          <div key={s.label} className="text-center">
                            <div className="h-1 rounded-full bg-muted overflow-hidden mb-1">
                              <div className="h-full gradient-bar" style={{ width: `${(s.score / s.max) * 100}%` }} />
                            </div>
                            <p className="text-[10px] font-medium">{s.score}/{s.max}</p>
                            <p className="text-[9px] text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })
              )}

              {ranked.length > 0 && (
                <div className="glass-card p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    Tie-break: 1) Memory &amp; Adaptivity &rarr; 2) Voice Experience &rarr; 3) Judge vote
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
