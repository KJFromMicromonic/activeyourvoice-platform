import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Rocket, Calendar, Send, Pin, Sparkles, Trophy, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TARGET_DATE = new Date("2026-02-28T15:00:00+01:00");

const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, TARGET_DATE.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
};

const quickActions = [
  { icon: Users, label: "Find a team", to: "/teams" },
  { icon: Rocket, label: "Browse people", to: "/people" },
  { icon: Calendar, label: "View schedule", to: "/event" },
  { icon: Send, label: "Submit project", to: "/teams" },
];

const announcements = [
  { id: 1, title: "Welcome to Activate Your Voice! 🎙️", body: "We're thrilled to have 100 builders joining us for 24 hours of creation. Get your profile ready!", pinned: true, time: "2h ago" },
  { id: 2, title: "Team registration opens Thursday", body: "Form your team of 3-6 and register before Feb 26. First come, first served — 7 teams max per track.", pinned: false, time: "5h ago" },
  { id: 3, title: "OpenAI GPT-5.3-Codex access confirmed", body: "All participants get free GPT-5.3-Codex access during the event. Details in Event tab.", pinned: false, time: "1d ago" },
];

const badges = [
  { icon: "🌅", name: "Early Bird", earned: true },
  { icon: "✅", name: "Crew Ready", earned: false },
  { icon: "🤝", name: "Team Player", earned: false },
  { icon: "💡", name: "Idea Machine", earned: false },
  { icon: "🧊", name: "Icebreaker", earned: false },
  { icon: "🚀", name: "Shipped It", earned: false },
];

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="glass-card px-3 py-2 min-w-[52px] text-center">
      <span className="text-2xl font-bold gradient-text">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

const Index = () => {
  const countdown = useCountdown();
  const navigate = useNavigate();
  const profileCompletion = 35;

  return (
    <div className="px-5 pt-12 pb-6 max-w-lg mx-auto space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">Builder</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          In 2026, the interface is no longer a screen — it is a conversation.
        </p>
      </motion.div>

      {/* Countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Hackathon starts in</span>
        </div>
        <div className="flex justify-center gap-3">
          <CountdownUnit value={countdown.days} label="Days" />
          <CountdownUnit value={countdown.hours} label="Hrs" />
          <CountdownUnit value={countdown.minutes} label="Min" />
          <CountdownUnit value={countdown.seconds} label="Sec" />
        </div>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Status</h2>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-foreground">Profile completion</span>
            <span className="gradient-text font-semibold">{profileCompletion}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full gradient-bar"
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">You're {profileCompletion}% crew-ready! Complete your profile to stand out ✨</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Solo — no team yet</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {quickActions.map(({ icon: Icon, label, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="pill-button flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Icebreaker Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="glass-card p-5 border-primary/20"
        style={{ borderColor: "hsl(263 84% 58% / 0.2)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Icebreaker Challenge</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Find 3 people who speak a different language than you</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-bar" style={{ width: "33%" }} />
          </div>
          <span className="text-xs text-muted-foreground font-medium">1/3</span>
        </div>
      </motion.div>

      {/* Announcements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Announcements</h2>
        {announcements.map((a) => (
          <div key={a.id} className="glass-card-hover p-4 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug">{a.title}</h3>
              {a.pinned && <Pin className="w-3 h-3 text-primary shrink-0 mt-0.5" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
            <span className="text-[10px] text-muted-foreground/60">{a.time}</span>
          </div>
        ))}
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your Achievements</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`glass-card flex flex-col items-center gap-1.5 p-3 min-w-[72px] shrink-0 transition-opacity ${
                b.earned ? "" : "opacity-30"
              }`}
            >
              <span className="text-xl">{b.icon}</span>
              <span className="text-[10px] text-center text-muted-foreground leading-tight">{b.name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
