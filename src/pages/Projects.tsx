import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProjectSubmitSheet from "@/components/ProjectSubmitSheet";

const TRACKS = ["All", "Communication & Human Experience", "Business Automation", "Developer & Infrastructure Tools"];

const trackIdMap: Record<string, string> = {
  "Communication & Human Experience": "communication-human-experience",
  "Business Automation": "business-automation",
  "Developer & Infrastructure Tools": "developer-infrastructure-tools",
};

interface ProjectRow {
  id: string;
  team_id: string;
  title: string;
  tagline: string;
  description: string | null;
  demo_url: string | null;
  repo_url: string | null;
  track: string;
  tech_stack: string[];
  submitted_at: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<(ProjectRow & { team_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrack, setActiveTrack] = useState("All");
  const [leaderTeam, setLeaderTeam] = useState<{ id: string; track: string } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("submitted_at", { ascending: false });
    if (data) {
      // Fetch team names
      const teamIds = [...new Set(data.map((p: any) => p.team_id))];
      const teamNames: Record<string, string> = {};
      if (teamIds.length > 0) {
        const { data: teams } = await supabase.from("teams").select("id, name").in("id", teamIds);
        if (teams) teams.forEach((t: any) => { teamNames[t.id] = t.name; });
      }
      setProjects(data.map((p: any) => ({ ...p, team_name: teamNames[p.team_id] || "Unknown team" })));
      return data;
    }
    return [];
  };

  useEffect(() => {
    const load = async () => {
      const projectData = await fetchProjects();

      // Check if current user is a team leader
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: membership } = await supabase
          .from("team_members")
          .select("team_id, role")
          .eq("user_id", user.id)
          .eq("role", "leader")
          .limit(1);
        if (membership && membership.length > 0) {
          const teamId = membership[0].team_id;
          const { data: team } = await supabase.from("teams").select("id, track").eq("id", teamId).single();
          if (team) {
            setLeaderTeam({ id: team.id, track: team.track });
            const alreadySubmitted = projectData?.some((p: any) => p.team_id === team.id);
            setHasSubmitted(!!alreadySubmitted);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activeTrack === "All"
    ? projects
    : projects.filter((p) => p.track === trackIdMap[activeTrack]);

  const myProject = leaderTeam ? projects.find((p) => p.team_id === leaderTeam.id) : null;

  const handleSubmitted = async () => {
    await fetchProjects();
    setHasSubmitted(true);
  };

  return (
    <div className="px-5 pt-12 pb-28 md:pb-12 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">Projects</h1>
          <div className="flex items-center gap-1.5 text-primary">
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm font-semibold">{projects.length} submitted</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Browse hackathon submissions</p>
      </motion.div>

      {/* Submit CTA */}
      {leaderTeam && !hasSubmitted && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <ProjectSubmitSheet
            teamId={leaderTeam.id}
            teamTrack={leaderTeam.track}
            onSubmitted={handleSubmitted}
          >
            <Button variant="gradient" className="w-full rounded-xl h-12">
              <FolderOpen className="w-4 h-4" />
              Submit Your Project
            </Button>
          </ProjectSubmitSheet>
        </motion.div>
      )}

      {leaderTeam && hasSubmitted && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <ProjectSubmitSheet
            teamId={leaderTeam.id}
            teamTrack={leaderTeam.track}
            existingProject={myProject || null}
            onSubmitted={handleSubmitted}
          >
            <Button variant="glass" className="w-full rounded-xl border border-border">
              <FolderOpen className="w-4 h-4" />
              Update Submission
            </Button>
          </ProjectSubmitSheet>
        </motion.div>
      )}

      {/* Track filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {TRACKS.map((track) => (
          <button
            key={track}
            onClick={() => setActiveTrack(track)}
            className={track === activeTrack ? "pill-button-active shrink-0" : "pill-button shrink-0"}
          >
            {track}
          </button>
        ))}
      </div>

      {/* Project grid */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">No projects submitted yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to submit!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
              className="glass-card-hover p-4 space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{project.title}</h3>
                  <Badge variant="skill" className="text-[10px] shrink-0">
                    {project.track.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{project.tagline}</p>
              </div>

              <p className="text-[11px] text-muted-foreground/70">{project.team_name}</p>

              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tech_stack.slice(0, 4).map((tech) => (
                    <Badge key={tech} variant="glass" className="text-[10px] px-2 py-0">{tech}</Badge>
                  ))}
                  {project.tech_stack.length > 4 && (
                    <Badge variant="glass" className="text-[10px] px-2 py-0">+{project.tech_stack.length - 4}</Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {project.demo_url && (
                  <Button
                    variant="glass"
                    size="sm"
                    className="flex-1 rounded-xl border border-border text-xs"
                    onClick={() => window.open(project.demo_url!, "_blank", "noopener")}
                  >
                    <ExternalLink className="w-3 h-3" /> Demo
                  </Button>
                )}
                {project.repo_url && (
                  <Button
                    variant="glass"
                    size="sm"
                    className="flex-1 rounded-xl border border-border text-xs"
                    onClick={() => window.open(project.repo_url!, "_blank", "noopener")}
                  >
                    <Github className="w-3 h-3" /> Repo
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
