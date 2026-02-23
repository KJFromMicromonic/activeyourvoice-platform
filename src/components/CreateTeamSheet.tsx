import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ChevronLeft, ChevronRight, Check, Minus, Plus, Mic, MessageSquare, Brain, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { postActivity } from "@/lib/activity";

const SKILLS = ["Frontend", "Backend", "Full-stack", "AI/ML", "Design", "Product", "Data Science", "DevOps", "Business/Strategy", "Voice/NLP", "Other"];

const tracks = [
  { id: "voice-interfaces", name: "Voice Interfaces", icon: Mic, color: "from-purple-500 to-violet-600", maxTeams: 7 },
  { id: "conversational-ai", name: "Conversational AI", icon: MessageSquare, color: "from-blue-500 to-cyan-500", maxTeams: 7 },
  { id: "ai-agents-tools", name: "AI Agents & Tools", icon: Brain, color: "from-indigo-500 to-blue-600", maxTeams: 7 },
];

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  background: "linear-gradient(135deg, hsl(263,84%,58%), hsl(217,91%,60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

interface PersonResult {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  skills: string[] | null;
  avatar_url: string | null;
  bio: string | null;
}

interface CreateTeamSheetProps {
  children: React.ReactNode;
  onTeamCreated?: () => void;
}

