import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const SKILLS = ["All", "Developer", "Designer", "Product", "AI/ML", "Data", "Business"];

interface PersonProfile {
  id: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  skills: string[] | null;
  company: string | null;
  avatar_url: string | null;
  team_status: string | null;
  onboarding_completed: boolean;
}

const getInitials = (first: string, last: string) => {
  return `${(first || "")[0] || ""}${(last || "")[0] || ""}`.toUpperCase() || "?";
};

const People = () => {
  const [search, setSearch] = useState("");
  const [activeSkill, setActiveSkill] = useState("All");
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, bio, skills, company, avatar_url, team_status, onboarding_completed")
        .eq("onboarding_completed", true);
      if (data) setPeople(data);
      setLoading(false);
    };
    fetchPeople();
  }, []);

  const filtered = people.filter((p) => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || (p.bio || "").toLowerCase().includes(search.toLowerCase()) || (p.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesSkill = activeSkill === "All" || (p.skills || []).some((s) => s.toLowerCase().includes(activeSkill.toLowerCase()));
    return matchesSearch && matchesSkill;
  });

  const lookingForTeam = (status: string | null) => !status || status === "No" || status === "Not yet";

  return (
    <div className="px-5 pt-12 pb-6 max-w-lg mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">People</h1>
          <div className="flex items-center gap-1.5 text-primary">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">{people.length} builders</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Find your crew for the hackathon</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, skill, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 placeholder:text-muted-foreground/50 transition-all"
        />
      </motion.div>

      {/* Filter Pills */}
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

      {/* Grid */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              className="glass-card-hover p-4 flex flex-col items-center text-center gap-2 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold gradient-primary glow-avatar overflow-hidden">
                {person.avatar_url ? (
                  <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  getInitials(person.first_name, person.last_name)
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-tight">{person.first_name} {person.last_name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{person.company || ""}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{person.bio || ""}</p>
              <div className="flex flex-wrap justify-center gap-1">
                {(person.skills || []).slice(0, 2).map((s) => (
                  <Badge key={s} variant="skill" className="text-[10px] px-2 py-0">
                    {s}
                  </Badge>
                ))}
              </div>
              {lookingForTeam(person.team_status) && (
                <Badge variant="glass" className="text-[10px] px-2 py-0.5 mt-auto">
                  🔍 Looking for team
                </Badge>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default People;
