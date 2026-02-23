import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Check, ChevronRight, Trophy, Users, Rocket, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { computeBadges, type EarnedBadge } from "@/lib/badges";

const PROFILE_STEPS = [
  { label: "Upload photo", field: "avatar_url" },
  { label: "Add your name", field: "first_name" },
  { label: "Write a bio", field: "bio" },
  { label: "Select skills", field: "skills" },
  { label: "Add company & role", field: "company" },
  { label: "LinkedIn URL", field: "linkedin" },
  { label: "Dietary needs", field: "dietary" },
  { label: "What you're looking for", field: "looking_for" },
] as const;

const isFieldFilled = (profile: any, field: string) => {
  const val = profile?.[field];
  if (Array.isArray(val)) return val.length > 0;
  return !!val && String(val).trim() !== "";
};

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "badges" | "team">("profile");
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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

  const steps = PROFILE_STEPS.map((s) => ({
    label: s.label,
    done: isFieldFilled(profile, s.field),
  }));
  const completedCount = steps.filter((s) => s.done).length;
  const completionPct = Math.round((completedCount / steps.length) * 100);

  const displayName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Builder" : "Builder";
  const initials = profile ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase() || "B" : "B";
  const points = profile?.points ?? 0;

  const infoFields = [
    { label: "Bio", value: profile?.bio },
    { label: "Skills", value: Array.isArray(profile?.skills) && profile.skills.length > 0 ? profile.skills.join(", ") : null },
    { label: "Company", value: profile?.company },
    { label: "Role", value: profile?.role },
    { label: "LinkedIn", value: profile?.linkedin },
    { label: "Dietary Needs", value: profile?.dietary },
    { label: "Looking for", value: Array.isArray(profile?.looking_for) && profile.looking_for.length > 0 ? profile.looking_for.join(", ") : null },
  ];

  return (
    <div className="px-5 pt-12 pb-6 max-w-lg md:max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center gap-3"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-white glow-avatar overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>
        <div>
          <h1 className="text-xl font-bold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{profile?.role || ""}{profile?.role && profile?.company ? " at " : ""}{profile?.company || ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold gradient-text">{points} points</span>
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
          You're {completionPct}% crew-ready! {completionPct < 100 ? "Complete your profile to stand out ✨" : "Looking great! 🎉"}
        </p>
        <div className="space-y-2 pt-1">
          {steps.map((step, i) => (
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
          {infoFields.map((field, i) => (
            <div key={i} className="glass-card-hover p-4 flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className={`text-sm ${!field.value ? "text-muted-foreground/50 italic" : "text-foreground"}`}>
                  {field.value || "Not set yet"}
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
          {badges.filter((b) => b.earned).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Earned</h3>
              {badges.filter((b) => b.earned).map((b) => (
                <div key={b.id} className="glass-card p-4 flex items-center gap-3 glow-ring" style={{ boxShadow: "0 0 15px hsl(263 84% 58% / 0.15)" }}>
                  <span className="text-2xl">{b.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">{b.name}</h4>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                  {b.earnedDate && <span className="text-[10px] text-muted-foreground">{b.earnedDate}</span>}
                  <span className="text-[10px] text-primary font-medium">+{b.points} pts</span>
                </div>
              ))}
            </div>
          )}
          {badges.filter((b) => !b.earned).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Locked</h3>
              <div className="grid grid-cols-3 gap-2">
                {badges.filter((b) => !b.earned).map((b) => (
                  <div key={b.id} className="glass-card p-3 flex flex-col items-center gap-1.5 opacity-30">
                    <span className="text-xl">{b.icon}</span>
                    <span className="text-[10px] text-center text-muted-foreground">{b.name}</span>
                    <span className="text-[9px] text-muted-foreground/50">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Team */}
      {activeTab === "team" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Rocket className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{profile?.team_status === "Yes" ? "You're in a team!" : "You're flying solo"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {profile?.team_status === "Yes" ? "Great — you're ready to build!" : "Find your crew and build something amazing together!"}
            </p>
          </div>
          {profile?.team_status !== "Yes" && (
            <Button variant="gradient" className="rounded-xl">
              <Users className="w-4 h-4" />
              Find a Team
            </Button>
          )}
        </motion.div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>
    </div>
  );
};

export default Profile;