const CreateTeamSheet = ({ children, onTeamCreated }: CreateTeamSheetProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState(4);

  // Step 3
  const [selectedTrack, setSelectedTrack] = useState("");
  const [trackCounts, setTrackCounts] = useState<Record<string, number>>({});

  // Step 4
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PersonResult[]>([]);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  // Step 5 - confirmation
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState(false);

  // Fetch track counts
  useEffect(() => {
    if (!open) return;
    const fetchCounts = async () => {
      const { data } = await supabase.from("teams").select("track");
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((t: any) => { counts[t.track] = (counts[t.track] || 0) + 1; });
        setTrackCounts(counts);
      }
    };
    fetchCounts();
  }, [open]);

  // Search people
  useEffect(() => {
    if (step !== 3 || !searchQuery.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, skills, avatar_url, bio")
        .eq("onboarding_completed", true)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
        .limit(10);
      if (data) {
        // Filter out current user
        const { data: { user } } = await supabase.auth.getUser();
        setSearchResults(data.filter((p) => p.user_id !== user?.id));
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, step]);

  const reset = () => {
    setStep(0);
    setDirection(1);
    setTeamName("");
    setDescription("");
    setSkillsNeeded([]);
    setTeamSize(4);
    setSelectedTrack("");
    setSearchQuery("");
    setSearchResults([]);
    setInvitedIds(new Set());
    setCreatedTeamId(null);
    setShowPoints(false);
  };

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goBack = () => { setDirection(-1); setStep((s) => s - 1); };

  const canProceed = () => {
    switch (step) {
      case 0: return teamName.trim().length > 0 && description.trim().length > 0;
      case 1: return skillsNeeded.length > 0;
      case 2: return selectedTrack !== "";
      default: return true;
    }
  };

  const toggleSkill = (skill: string) => {
    setSkillsNeeded((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); setSaving(false); return; }

      // Create team
      const { data: team, error } = await supabase.from("teams").insert({
        name: teamName.trim(),
        description: description.trim(),
        track: selectedTrack,
        skills_needed: skillsNeeded,
        max_members: teamSize,
        leader_id: user.id,
      }).select().single();

      if (error) { toast.error("Failed to create team"); console.error(error); setSaving(false); return; }

      // Add leader as member
      await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: user.id,
        role: "leader",
      });

      // Update profile team_status
      await supabase.from("profiles").update({ team_status: "Yes" }).eq("user_id", user.id);

      // Award points (+30)
      await supabase.from("profiles").update({
        points: (await supabase.from("profiles").select("points").eq("user_id", user.id).single()).data?.points! + 30,
      }).eq("user_id", user.id);

      setCreatedTeamId(team.id);
      goNext(); // Go to confirmation step (4)
      setTimeout(() => setShowPoints(true), 500);
      await postActivity("team_created", teamName.trim(), `created team "${teamName.trim()}"`);
      onTeamCreated?.();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const handleInvite = (userId: string) => {
    setInvitedIds((prev) => new Set(prev).add(userId));
    // In a real app, send notification/invitation
    toast.success("Invite sent!");
  };

  const getInitials = (first: string, last: string) =>
    `${(first || "")[0] || ""}${(last || "")[0] || ""}`.toUpperCase() || "?";

  const totalSteps = 4;

  return (
    <Drawer open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-[85vh] border-t border-primary/20"
        style={{
          background: "rgba(15, 15, 20, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Progress dots */}
          {step < 4 && (
            <div className="flex justify-center gap-2 pt-4 pb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-8 gradient-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="max-w-md mx-auto"
              >
                {/* Step 1 — Name */}
                {step === 0 && (
                  <div className="space-y-5 pt-2">
                    <div>
                      <h2 className="text-2xl font-black italic" style={titleStyle}>Name your crew</h2>
                      <p className="text-xs text-muted-foreground mt-1">Every great product starts with a name</p>
                    </div>
                    <div className="gradient-primary h-px w-12 rounded-full" />
                    <div className="space-y-3">
                      <Input
                        placeholder="Team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="glass-input"
                        maxLength={50}
                      />
                      <div className="relative">
                        <Textarea
                          placeholder="What do you want to build? Describe it in a few words"
                          value={description}
                          onChange={(e) => setDescription(e.target.value.slice(0, 280))}
                          className="glass-input min-h-[100px] resize-none"
                          maxLength={280}
                        />
                        <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">{description.length}/280</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 — Skills + Size */}
                {step === 1 && (
                  <div className="space-y-5 pt-2">
                    <div>
                      <h2 className="text-2xl font-black italic" style={titleStyle}>Who do you need?</h2>
                      <p className="text-xs text-muted-foreground mt-1">Pick the skills that'll make your team unstoppable</p>
                    </div>
                    <div className="gradient-primary h-px w-12 rounded-full" />
                    <div>
                      <label className="text-sm font-medium mb-2 block">Skills needed</label>
                      <div className="flex flex-wrap gap-2">
                        {SKILLS.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={skillsNeeded.includes(skill) ? "pill-button-active" : "pill-button"}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-3 block">Team size</label>
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={() => setTeamSize(Math.max(3, teamSize - 1))}
                          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-4xl font-bold gradient-text min-w-[48px] text-center">{teamSize}</span>
                        <button
                          onClick={() => setTeamSize(Math.min(6, teamSize + 1))}
                          className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-2">3–6 members per team</p>
                    </div>
                  </div>
                )}

                {/* Step 3 — Track */}
                {step === 2 && (
                  <div className="space-y-5 pt-2">
                    <div>
                      <h2 className="text-2xl font-black italic" style={titleStyle}>Pick your track</h2>
                      <p className="text-xs text-muted-foreground mt-1">Choose your battlefield</p>
                    </div>
                    <div className="gradient-primary h-px w-12 rounded-full" />
                    <div className="space-y-3">
                      {tracks.map((track) => {
                        const count = trackCounts[track.id] || 0;
                        const isFull = count >= track.maxTeams;
                        const isSelected = selectedTrack === track.id;
                        return (
                          <button
                            key={track.id}
                            onClick={() => !isFull && setSelectedTrack(track.id)}
                            disabled={isFull}
                            className={`w-full p-4 rounded-2xl text-left transition-all duration-300 ${
                              isSelected
                                ? "glass-card glow-border"
                                : isFull
                                ? "glass-card opacity-40 cursor-not-allowed"
                                : "glass-card-hover"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center`}>
                                <track.icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm">{track.name}</h3>
                                <p className="text-[11px] text-muted-foreground">
                                  {isFull ? "Track full" : `${track.maxTeams - count} spots left`}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 4 — Invite */}
                {step === 3 && (
                  <div className="space-y-5 pt-2">
                    <div>
                      <h2 className="text-2xl font-black italic" style={titleStyle}>Invite your crew</h2>
                      <p className="text-xs text-muted-foreground mt-1">Already know who you want? Bring them in</p>
                    </div>
                    <div className="gradient-primary h-px w-12 rounded-full" />
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search participants by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input pl-10"
                      />
                    </div>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                      {searchResults.map((person) => {
                        const isInvited = invitedIds.has(person.user_id);
                        return (
                          <div key={person.id} className="glass-card p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                              {person.avatar_url ? (
                                <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                getInitials(person.first_name, person.last_name)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{person.first_name} {person.last_name}</p>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {(person.skills || []).slice(0, 2).map((s) => (
                                  <Badge key={s} variant="skill" className="text-[9px] px-1.5 py-0">{s}</Badge>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => !isInvited && handleInvite(person.user_id)}
                              disabled={isInvited}
                              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                isInvited
                                  ? "bg-green-500/20 text-green-400 cursor-default"
                                  : "gradient-primary text-white hover:scale-105"
                              }`}
                            >
                              {isInvited ? (
                                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Invited</span>
                              ) : "Invite"}
                            </button>
                          </div>
                        );
                      })}
                      {searchQuery.trim() && searchResults.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No participants found</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5 — Confirmation */}
                {step === 4 && (
                  <div className="space-y-6 pt-8 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <div className="text-5xl mb-4">🚀</div>
                      <h2 className="text-2xl font-black italic" style={titleStyle}>Team created!</h2>
                      <p className="text-lg font-bold mt-2 glow-ring inline-block px-4 py-1 rounded-full glass-card">{teamName}</p>
                    </motion.div>
                    <Badge variant="skill" className="text-xs">
                      {tracks.find((t) => t.id === selectedTrack)?.name}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Your team is live — others can now apply to join</p>
                    {showPoints && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="space-y-2"
                      >
                        <p className="text-2xl font-bold gradient-text">+30 points</p>
                        <p className="text-sm">🤝 Team Player badge unlocked!</p>
                      </motion.div>
                    )}
                    <Button
                      variant="gradient"
                      className="w-full rounded-2xl h-12 text-base"
                      onClick={() => {
                        setOpen(false);
                        if (createdTeamId) navigate(`/teams/${createdTeamId}`);
                      }}
                    >
                      View my team <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom actions */}
          {step < 4 && (
            <div className="px-5 pb-6 pt-2 space-y-2 border-t border-white/5">
              {step === 3 ? (
                <div className="flex gap-3">
                  <Button
                    variant="glass"
                    className="flex-1 rounded-xl border border-white/10"
                    onClick={() => {
                      // Skip invite — create team
                      handleCreate();
                    }}
                    disabled={saving}
                  >
                    Skip for now
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1 rounded-xl"
                    onClick={handleCreate}
                    disabled={saving}
                  >
                    {saving ? "Creating..." : "Create team 🚀"}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  {step > 0 && (
                    <Button variant="glass" className="rounded-xl border border-white/10" onClick={goBack}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="gradient"
                    className="flex-1 rounded-xl h-12"
                    disabled={!canProceed()}
                    onClick={goNext}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateTeamSheet;
