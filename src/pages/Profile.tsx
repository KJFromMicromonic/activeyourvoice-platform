import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Check, ChevronRight, Trophy, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const profileSteps = [
  { label: "Upload photo", done: true },
  { label: "Add your name", done: true },
  { label: "Write a bio", done: false },
  { label: "Select skills", done: true },
  { label: "Add company & role", done: false },
  { label: "LinkedIn URL", done: false },
  { label: "Dietary needs", done: false },
  { label: "What you're looking for", done: true },
];

const completedCount = profileSteps.filter((s) => s.done).length;
const completionPct = Math.round((completedCount / profileSteps.length) * 100);

const earnedBadges = [
  { icon: "🌅", name: "Early Bird", desc: "Among first 20 to register", date: "Feb 15" },
];

const lockedBadges = [
  { icon: "✅", name: "Crew Ready" },
  { icon: "🤝", name: "Team Player" },
  { icon: "💡", name: "Idea Machine" },
  { icon: "🧊", name: "Icebreaker" },
  { icon: "🚀", name: "Shipped It" },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "badges" | "team">("profile");

  return (
    <div className="px-5 pt-12 pb-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center gap-3"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-white glow-avatar">
            B
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        <div>
          <h1 className="text-xl font-bold">Builder</h1>
          <p className="text-sm text-muted-foreground">builder@email.com</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold gradient-text">60 points</span>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-5 space-y-3"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold">Profile Completion</h2>
          <span className="gradient-text font-bold text-sm">{completionPct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full gradient-bar"
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          You're {completionPct}% crew-ready! Add your bio to complete your profile ✨
        </p>
        <div className="space-y-2 pt-1">
          {profileSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${step.done ? "gradient-primary" : "bg-muted"}`}>
                {step.done && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={step.done ? "text-muted-foreground line-through" : "text-foreground"}>{step.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section Tabs */}
      <div className="flex gap-2">
        {([
          { key: "profile", label: "My Info", icon: null },
          { key: "badges", label: "Badges", icon: null },
          { key: "team", label: "My Team", icon: null },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={activeTab === key ? "pill-button-active flex-1" : "pill-button flex-1"}
          >
            {label}
          </button>
        ))}
      </div>

      {/* My Info */}
      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {[
            { label: "Bio", value: "Not set yet", placeholder: "What's your superpower in one line?" },
            { label: "Skills", value: "Full-stack, AI/ML, Frontend" },
            { label: "Company", value: "Not set yet" },
            { label: "Role", value: "Not set yet" },
            { label: "LinkedIn", value: "Not set yet" },
            { label: "Languages", value: "English, French" },
            { label: "Dietary Needs", value: "Not set yet" },
            { label: "Looking for", value: "A team, Networking" },
          ].map((field, i) => (
            <div key={i} className="glass-card-hover p-4 flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className={`text-sm ${field.value === "Not set yet" ? "text-muted-foreground/50 italic" : "text-foreground"}`}>
                  {field.value}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </motion.div>
      )}

      {/* Badges */}
      {activeTab === "badges" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Earned</h3>
            {earnedBadges.map((b, i) => (
              <div key={i} className="glass-card p-4 flex items-center gap-3 glow-ring" style={{ boxShadow: "0 0 15px hsl(263 84% 58% / 0.15)" }}>
                <span className="text-2xl">{b.icon}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">{b.name}</h4>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{b.date}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Locked</h3>
            <div className="grid grid-cols-3 gap-2">
              {lockedBadges.map((b, i) => (
                <div key={i} className="glass-card p-3 flex flex-col items-center gap-1.5 opacity-30">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-[10px] text-center text-muted-foreground">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Team */}
      {activeTab === "team" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Rocket className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">You're flying solo</h3>
            <p className="text-sm text-muted-foreground mt-1">Find your crew and build something amazing together!</p>
          </div>
          <Button variant="gradient" className="rounded-xl">
            <Users className="w-4 h-4" />
            Find a Team
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
