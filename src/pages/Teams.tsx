import { motion } from "framer-motion";
import { Rocket, Mic, Brain, MessageSquare, Users, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tracks = [
  {
    id: 1,
    name: "Voice Interfaces",
    icon: Mic,
    description: "Build the next generation of voice-first experiences — assistants, agents, and interactive voice apps.",
    teams: 3,
    maxTeams: 7,
    color: "from-purple-500 to-violet-600",
  },
  {
    id: 2,
    name: "Conversational AI",
    icon: MessageSquare,
    description: "Create intelligent conversational systems that understand context, emotion, and intent at scale.",
    teams: 5,
    maxTeams: 7,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    name: "AI Agents & Tools",
    icon: Brain,
    description: "Design autonomous AI agents that can reason, plan, and execute complex tasks with human oversight.",
    teams: 2,
    maxTeams: 7,
    color: "from-indigo-500 to-blue-600",
  },
];

const projectIdeas = [
  {
    id: 1,
    title: "VoiceDoc — AI Medical Scribe",
    track: "Voice Interfaces",
    description: "Real-time voice-to-clinical-notes using Speechmatics + GPT-5.3",
    leader: { name: "Sarah Chen", avatar: "SC" },
    skills: ["AI/ML", "Backend", "Frontend"],
    members: 2,
    maxMembers: 5,
  },
  {
    id: 2,
    title: "ConvoCommerce",
    track: "Conversational AI",
    description: "Shop entirely through natural conversation — no clicks needed",
    leader: { name: "Omar Hassan", avatar: "OH" },
    skills: ["Full-stack", "NLP", "Design"],
    members: 3,
    maxMembers: 6,
  },
  {
    id: 3,
    title: "AgentOps Dashboard",
    track: "AI Agents & Tools",
    description: "Monitor and debug your AI agents in real-time with conversational controls",
    leader: { name: "Aisha Patel", avatar: "AP" },
    skills: ["Backend", "Frontend", "DevOps"],
    members: 1,
    maxMembers: 4,
  },
];

const Teams = () => {
  return (
    <div className="px-5 pt-12 pb-6 max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold">Teams & Tracks</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose your track, find your crew, build the future</p>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex gap-3">
        <Button variant="gradient" className="flex-1 rounded-xl">
          <Lightbulb className="w-4 h-4" />
          Post an Idea
        </Button>
        <Button variant="glass" className="flex-1 rounded-xl border border-white/10">
          <Users className="w-4 h-4" />
          Create Team
        </Button>
      </motion.div>

      {/* Tracks */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tracks</h2>
        {tracks.map((track, i) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
            className="glass-card-hover p-5 space-y-3 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center`}>
                  <track.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{track.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{track.teams}/{track.maxTeams} teams registered</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{track.description}</p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full gradient-bar transition-all duration-500"
                style={{ width: `${(track.teams / track.maxTeams) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-primary font-medium">{track.maxTeams - track.teams} spots left</p>
          </motion.div>
        ))}
      </div>

      {/* Project Ideas */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Project Ideas</h2>
        {projectIdeas.map((idea, i) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            className="glass-card-hover p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">{idea.title}</h3>
                <Badge variant="skill" className="text-[10px] mt-1">{idea.track}</Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-white">
                  {idea.leader.avatar}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{idea.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {idea.skills.map((s) => (
                  <Badge key={s} variant="glass" className="text-[10px] px-2 py-0">{s}</Badge>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">{idea.members}/{idea.maxMembers} members</span>
            </div>
            <Button variant="glass" size="sm" className="w-full rounded-xl border border-white/10 text-xs">
              Apply to Join
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
