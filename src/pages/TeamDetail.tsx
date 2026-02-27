import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Users, Edit2, Check, X, Search, ChevronLeft, Share2, UserPlus, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MeshBackground from "@/components/MeshBackground";
import { postActivity } from "@/lib/activity";

const SKILLS = ["Frontend", "Backend", "Full-stack", "AI/ML", "Design", "Product", "Data Science", "DevOps", "Business/Strategy", "Voice/NLP", "Other"];

const TRACKS = [
  { id: "communication-human-experience", name: "Communication & Human Experience" },
  { id: "business-automation", name: "Business Automation" },
  { id: "developer-infrastructure-tools", name: "Developer & Infrastructure Tools" },
];

interface TeamData {
  id: string;
  name: string;
  description: string;
  track: string;
  skills_needed: string[];
  max_members: number;
  leader_id: string;
}

interface MemberData {
  user_id: string;
  role: string;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    skills: string[] | null;
    bio: string | null;
  };
}

interface ApplicationData {
  id: string;
  user_id: string;
  status: string;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    skills: string[] | null;
    bio: string | null;
  };
}

const getInitials = (first: string, last: string) =>
  `${(first || "")[0] || ""}${(last || "")[0] || ""}`.toUpperCase() || "?";

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editSize, setEditSize] = useState(4);
  const [editTrack, setEditTrack] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [userApplication, setUserApplication] = useState<string | null>(null); // status

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Fetch team
      const { data: teamData } = await supabase.from("teams").select("*").eq("id", teamId!).single();
      if (!teamData) { setLoading(false); return; }
      setTeam(teamData as TeamData);

      // Fetch members with profiles
      const { data: membersData } = await supabase.from("team_members").select("user_id, role").eq("team_id", teamId!);
      if (membersData) {
        const enriched = await Promise.all(membersData.map(async (m: any) => {
          const { data: profile } = await supabase.from("profiles").select("first_name, last_name, avatar_url, skills, bio").eq("user_id", m.user_id).single();
          return { ...m, profile };
        }));
        setMembers(enriched);
      }

      // Fetch applications (if leader)
      if (user && teamData.leader_id === user.id) {
        const { data: apps } = await supabase.from("team_applications").select("*").eq("team_id", teamId!).eq("status", "pending");
        if (apps) {
          const enrichedApps = await Promise.all(apps.map(async (a: any) => {
            const { data: profile } = await supabase.from("profiles").select("first_name, last_name, avatar_url, skills, bio").eq("user_id", a.user_id).single();
            return { ...a, profile };
          }));
          setApplications(enrichedApps);
        }
      }

      // Check if current user has applied
      if (user && teamData.leader_id !== user.id) {
        const { data: app } = await supabase.from("team_applications").select("status").eq("team_id", teamId!).eq("user_id", user.id).single();
        if (app) setUserApplication(app.status);
      }

      setLoading(false);
    };
    load();
  }, [teamId]);

  const isLeader = currentUserId === team?.leader_id;
  const isMember = members.some((m) => m.user_id === currentUserId);
  const emptySlots = team ? team.max_members - members.length : 0;

  const handleApply = async () => {
    if (!currentUserId || !teamId) return;
    const { error } = await supabase.from("team_applications").insert({
      team_id: teamId,
      user_id: currentUserId,
    });
    if (error) {
      if (error.code === "23505") toast.error("Already applied");
      else toast.error("Failed to apply");
      return;
    }
    setUserApplication("pending");
    toast.success("Application sent!");
  };

  const handleApplicationAction = async (appId: string, userId: string, action: "accepted" | "rejected") => {
    const { error } = await supabase.from("team_applications").update({ status: action }).eq("id", appId);
    if (error) { toast.error("Failed to update"); return; }

    if (action === "accepted") {
      // Add as member
      await supabase.from("team_members").insert({ team_id: teamId!, user_id: userId, role: "member" });
      await supabase.from("profiles").update({ team_status: "Yes" }).eq("user_id", userId);
      // Award points
      const { data: profile } = await supabase.from("profiles").select("points").eq("user_id", userId).single();
      if (profile) {
        await supabase.from("profiles").update({ points: profile.points + 30 }).eq("user_id", userId);
      }
      const { data: newProfile } = await supabase.from("profiles").select("first_name, last_name, avatar_url, skills, bio").eq("user_id", userId).single();
      setMembers((prev) => [...prev, { user_id: userId, role: "member", profile: newProfile || undefined }]);
      if (newProfile && team) {
        await postActivity("member_joined", `${newProfile.first_name} ${newProfile.last_name}`, `joined team "${team.name}"`);
      }
      toast.success("Member accepted!");
    } else {
      toast.success("Application declined");
    }

    setApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Team not found</p>
        <Button variant="glass" onClick={() => navigate("/teams")}>Back to Teams</Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 px-5 pt-8 pb-28 md:pb-12 max-w-lg md:max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <button onClick={() => navigate("/teams")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Teams
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {editing ? (
            <div className="space-y-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="glass-input text-lg font-bold"
                placeholder="Team name"
              />
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="glass-input min-h-[80px] resize-none text-sm"
                placeholder="Team description"
                maxLength={280}
              />

              {/* Track */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Track</label>
                <div className="flex flex-wrap gap-2">
                  {TRACKS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setEditTrack(t.id)}
                      className={editTrack === t.id ? "pill-button-active text-xs" : "pill-button text-xs"}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills needed */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Skills needed</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                      className={editSkills.includes(s) ? "pill-button-active text-xs" : "pill-button text-xs"}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team size */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Team size</label>
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => setEditSize(Math.max(3, editSize - 1))}
                    className="w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-muted/50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold gradient-text min-w-[32px] text-center">{editSize}</span>
                  <button
                    onClick={() => setEditSize(Math.min(6, editSize + 1))}
                    className="w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-muted/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-1">3-6 members</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="gradient"
                  size="sm"
                  className="flex-1 rounded-xl"
                  disabled={editSaving || !editName.trim() || !editTrack || editSkills.length === 0}
                  onClick={async () => {
                    setEditSaving(true);
                    const { error } = await supabase.from("teams").update({
                      name: editName.trim(),
                      description: editDesc.trim(),
                      track: editTrack,
                      skills_needed: editSkills,
                      max_members: editSize,
                    }).eq("id", team.id);
                    if (error) {
                      toast.error("Failed to save");
                    } else {
                      setTeam((prev) => prev ? {
                        ...prev,
                        name: editName.trim(),
                        description: editDesc.trim(),
                        track: editTrack,
                        skills_needed: editSkills,
                        max_members: editSize,
                      } : prev);
                      toast.success("Team updated");
                      setEditing(false);
                    }
                    setEditSaving(false);
                  }}
                >
                  {editSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="glass" size="sm" className="rounded-xl border border-border" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold">{team.name}</h1>
                {isLeader && (
                  <button
                    onClick={() => {
                      setEditName(team.name);
                      setEditDesc(team.description);
                      setEditTrack(team.track);
                      setEditSkills([...team.skills_needed]);
                      setEditSize(team.max_members);
                      setEditing(true);
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Badge variant="skill">{team.track.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">{team.description}</p>
              <div className="flex flex-wrap gap-1">
                {team.skills_needed.map((s) => (
                  <Badge key={s} variant="glass" className="text-[10px] px-2 py-0">{s}</Badge>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Members */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Members ({members.length}/{team.max_members})
          </h2>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.user_id} className="glass-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {m.profile?.avatar_url ? (
                    <img src={m.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(m.profile?.first_name || "", m.profile?.last_name || "")
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate">{m.profile?.first_name} {m.profile?.last_name}</p>
                    {m.role === "leader" && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {(m.profile?.skills || []).slice(0, 3).map((s) => (
                      <Badge key={s} variant="skill" className="text-[9px] px-1.5 py-0">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} className="glass-card p-3 flex items-center gap-3 opacity-40">
                <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Open spot</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Applications (leader only) */}
        {isLeader && applications.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Pending Applications ({applications.length})
            </h2>
            <div className="space-y-2">
              {applications.map((app) => (
                <div key={app.id} className="glass-card-hover p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                      {app.profile?.avatar_url ? (
                        <img src={app.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(app.profile?.first_name || "", app.profile?.last_name || "")
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{app.profile?.first_name} {app.profile?.last_name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{app.profile?.bio || ""}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(app.profile?.skills || []).slice(0, 4).map((s) => (
                      <Badge key={s} variant="skill" className="text-[9px] px-1.5 py-0">{s}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                      onClick={() => handleApplicationAction(app.id, app.user_id, "accepted")}
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
                      onClick={() => handleApplicationAction(app.id, app.user_id, "rejected")}
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Delete team (leader only) */}
        {isLeader && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Team
              </button>
            ) : (
              <div className="glass-card p-4 border-red-500/20 space-y-3">
                <p className="text-sm text-red-400 font-semibold">Are you sure?</p>
                <p className="text-xs text-muted-foreground">This will permanently delete the team, remove all members, and cancel pending applications. This cannot be undone.</p>
                <div className="flex gap-2">
                  <Button
                    variant="glass"
                    size="sm"
                    className="flex-1 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                    disabled={deleting}
                    onClick={async () => {
                      setDeleting(true);
                      // Reset team_status for all members
                      const memberIds = members.map((m) => m.user_id);
                      if (memberIds.length > 0) {
                        await supabase.from("profiles").update({ team_status: "No" }).in("user_id", memberIds);
                      }
                      // Delete team (cascades to team_members, team_applications via FK)
                      const { error } = await supabase.from("teams").delete().eq("id", team!.id);
                      if (error) {
                        toast.error("Failed to delete team");
                        setDeleting(false);
                      } else {
                        toast.success("Team deleted");
                        navigate("/teams");
                      }
                    }}
                  >
                    {deleting ? "Deleting..." : "Yes, delete"}
                  </Button>
                  <Button variant="glass" size="sm" className="flex-1 rounded-xl border border-border" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Apply button (non-members only) */}
        {!isMember && !isLeader && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {userApplication === "pending" ? (
              <Button variant="glass" className="w-full rounded-xl border border-white/10 opacity-60 cursor-default" disabled>
                Applied — waiting for approval
              </Button>
            ) : userApplication === "accepted" ? (
              <Button variant="glass" className="w-full rounded-xl border border-green-500/30 text-green-400" disabled>
                <Check className="w-4 h-4" /> You're in!
              </Button>
            ) : userApplication === "rejected" ? (
              <Button variant="glass" className="w-full rounded-xl border border-white/10 opacity-60" disabled>
                Application not accepted
              </Button>
            ) : emptySlots > 0 ? (
              <Button variant="gradient" className="w-full rounded-xl h-12" onClick={handleApply}>
                Apply to Join
              </Button>
            ) : (
              <Button variant="glass" className="w-full rounded-xl border border-white/10 opacity-60" disabled>
                Team is full
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;
