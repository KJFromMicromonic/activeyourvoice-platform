import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Brain, MessageSquare, Users, Lightbulb, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import CreateTeamSheet from "@/components/CreateTeamSheet";
import PostIdeaSheet from "@/components/PostIdeaSheet";

const tracksMeta = [
  {
    id: "communication-human-experience",
    name: "Communication & Human Experience",
    icon: Mic,
    description: "Build voice-first experiences that transform learning, connection, and human interaction.",
    maxTeams: 7,
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "business-automation",
    name: "Business Automation",
    icon: MessageSquare,
    description: "Automate real business workflows end-to-end with intelligent voice and conversational AI.",
    maxTeams: 7,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "developer-infrastructure-tools",
    name: "Developer & Infrastructure Tools",
    icon: Brain,
    description: "Build tools that developers would actually adopt — voice-powered dev workflows, agents, and infrastructure.",
    maxTeams: 7,
    color: "from-indigo-500 to-blue-600",
  },
];

interface TeamRow {
  id: string;
  name: string;
  description: string;
  track: string;
  skills_needed: string[];
  max_members: number;
  leader_id: string;
}

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [leaderProfiles, setLeaderProfiles] = useState<Record<string, { first_name: string; last_name: string; avatar_url: string | null }>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: teamsData } = await supabase.from("teams").select("*");
    if (teamsData) {
      setTeams(teamsData as TeamRow[]);
      const counts: Record<string, number> = {};
      const { data: members } = await supabase.from("team_members").select("team_id");
      if (members) {
        members.forEach((m: any) => { counts[m.team_id] = (counts[m.team_id] || 0) + 1; });
      }
      setMemberCounts(counts);

      const leaderIds = [...new Set(teamsData.map((t: any) => t.leader_id))];
      const profiles: Record<string, any> = {};
      for (const lid of leaderIds) {
        const { data } = await supabase.from("profiles").select("first_name, last_name, avatar_url").eq("user_id", lid).single();
        if (data) profiles[lid] = data;
      }
      setLeaderProfiles(profiles);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  const trackCounts: Record<string, number> = {};
  teams.forEach((t) => { trackCounts[t.track] = (trackCounts[t.track] || 0) + 1; });

  const getInitials = (first: string, last: string) =>
    `${(first || "")[0] || ""}${(last || "")[0] || ""}`.toUpperCase() || "?";

  return (
    <div className="px-5 pt-12 pb-28 md:pb-12 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold">Teams & Tracks</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose your track, find your crew, build the future of Voice Agents</p>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex gap-3">
        <PostIdeaSheet>
          <Button variant="gradient" className="flex-1 rounded-xl">
            <Lightbulb className="w-4 h-4" />
            Post an Idea
          </Button>
        </PostIdeaSheet>
        <CreateTeamSheet onTeamCreated={fetchData}>
          <Button variant="glass" className="flex-1 rounded-xl border border-border">
            <Users className="w-4 h-4" />
            Create Team
          </Button>
        </CreateTeamSheet>
      </motion.div>

      {/* Tracks */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tracksMeta.map((track, i) => {
            const count = trackCounts[track.id] || 0;
            const isExpanded = expandedTrack === track.id;
            const trackTeams = teams.filter((t) => t.track === track.id);
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="glass-card-hover p-5 space-y-3 cursor-pointer"
                onClick={() => setExpandedTrack(isExpanded ? null : track.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center`}>
                      <track.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{track.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{count}/{track.maxTeams} teams registered</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{track.description}</p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full gradient-bar transition-all duration-500" style={{ width: `${(count / track.maxTeams) * 100}%` }} />
                </div>
                <p className="text-[10px] text-primary font-medium">{track.maxTeams - count} spots left</p>

                {isExpanded && (
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    {trackTeams.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-1">No teams yet</p>
                    ) : (
                      trackTeams.map((team) => {
                        const leader = leaderProfiles[team.leader_id];
                        const count = memberCounts[team.id] || 0;
                        return (
                          <div
                            key={team.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(`/teams/${team.id}`); }}
                          >
                            {leader && (
                              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-[9px] font-bold text-white overflow-hidden shrink-0">
                                {leader.avatar_url ? (
                                  <img src={leader.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  getInitials(leader.first_name, leader.last_name)
                                )}
                              </div>
                            )}
                            <span className="text-xs font-medium flex-1 truncate">{team.name}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{count}/{team.max_members}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Teams</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : teams.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No teams yet — be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teams.map((team, i) => {
              const leader = leaderProfiles[team.leader_id];
              const count = memberCounts[team.id] || 0;
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="glass-card-hover p-4 space-y-3 cursor-pointer"
                  onClick={() => navigate(`/teams/${team.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{team.name}</h3>
                      <Badge variant="skill" className="text-[10px] mt-1">
                        {team.track.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </div>
                    {leader && (
                      <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0">
                        {leader.avatar_url ? (
                          <img src={leader.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          getInitials(leader.first_name, leader.last_name)
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{team.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {team.skills_needed.slice(0, 3).map((s) => (
                        <Badge key={s} variant="glass" className="text-[10px] px-2 py-0">{s}</Badge>
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{count}/{team.max_members} members</span>
                  </div>
                  <Button variant="glass" size="sm" className="w-full rounded-xl border border-border text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/teams/${team.id}`); }}>
                    View Team
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;
