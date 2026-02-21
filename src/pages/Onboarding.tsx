import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const SKILLS = ["Frontend", "Backend", "Full-stack", "AI/ML", "Design", "Product", "Data Science", "DevOps", "Business/Strategy", "Voice/NLP", "Other"];
const LANGUAGES = ["English", "French", "Spanish", "German", "Arabic", "Mandarin", "Portuguese", "Italian", "Japanese", "Korean", "Hindi", "Russian", "Other"];
const LOOKING_FOR = ["A team", "A co-founder", "A job/new opportunity", "Networking", "Just here to build and have fun"];
const TEAM_OPTIONS = ["Yes", "No", "Not yet"];
const DIETARY = ["None", "Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free", "Other"];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [linkedin, setLinkedin] = useState("");
  const [dietary, setDietary] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [teamStatus, setTeamStatus] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [expectations, setExpectations] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showPoints, setShowPoints] = useState(false);

  const goNext = () => { setDirection(1); setStep((s) => s + 1); };
  const goBack = () => { setDirection(-1); setStep((s) => s - 1); };

  const canProceed = () => {
    switch (step) {
      case 1: return firstName.trim() && lastName.trim();
      case 2: return skills.length > 0;
      case 3: return dietary && languages.length > 0;
      case 4: return lookingFor.length > 0 && teamStatus;
      default: return true;
    }
  };

  const toggleArray = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const finish = () => {
    localStorage.setItem("onboarding_completed", "true");
    setShowPoints(true);
    setTimeout(() => navigate("/"), 2500);
  };

  const handleNext = () => {
    if (step === 5) { goNext(); setTimeout(() => setShowPoints(true), 500); }
    else goNext();
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar for steps 1-5 */}
      {step >= 1 && step <= 5 && (
        <div className="px-5 pt-4">
          <Progress value={(step / 5) * 100} className="h-2 bg-muted" />
          <p className="text-xs text-muted-foreground mt-1 text-right">{step}/5</p>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-md"
          >
            {/* Screen 0 — Welcome Splash */}
            {step === 0 && (
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-full gradient-primary blur-3xl opacity-30 scale-150 animate-pulse" />
                  <h1 className="relative text-4xl font-extrabold gradient-text leading-tight">
                    Activate Your Voice
                  </h1>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Speechmatics × The AI Collective</p>
                  <p className="text-sm font-medium">24h Residency Hackathon</p>
                  <p className="text-sm text-muted-foreground">The Builders Factory, Paris</p>
                  <p className="text-sm text-muted-foreground">Feb 28 – March 1, 2026</p>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  "In 2026, the interface is no longer a screen — it is a conversation."
                </p>
                <Button variant="gradient" size="lg" className="mt-4 w-full text-base" onClick={goNext}>
                  Let's go 🚀
                </Button>
              </div>
            )}

            {/* Step 1 — Name + Photo */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">First, who are you? ⚡</h2>
                  <p className="text-sm text-muted-foreground mt-1">Let's put a face to the name</p>
                </div>
                <div className="flex justify-center">
                  <div className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center cursor-pointer glow-ring">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-xs text-primary-foreground">+</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Input placeholder="First name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-muted/50 border-border" />
                  <Input placeholder="Last name *" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-muted/50 border-border" />
                </div>
              </div>
            )}

            {/* Step 2 — Skills + LinkedIn */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">What's your superpower? 💡</h2>
                  <p className="text-sm text-muted-foreground mt-1">Show the crew what you bring to the table</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Skills *</label>
                  {renderPills(SKILLS, skills, setSkills)}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">LinkedIn URL</label>
                  <Input placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="bg-muted/50 border-border" />
                </div>
              </div>
            )}

            {/* Step 3 — Dietary + Languages */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">We want to take care of you 🤗</h2>
                  <p className="text-sm text-muted-foreground mt-1">Good food, good vibes — we've got you covered</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Dietary needs *</label>
                  <Select value={dietary} onValueChange={setDietary}>
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue placeholder="Select dietary needs" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIETARY.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Spoken languages *</label>
                  {renderPills(LANGUAGES, languages, setLanguages)}
                </div>
              </div>
            )}

            {/* Step 4 — Looking for + Team status */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">What are you here for? 🎯</h2>
                  <p className="text-sm text-muted-foreground mt-1">No wrong answer — we'll help you find your people</p>
                </div>
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
                  <h2 className="text-2xl font-bold">Tell the crew about you ✍️</h2>
                  <p className="text-sm text-muted-foreground mt-1">Almost there — this helps us make it unforgettable</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">One-liner bio</label>
                  <Input placeholder="What's your superpower in one line?" maxLength={100} value={bio} onChange={(e) => setBio(e.target.value)} className="bg-muted/50 border-border" />
                  <p className="text-[10px] text-muted-foreground text-right mt-0.5">{bio.length}/100</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-muted/50 border-border" />
                  <Input placeholder="Role / Title" value={role} onChange={(e) => setRole(e.target.value)} className="bg-muted/50 border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">What are you expecting from this weekend?</label>
                  <Textarea maxLength={280} value={expectations} onChange={(e) => setExpectations(e.target.value)} className="bg-muted/50 border-border resize-none h-20" />
                  <p className="text-[10px] text-muted-foreground text-right mt-0.5">{expectations.length}/280</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">How can we make your experience even better?</label>
                  <Textarea maxLength={280} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="bg-muted/50 border-border resize-none h-20" />
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
                <Button variant="gradient" size="lg" className="w-full text-base" onClick={finish}>
                  Enter the Hub →
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons for steps 1-5 */}
      {step >= 1 && step <= 5 && (
        <div className="px-5 pb-8 flex gap-3">
          <Button variant="outline" onClick={goBack} className="flex-shrink-0">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex-1 flex gap-2">
            {step === 5 && (
              <Button variant="ghost" className="flex-1 text-muted-foreground text-sm" onClick={() => { goNext(); setTimeout(() => setShowPoints(true), 500); }}>
                Skip for now
              </Button>
            )}
            <Button
              variant="gradient"
              className="flex-1"
              disabled={!canProceed()}
              onClick={handleNext}
            >
              {step === 5 ? "Finish" : "Next"} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
