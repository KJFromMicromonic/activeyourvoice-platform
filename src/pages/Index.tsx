import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, Rocket, Calendar, Send, Pin, Trophy, Clock, MessageSquare, FolderOpen, UserPlus, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import MeshBackground from "@/components/MeshBackground";
import Waveform from "@/components/Waveform";
import { findCurrentEvent, findNextEvent } from "@/lib/schedule-utils";
import { computeBadges, type EarnedBadge } from "@/lib/badges";

const TARGET_DATE = new Date("2026-02-28T15:00:00+01:00");
const AURA_URL = "https://concierge.activateyourvoice.tech";

const titleStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', sans-serif",
  background: "linear-gradient(135deg, hsl(263,84%,58%), hsl(217,91%,60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const useCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, TARGET_DATE.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff % 86400000 / 3600000),
        minutes: Math.floor(diff % 3600000 / 60000),
        seconds: Math.floor(diff % 60000 / 1000)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
};

const PROFILE_FIELDS = [
"first_name", "last_name", "avatar_url", "bio", "company", "role", "linkedin", "dietary", "team_status"] as
const;
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
  return Math.round(filled / total * 100);
};

const quickActions: { icon: React.ElementType; label: string; to?: string; href?: string; disabled?: boolean }[] = [
{ icon: MessageSquare, label: "Talk to AURA", href: AURA_URL, disabled: true },
{ icon: Users, label: "Find a team", to: "/teams" },
{ icon: Rocket, label: "Browse people", to: "/people" },
{ icon: Calendar, label: "View schedule", to: "/event" },
{ icon: Send, label: "Submit project", to: "/projects" }];



const CountdownUnit = ({ value, label }: {value: number;label: string;}) =>
<div className="flex flex-col items-center flex-1">
    <div className="px-3 py-2 md:py-4 w-full text-center rounded-xl glass-card">
      <span className="text-3xl md:text-5xl lg:text-7xl font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
    </div>
    <span className="text-[10px] md:text-xs text-muted-foreground mt-1.5 uppercase tracking-wider">{label}</span>
  </div>;

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  team_created: { icon: Rocket, color: "text-purple-400 bg-purple-500/10" },
  member_joined: { icon: UserPlus, color: "text-green-400 bg-green-500/10" },
  project_submitted: { icon: FolderOpen, color: "text-blue-400 bg-blue-500/10" },
  announcement_posted: { icon: Megaphone, color: "text-amber-400 bg-amber-500/10" },
};

interface ActivityItem {
  id: string;
  type: string;
  actor_name: string;
  detail: string | null;
  created_at: string;
}

