import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SKILLS = ["All", "Developer", "Designer", "Product", "AI/ML", "Data", "Business"];

const mockPeople = [
  { id: 1, name: "Sarah Chen", bio: "Full-stack engineer obsessed with voice UX", skills: ["Full-stack", "AI/ML"], company: "Vercel", avatar: "SC", lookingForTeam: true, complete: true },
  { id: 2, name: "Maxime Dupont", bio: "Product designer who thinks in systems", skills: ["Design", "Product"], company: "Figma", avatar: "MD", lookingForTeam: true, complete: true },
  { id: 3, name: "Aisha Patel", bio: "ML engineer building conversational agents", skills: ["AI/ML", "Backend"], company: "DeepMind", avatar: "AP", lookingForTeam: false, complete: true },
  { id: 4, name: "Lucas Martin", bio: "Backend dev, distributed systems nerd", skills: ["Backend", "DevOps"], company: "Datadog", avatar: "LM", lookingForTeam: true, complete: false },
  { id: 5, name: "Yuki Tanaka", bio: "Voice tech researcher & NLP wizard", skills: ["AI/ML", "NLP"], company: "Speechmatics", avatar: "YT", lookingForTeam: false, complete: true },
  { id: 6, name: "Omar Hassan", bio: "Startup founder, always building", skills: ["Business", "Product"], company: "Stealth", avatar: "OH", lookingForTeam: true, complete: true },
  { id: 7, name: "Emma Wilson", bio: "Frontend wizard, animation enthusiast", skills: ["Frontend", "Design"], company: "Stripe", avatar: "EW", lookingForTeam: true, complete: false },
  { id: 8, name: "Ravi Kumar", bio: "Data scientist turned builder", skills: ["Data", "AI/ML"], company: "Meta", avatar: "RK", lookingForTeam: false, complete: true },
];

const People = () => {
  const [search, setSearch] = useState("");
  const [activeSkill, setActiveSkill] = useState("All");

  const filtered = mockPeople.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.bio.toLowerCase().includes(search.toLowerCase());
    const matchesSkill = activeSkill === "All" || p.skills.some((s) => s.toLowerCase().includes(activeSkill.toLowerCase()));
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="px-5 pt-12 pb-6 max-w-lg mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold">People</h1>
          <div className="flex items-center gap-1.5 text-primary">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">{mockPeople.length} builders</span>
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
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((person, i) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
            className="glass-card-hover p-4 flex flex-col items-center text-center gap-2 cursor-pointer"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold gradient-primary ${person.complete ? "glow-avatar" : ""}`}>
              {person.avatar}
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight">{person.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{person.company}</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{person.bio}</p>
            <div className="flex flex-wrap justify-center gap-1">
              {person.skills.slice(0, 2).map((s) => (
                <Badge key={s} variant="skill" className="text-[10px] px-2 py-0">
                  {s}
                </Badge>
              ))}
            </div>
            {person.lookingForTeam && (
              <Badge variant="glass" className="text-[10px] px-2 py-0.5 mt-auto">
                🔍 Looking for team
              </Badge>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default People;
