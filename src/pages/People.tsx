import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Users, Sparkles, Linkedin, Briefcase, Building2, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SKILLS = ["All", "Developer", "Designer", "Product", "AI/ML", "Data", "Business"];
const STATUS_FILTERS = ["Everyone", "Looking for team", "In a team"];

interface PersonProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  skills: string[] | null;
  looking_for: string[] | null;
  company: string | null;
  role: string | null;
  linkedin: string | null;
  discord: string | null;
  avatar_url: string | null;
  team_status: string | null;
  onboarding_completed: boolean;
}

const getInitials = (first: string, last: string) => {
  return `${(first || "")[0] || ""}${(last || "")[0] || ""}`.toUpperCase() || "?";
};

const People = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeSkill, setActiveSkill] = useState("All");
  const [activeStatus, setActiveStatus] = useState("Everyone");
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<PersonProfile | null>(null);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, bio, skills, looking_for, company, role, linkedin, discord, avatar_url, team_status, onboarding_completed")
        .eq("onboarding_completed", true);
      if (data) setPeople(data);

      if (user && data) {
        const me = data.find((p) => p.user_id === user.id);
        if (me) setCurrentUser(me);

        const { data: membership } = await supabase
          .from("team_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "leader")
          .limit(1);
        if (membership && membership.length > 0) setIsTeamLeader(true);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const lookingForTeam = (status: string | null) => !status || status === "No" || status === "Not yet";

  const filtered = people.filter((p) => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || (p.bio || "").toLowerCase().includes(search.toLowerCase()) || (p.company || "").toLowerCase().includes(search.toLowerCase()) || (p.role || "").toLowerCase().includes(search.toLowerCase());
    const matchesSkill = activeSkill === "All" || (p.skills || []).some((s) => s.toLowerCase().includes(activeSkill.toLowerCase()));
    const matchesStatus = activeStatus === "Everyone" ||
      (activeStatus === "Looking for team" && lookingForTeam(p.team_status)) ||
      (activeStatus === "In a team" && p.team_status === "Yes");
    return matchesSearch && matchesSkill && matchesStatus;
  });

  // Matching algorithm
  const getMatches = () => {
    if (!currentUser?.looking_for || currentUser.looking_for.length === 0) return null;

    const candidates = people.filter(
      (p) => p.user_id !== currentUser.user_id && lookingForTeam(p.team_status) && p.skills && p.skills.length > 0
    );

    const scored = candidates.map((person) => {
      let score = 0;
      for (const need of currentUser.looking_for!) {
        const needLower = need.toLowerCase();
        for (const skill of person.skills!) {
          if (skill.toLowerCase().includes(needLower) || needLower.includes(skill.toLowerCase())) {
            score++;
            break;
          }
        }
      }
      return { person, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => ({ ...s.person, matchedSkills: getMatchedSkills(s.person) }));
  };

  const getMatchedSkills = (person: PersonProfile) => {
    if (!currentUser?.looking_for || !person.skills) return [];
    return person.skills.filter((skill) =>
      currentUser.looking_for!.some(
        (need) => skill.toLowerCase().includes(need.toLowerCase()) || need.toLowerCase().includes(skill.toLowerCase())
      )
    );
  };

  const matches = getMatches();

  const lookingCount = people.filter((p) => lookingForTeam(p.team_status)).length;
  const inTeamCount = people.filter((p) => p.team_status === "Yes").length;

  return (
    <div className="px-5 pt-12 pb-6 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">People</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><UserX className="w-3 h-3 text-amber-400" />{lookingCount} looking</span>
            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 text-green-400" />{inTeamCount} teamed</span>
            <span className="flex items-center gap-1 text-primary font-semibold"><Users className="w-3 h-3" />{people.length}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Find your crew for the hackathon</p>
      </motion.div>

      {/* Matches for You */}
      {currentUser && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Matches for You</h2>
          </div>
          {!currentUser.looking_for || currentUser.looking_for.length === 0 ? (
            <div className="glass-card p-4 text-center">
              <p className="text-xs text-muted-foreground">Complete your profile's "Looking for" section to see matches</p>
              <Button variant="glass" size="sm" className="mt-2 rounded-xl text-xs" onClick={() => navigate("/profile")}>
                Update Profile
              </Button>
            </div>
          ) : matches && matches.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {matches.map((person) => (
                <div
                  key={person.id}
                  className="glass-card-hover p-3 min-w-[160px] flex flex-col items-center text-center gap-2 shrink-0 cursor-pointer"
                  onClick={() => setSelectedPerson(person)}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold gradient-primary glow-avatar overflow-hidden">
                    {person.avatar_url ? (
                      <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(person.first_name, person.last_name)
                    )}
                  </div>
                  <p className="text-sm font-semibold leading-tight">{person.first_name} {person.last_name}</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {person.matchedSkills.map((s) => (
                      <Badge key={s} variant="skill" className="text-[9px] px-1.5 py-0 border-primary/30">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <Badge variant="glass" className="text-[9px] px-2 py-0.5">Looking for team</Badge>
                  {isTeamLeader && (
                    <Button
                      variant="gradient"
                      size="sm"
                      className="w-full rounded-xl text-[10px] h-7 mt-auto"
                      onClick={(e) => { e.stopPropagation(); toast.success(`Invite sent to ${person.first_name}!`); }}
                    >
                      Invite to team
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-4 text-center">
              <p className="text-xs text-muted-foreground">No matches yet &mdash; more people are joining soon!</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, role, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground/50 transition-all"
        />
      </motion.div>

      {/* Filter Pills — Skills + Status */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => setActiveSkill(skill)}
              className={skill === activeSkill ? "pill-button-active shrink-0" : "pill-button shrink-0"}
            >
              {skill}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition-all ${
                s === activeStatus
                  ? "bg-primary/20 text-primary font-medium border border-primary/30"
                  : "text-muted-foreground border border-border hover:border-primary/20"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{filtered.length} people</p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 h-48 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-muted mx-auto mb-3" />
              <div className="h-3 bg-muted rounded w-2/3 mx-auto mb-2" />
              <div className="h-2 bg-muted rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
              className="glass-card-hover p-4 flex flex-col items-center text-center gap-2 cursor-pointer"
              onClick={() => setSelectedPerson(person)}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold gradient-primary glow-avatar overflow-hidden">
                  {person.avatar_url ? (
                    <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(person.first_name, person.last_name)
                  )}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background ${
                  person.team_status === "Yes" ? "bg-green-500" : "bg-amber-500"
                }`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-tight">{person.first_name} {person.last_name}</h3>
                {(person.role || person.company) && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {person.role}{person.role && person.company ? " @ " : ""}{person.company}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {(person.skills || []).slice(0, 2).map((s) => (
                  <Badge key={s} variant="skill" className="text-[10px] px-2 py-0">
                    {s}
                  </Badge>
                ))}
              </div>
              {lookingForTeam(person.team_status) && (
                <Badge variant="glass" className="text-[10px] px-2 py-0.5 mt-auto">
                  Looking for team
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Profile Drawer */}
      <Sheet open={!!selectedPerson} onOpenChange={(open) => { if (!open) setSelectedPerson(null); }}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85dvh] overflow-y-auto border-border bg-background/95 backdrop-blur-xl px-0 pb-10">
          {selectedPerson && (
            <div className="px-6 pt-2 space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-base font-bold gradient-primary glow-avatar overflow-hidden shrink-0">
                  {selectedPerson.avatar_url ? (
                    <img src={selectedPerson.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(selectedPerson.first_name, selectedPerson.last_name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold leading-tight">
                    {selectedPerson.first_name} {selectedPerson.last_name}
                  </h2>
                  {(selectedPerson.role || selectedPerson.company) && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      {selectedPerson.role && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Briefcase className="w-3 h-3" />
                          {selectedPerson.role}
                        </span>
                      )}
                      {selectedPerson.company && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          {selectedPerson.company}
                        </span>
                      )}
                    </div>
                  )}
                  <Badge
                    variant="glass"
                    className={`text-[10px] px-2 py-0.5 mt-1 ${
                      selectedPerson.team_status === "Yes" ? "border-green-500/30 text-green-400" : "border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {selectedPerson.team_status === "Yes" ? "In a team" : "Looking for team"}
                  </Badge>
                </div>
              </div>

              {/* Bio */}
              {selectedPerson.bio && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">About</p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{selectedPerson.bio}</p>
                </div>
              )}

              {/* Skills */}
              {(selectedPerson.skills || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedPerson.skills || []).map((s) => (
                      <Badge key={s} variant="skill" className="text-xs px-2.5 py-0.5">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Looking For */}
              {(selectedPerson.looking_for || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">Looking For</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedPerson.looking_for || []).map((s) => (
                      <Badge key={s} variant="glass" className="text-xs px-2.5 py-0.5">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Connect buttons */}
              <div className="flex gap-2">
                {selectedPerson.linkedin && (
                  <Button
                    variant="gradient"
                    className="flex-1 rounded-xl gap-2"
                    onClick={() => window.open(selectedPerson.linkedin!, "_blank", "noopener")}
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                )}
                {selectedPerson.discord && (
                  <Button
                    variant="glass"
                    className="flex-1 rounded-xl gap-2 border border-border"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPerson.discord!);
                      toast.success("Discord username copied!");
                    }}
                  >
                    @{selectedPerson.discord}
                  </Button>
                )}
              </div>

              {/* No contact info */}
              {!selectedPerson.linkedin && !selectedPerson.discord && (
                <p className="text-xs text-muted-foreground text-center">No contact info shared yet</p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default People;
