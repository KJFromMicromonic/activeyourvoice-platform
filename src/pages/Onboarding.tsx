import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MeshBackground from "@/components/MeshBackground";
import Waveform from "@/components/Waveform";

const SKILLS = ["Frontend", "Backend", "Full-stack", "AI/ML", "Design", "Product", "Data Science", "DevOps", "Business/Strategy", "Voice/NLP", "Other"];
const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Allergies", "No"];
const MEAT_OPTIONS = ["Chicken", "Beef", "Fish", "Any meats"];
const YES_NO = ["Yes", "No"];
const LOOKING_FOR = ["A team", "A co-founder", "A job/new opportunity", "Networking", "Just here to build and have fun"];
const TEAM_OPTIONS = ["Yes", "No", "Not yet"];


const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const titleStyle = {
  fontFamily: "'Playfair Display', serif",
  background: "linear-gradient(135deg, hsl(263, 84%, 58%), hsl(217, 91%, 60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  filter: "drop-shadow(0 0 30px hsl(263 84% 58% / 0.2))",
} as const;

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [linkedin, setLinkedin] = useState("");
  const [dietary, setDietary] = useState("");
  const [allergiesDetail, setAllergiesDetail] = useState("");
  const [meatPreference, setMeatPreference] = useState("");
  const [drinksBeer, setDrinksBeer] = useState("");
  const [stayingOvernight, setStayingOvernight] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [teamStatus, setTeamStatus] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [expectations, setExpectations] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showPoints, setShowPoints] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goBack = () => { setDirection(-1); setStep((s) => s - 1); };

  const canProceed = () => {
    switch (step) {
      case 1: return firstName.trim() && lastName.trim();
      case 2: return skills.length > 0;
      case 3: return !!dietary && !!drinksBeer && !!stayingOvernight;
      case 4: return lookingFor.length > 0 && teamStatus;
      default: return true;
    }
  };

  const toggleArray = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Unauthenticated user (via "Don't log in") — skip DB save gracefully
        setSaving(false);
        return;
      }

      let avatar_url: string | null = null;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
          avatar_url = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("profiles").update({
        first_name: firstName,
        last_name: lastName,
        avatar_url,
        skills,
        linkedin: linkedin || null,
        dietary: dietary || null,
        allergies_detail: allergiesDetail || null,
        meat_preference: meatPreference || null,
        drinks_beer: drinksBeer || null,
        staying_overnight: stayingOvernight || null,
        looking_for: lookingFor,
        team_status: teamStatus || null,
        bio: bio || null,
        company: company || null,
        role: role || null,
        expectations: expectations || null,
        feedback: feedback || null,
        onboarding_completed: true,
        points: 50,
      }).eq("user_id", user.id);

      if (error) {
        toast.error("Failed to save profile");
        console.error(error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const finish = () => navigate("/");

  const handleNext = async () => {
    if (step === 5) {
      await saveProfile();
      goNext();
      setTimeout(() => setShowPoints(true), 500);
    } else {
      goNext();
    }
  };

  const handleSkip = async () => {
    await saveProfile();
    goNext();
    setTimeout(() => setShowPoints(true), 500);
  };

  const renderPills = (options: string[], selected: string[], setter: (v: string[]) => void) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggleArray(selected, opt, setter)}
          className={selected.includes(opt) ? "pill-button-active" : "pill-button"}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const isStepScreen = step >= 1 && step <= 5;

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Persistent background — never re-renders between steps */}
      {(isStepScreen || step === 0 || step === 6) && <MeshBackground />}

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Persistent waveform + progress for steps 1-5 */}
        {isStepScreen && (
          <div className="px-5 pt-4 space-y-3">
            {/* Back button top-left */}
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {/* Waveform — subtle, persistent */}
            <div className="flex justify-start">
              <Waveform subtle />
            </div>

            {/* Progress bar */}
            <div>
              <Progress value={(step / 5) * 100} className="h-2 bg-muted/30" />
              <p className="text-xs text-muted-foreground mt-1 text-right">{step}/5</p>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className={`flex-1 flex flex-col ${isStepScreen ? "pt-4" : "items-center justify-center"} px-5 pb-4 overflow-y-auto`}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-full max-w-md ${isStepScreen ? "" : "mx-auto"}`}
            >
              {/* Screen 0 — Welcome Splash */}
              {step === 0 && (
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 rounded-full gradient-primary blur-3xl opacity-30 scale-150 animate-pulse" />
                    <h1
                      className="relative text-5xl sm:text-6xl font-black italic leading-[0.95] tracking-tight"
                      style={titleStyle}
                    >
                      Activate
                      <br />
                      Your Voice
                    </h1>
                  </div>
                  <Waveform />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Speechmatics × The AI Collective</p>
                    <p className="text-sm font-medium">24h Residency Hackathon</p>
                    <p className="text-sm text-muted-foreground">The Builders Factory, Paris</p>
                    <p className="text-sm text-muted-foreground">Feb 28 – March 1, 2026</p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    "In 2026, the interface is no longer a screen — it is a conversation."
                  </p>
                  <Button
                    variant="gradient"
                    size="lg"
                    className="mt-4 w-full text-base h-14 rounded-2xl animate-[subtle-pulse_4s_ease-in-out_infinite]"
                    style={{ boxShadow: "0 0 25px hsl(263 84% 58% / 0.3), 0 0 50px hsl(217 91% 60% / 0.15)" }}
                    onClick={goNext}
                  >
                    Let's go 🚀
                  </Button>
                </div>
              )}

              {/* Step 1 — Name + Photo */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black italic leading-tight" style={titleStyle}>
                      First, who are you? ⚡
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">Let's put a face to the name</p>
                  </div>
                  {/* Gradient divider */}
                  <div className="gradient-primary h-px w-16 rounded-full" />
                  <div className="flex justify-center">
                    <div
                      className="relative w-[120px] h-[120px] rounded-full bg-muted/30 flex items-center justify-center cursor-pointer overflow-hidden animate-[subtle-pulse_4s_ease-in-out_infinite]"
                      style={{ boxShadow: "0 0 0 3px hsl(263 84% 58% / 0.4), 0 0 20px hsl(263 84% 58% / 0.25), 0 0 40px hsl(217 91% 60% / 0.15)" }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-10 h-10 text-muted-foreground" />
                      )}
                      <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-xs text-primary-foreground font-bold">+</span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Input placeholder="First name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="glass-input" />
                    <Input placeholder="Last name *" value={lastName} onChange={(e) => setLastName(e.target.value)} className="glass-input" />
                  </div>
                </div>
              )}

              {/* Step 2 — Skills + LinkedIn */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black italic leading-tight" style={titleStyle}>
                      What's your superpower? 💡
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">Show the crew what you bring to the table</p>
                  </div>
                  <div className="gradient-primary h-px w-16 rounded-full" />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Skills *</label>
                    {renderPills(SKILLS, skills, setSkills)}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">LinkedIn URL</label>
                    <Input placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="glass-input" />
                  </div>
                </div>
              )}

              {/* Step 3 — Dietary + Logistics */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black italic leading-tight" style={titleStyle}>
                      We want to take care of you 🤗
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">Good food, good vibes — we've got you covered</p>
                  </div>
                  <div className="gradient-primary h-px w-16 rounded-full" />

                  {/* Q1: Dietary restrictions */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Do you have any dietary restrictions? *</label>
                    <div className="flex flex-wrap gap-2">
                      {DIETARY_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setDietary(opt);
                            if (opt !== "Allergies") setAllergiesDetail("");
                            if (opt !== "No") setMeatPreference("");
                          }}
                          className={dietary === opt ? "pill-button-active" : "pill-button"}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q2: Allergy details (conditional) */}
                  {dietary === "Allergies" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">If yes to allergies, please list below.</label>
                      <Input
                        placeholder="e.g. nuts, shellfish, dairy..."
                        value={allergiesDetail}
                        onChange={(e) => setAllergiesDetail(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                  )}

                  {/* Q3: Meat preference (conditional) */}
                  {dietary === "No" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">If not, any preferences?</label>
                      <div className="flex flex-wrap gap-2">
                        {MEAT_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setMeatPreference(opt)}
                            className={meatPreference === opt ? "pill-button-active" : "pill-button"}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Q4: Beer */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Do you drink beer? *</label>
                    <div className="flex gap-2">
                      {YES_NO.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setDrinksBeer(opt)}
                          className={`flex-1 ${drinksBeer === opt ? "pill-button-active" : "pill-button"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q5: Staying overnight */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Are you planning to stay overnight at the Builders Factory? *</label>
                    <div className="flex gap-2">
                      {YES_NO.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setStayingOvernight(opt)}
                          className={`flex-1 ${stayingOvernight === opt ? "pill-button-active" : "pill-button"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-2">
                      No beds provided — but couches and quiet zones available. You may bring equipment for better rest.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4 — Looking for + Team status */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black italic leading-tight" style={titleStyle}>
                      What are you here for? 🎯
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">No wrong answer — we'll help you find your people</p>
                  </div>
                  <div className="gradient-primary h-px w-16 rounded-full" />
                  <div>
                    <label className="text-sm font-medium mb-2 block">I'm looking for... *</label>
                    {renderPills(LOOKING_FOR, lookingFor, setLookingFor)}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Do you already have a team? *</label>
                    <div className="flex gap-2">
                      {TEAM_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setTeamStatus(opt)}
                          className={`flex-1 ${teamStatus === opt ? "pill-button-active" : "pill-button"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 — Bio + Details (skippable) */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black italic leading-tight" style={titleStyle}>
                      Tell the crew about you ✍️
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">Almost there — this helps us make it unforgettable</p>
                  </div>
                  <div className="gradient-primary h-px w-16 rounded-full" />
                  <div>
                    <label className="text-sm font-medium mb-1 block">One-liner bio</label>
                    <Input placeholder="What's your superpower in one line?" maxLength={100} value={bio} onChange={(e) => setBio(e.target.value)} className="glass-input" />
                    <p className="text-[10px] text-muted-foreground text-right mt-0.5">{bio.length}/100</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="glass-input" />
                    <Input placeholder="Role / Title" value={role} onChange={(e) => setRole(e.target.value)} className="glass-input" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">What are you expecting from this weekend?</label>
                    <Textarea maxLength={280} value={expectations} onChange={(e) => setExpectations(e.target.value)} className="glass-input resize-none h-20" />
                    <p className="text-[10px] text-muted-foreground text-right mt-0.5">{expectations.length}/280</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">How can we make your experience even better?</label>
                    <Textarea maxLength={280} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="glass-input resize-none h-20" />
                    <p className="text-[10px] text-muted-foreground text-right mt-0.5">{feedback.length}/280</p>
                  </div>
                </div>
              )}

              {/* Done Screen */}
              {step === 6 && (
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="confetti-container">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="confetti-piece" style={{
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 2}s`,
                          backgroundColor: i % 2 === 0 ? "hsl(263 84% 58%)" : "hsl(217 91% 60%)",
                        }} />
                      ))}
                    </div>
                    <Sparkles className="w-16 h-16 mx-auto text-primary animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-extrabold gradient-text">You're crew-ready! 🎉</h2>
                  {showPoints && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="text-2xl font-bold gradient-text"
                    >
                      +50 points ⚡
                    </motion.div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Welcome to the crew. 100 builders. 24 hours.<br />Let's make something incredible.
                  </p>
                  <Button variant="gradient" size="lg" className="w-full text-base h-14 rounded-2xl" onClick={finish}>
                    Enter the Hub →
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Full-width Next CTA anchored to bottom for steps 1-5 */}
        {isStepScreen && (
          <div className="px-5 pb-8 space-y-2">
            {step === 5 && (
              <button
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={handleSkip}
                disabled={saving}
              >
                Skip for now
              </button>
            )}
            <Button
              variant="gradient"
              className="w-full h-14 text-base font-bold rounded-2xl"
              disabled={!canProceed() || saving}
              onClick={handleNext}
              style={{ boxShadow: "0 0 20px hsl(263 84% 58% / 0.25), 0 0 40px hsl(217 91% 60% / 0.1)" }}
            >
              {saving ? "Saving..." : step === 5 ? "Finish ✨" : "Next"} {!saving && step < 5 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
