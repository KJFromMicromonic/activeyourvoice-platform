import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Rocket, Calendar, Send, Pin, Trophy, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MeshBackground from "@/components/MeshBackground";
import Waveform from "@/components/Waveform";

const TARGET_DATE = new Date("2026-02-28T15:00:00+01:00");

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  background: "linear-gradient(135deg, hsl(263,84%,58%), hsl(217,91%,60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

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

const PROFILE_FIELDS = [
  "first_name", "last_name", "avatar_url", "bio", "company", "role", "linkedin", "dietary", "team_status",
] as const;
const PROFILE_ARRAY_FIELDS = ["skills", "looking_for"] as const;

const calcCompletion = (profile: any) => {
  if (!profile) return 0;
  let filled = 0;
  const total = PROFILE_FIELDS.length + PROFILE_ARRAY_FIELDS.length;
  for (const f of PROFILE_FIELDS) {
    if (profile[f] && String(profile[f]).trim()) filled++;
  }
  for (const f of PROFILE_ARRAY_FIELDS) {
    if (Array.isArray(profile[f]) && profile[f].length > 0) filled++;
  }
  return Math.round((filled / total) * 100);
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
    <div
      className="px-3 py-2 min-w-[56px] text-center rounded-xl"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <span className="text-3xl font-bold text-white">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{label}</span>
  </div>
);

const Index = () => {
  const countdown = useCountdown();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, []);

  const profileCompletion = calcCompletion(profile);
  const displayName = profile?.first_name?.trim() || "Builder";
  const points = profile?.points ?? 0;
  const teamStatusText = profile?.team_status === "Yes"
    ? "In a team"
    : "Solo — no team yet";
  const isInTeam = profile?.team_status === "Yes";
  const daysUntil = Math.max(0, Math.ceil((TARGET_DATE.getTime() - Date.now()) / 86400000));
  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 px-5 pt-12 pb-28 max-w-lg mx-auto space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -top-2 left-0 right-0 opacity-10">
            <Waveform subtle />
          </div>
          <h1 className="text-2xl font-bold relative z-10">
            Welcome back, <span className="text-3xl" style={titleStyle}>{displayName}</span> 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1 relative z-10">
            {daysUntil} days until we build the future
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-5 glow-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-medium">Hackathon starts in</span>
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
          style={{ borderColor: "rgba(139, 92, 246, 0.15)" }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Your Status</h2>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground">Profile completion</span>
              <span className="gradient-text font-bold text-base">{profileCompletion}%</span>
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
              <div className={`w-2 h-2 rounded-full ${isInTeam ? "bg-green-500" : "bg-amber-500 pulse-amber"}`} />
              <span className="text-muted-foreground">{teamStatusText}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="gradient-text font-bold" style={{ textShadow: "0 0 12px hsl(263 84% 58% / 0.4)" }}>{points} pts</span>
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
                className="pill-button flex items-center gap-2 whitespace-nowrap shrink-0 hover:border-primary/30 active:scale-95 transition-all"
              >
                <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </span>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Announcements</h2>
          {announcements.map((a) => (
            <div key={a.id} className="glass-card-hover p-4 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug">{a.title}</h3>
                {a.pinned && <Pin className="w-3 h-3 text-primary shrink-0 mt-0.5" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
              <span className="text-[10px] text-primary/40">{a.time}</span>
            </div>
          ))}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Your Achievements — <span className="text-primary">{earnedCount}/{badges.length}</span> earned
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {badges.map((b) => (
              <div
                key={b.name}
                className={`glass-card flex flex-col items-center gap-1.5 p-3 min-w-[72px] shrink-0 relative ${
                  b.earned ? "glow-ring" : ""
                }`}
              >
                <span className={`text-xl ${b.earned ? "" : "opacity-40 blur-[1px]"}`}>{b.icon}</span>
                <span className={`text-[10px] text-center leading-tight ${b.earned ? "text-foreground" : "text-muted-foreground/50"}`}>{b.name}</span>
                {!b.earned && (
                  <div className="absolute inset-0 rounded-2xl backdrop-blur-[1px] bg-background/30" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