const Index = () => {
  const countdown = useCountdown();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [now, setNow] = useState(new Date());
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) setProfile(data);
      const earned = await computeBadges(user.id);
      setBadges(earned);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (data) setAnnouncements(data);
    };
    fetchAnnouncements();
  }, []);

  // Schedule reminders timer
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Activity feed
  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("activity_feed")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setActivities(data);
    };
    fetchActivities();

    // Realtime subscription
    const channel = supabase
      .channel("activity-feed-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_feed" },
        (payload) => {
          setActivities((prev) => [payload.new as ActivityItem, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentEvent = findCurrentEvent(now);
  const nextEvent = !currentEvent ? findNextEvent(now) : null;
  const showScheduleCard = currentEvent || (nextEvent && nextEvent.startsIn <= 2 * 60 * 60 * 1000);

  const profileCompletion = calcCompletion(profile);
  const displayName = profile?.first_name?.trim() || "Builder";
  const points = profile?.points ?? 0;
  const teamStatusText = profile?.team_status === "Yes" ?
  "In a team" :
  "Solo \u2014 no team yet";
  const isInTeam = profile?.team_status === "Yes";
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 px-5 pt-12 pb-28 md:pb-12 max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative">

          <div className="absolute -top-2 left-0 right-0 opacity-10">
            <Waveform subtle />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold relative z-10">
            Welcome back, <span className="text-3xl md:text-4xl" style={titleStyle}>{displayName}</span>
          </h1>
        </motion.div>

        {/* Countdown — always full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-5 md:p-8 glow-border">

          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-medium">Hackathon starts in</span>
          </div>
          <div className="flex gap-3 md:gap-5">
            <CountdownUnit value={countdown.days} label="Days" />
            <CountdownUnit value={countdown.hours} label="Hrs" />
            <CountdownUnit value={countdown.minutes} label="Min" />
            <CountdownUnit value={countdown.seconds} label="Sec" />
          </div>
        </motion.div>

        {/* Happening Now / Coming Up */}
        {showScheduleCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass-card p-4 cursor-pointer hover:scale-[1.01] transition-transform flex items-center"
            onClick={() => navigate("/event")}
          >
            {currentEvent ? (
              <div className="flex items-center gap-3 w-full">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-400">Happening Now</p>
                  <p className="text-sm font-medium truncate">{currentEvent.event.event}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ) : nextEvent ? (
              <div className="flex items-center gap-3 w-full">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Coming Up</p>
                  <p className="text-sm font-medium truncate">{nextEvent.event.event}</p>
                  <p className="text-[10px] text-muted-foreground">
                    in {Math.round(nextEvent.startsIn / 60000)} minutes
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-5 space-y-4"
          style={{ borderColor: "rgba(139, 92, 246, 0.15)" }}>

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
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }} />

            </div>
            <p className="text-xs text-muted-foreground mt-2">You're {profileCompletion}% crew-ready! Complete your profile to stand out</p>
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
          transition={{ duration: 0.5, delay: 0.3 }}>

          <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-2 -mx-1 px-1 scrollbar-hide">
            {quickActions.map(({ icon: Icon, label, to, href, disabled }) =>
            <button
              key={label}
              disabled={disabled}
              onClick={() => !disabled && (href ? window.open(href, "_blank", "noopener") : navigate(to!))}
              className={`pill-button flex items-center gap-2 whitespace-nowrap shrink-0 transition-all ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-primary/30 active:scale-95"}`}>

                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${disabled ? "bg-muted" : "gradient-primary"}`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </span>
                {label}{disabled ? " (Soon)" : ""}
              </button>
            )}
          </div>
        </motion.div>

        {/* Announcements + Activity Feed — side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3">

          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Announcements</h2>
          {announcements.map((a) =>
          <div key={a.id} className="glass-card-hover p-4 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug">{a.title}</h3>
                {a.pinned && <Pin className="w-3 h-3 text-primary shrink-0 mt-0.5" />}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
              <span className="text-[10px] text-primary/40">
                {a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : ""}
              </span>
            </div>
          )}
        </motion.div>

        {/* Activity Feed */}
        {activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            className="space-y-3">

            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Live Activity</h2>
            <AnimatePresence initial={false}>
              {activities.slice(0, 10).map((a) => {
                const config = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.team_created;
                const IconComp = config.icon;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card p-3 flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{a.actor_name}</span>
                        {a.detail && <span className="text-muted-foreground"> {a.detail}</span>}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
        </div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}>

          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Your Achievements &mdash; <span className="text-primary">{earnedCount}/{badges.length}</span> earned
          </h2>

          {/* Mobile: horizontal scroll; Desktop: full-width grid */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 md:hidden">
            {badges.map((b) =>
            <div
              key={b.name}
              className={`glass-card flex flex-col items-center gap-1.5 p-3 min-w-[72px] shrink-0 relative ${
              b.earned ? "glow-ring" : ""}`
              }>
                <span className={`text-xl ${b.earned ? "" : "opacity-40 blur-[1px]"}`}>{b.icon}</span>
                <span className={`text-[10px] text-center leading-tight ${b.earned ? "text-foreground" : "text-muted-foreground/50"}`}>{b.name}</span>
                {!b.earned &&
              <div className="absolute inset-0 rounded-2xl backdrop-blur-[1px] bg-background/30" />
              }
              </div>
            )}
          </div>

          <div className="hidden md:grid grid-cols-6 gap-4">
            {badges.map((b) =>
            <div
              key={b.name}
              className={`glass-card flex flex-col items-center gap-2 p-5 relative ${
              b.earned ? "glow-ring" : ""}`
              }>
                <span className={`text-4xl ${b.earned ? "" : "opacity-40 blur-[1px]"}`}>{b.icon}</span>
                <span className={`text-xs text-center leading-snug font-medium ${b.earned ? "text-foreground" : "text-muted-foreground/50"}`}>{b.name}</span>
                {!b.earned &&
              <div className="absolute inset-0 rounded-2xl backdrop-blur-[1px] bg-background/30" />
              }
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>);

};

export default Index;
