import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import MeshBackground from "@/components/MeshBackground";
import Waveform from "@/components/Waveform";

type AuthMode = "signin" | "signup";
type ViewState = "splash" | "form" | "magic-link-sent" | "signup-confirm";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem("remembered_email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("remember_me") !== "false");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewState>("splash");
  const [mode, setMode] = useState<AuthMode>("signin");

  // Persist remember-me preference and email
  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem("remembered_email", email);
      localStorage.setItem("remember_me", "true");
    } else if (!rememberMe) {
      localStorage.removeItem("remembered_email");
      localStorage.setItem("remember_me", "false");
    }
  }, [rememberMe, email]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setLoading(false);
    if (error) toast.error(error.message);
    else setView("signup-confirm");
  };

  const handleMagicLink = async () => {
    if (!email.trim()) { toast.error("Please enter your email first"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setLoading(false);
    if (error) toast.error(error.message);
    else setView("magic-link-sent");
  };

  /* ── Splash Screen ── */
  if (view === "splash") {
    return (
      <div className="fixed inset-0 overflow-hidden bg-background">
        <MeshBackground />
        <div className="relative z-10 flex flex-col min-h-screen px-6 py-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span>Speechmatics</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <span>The AI Collective</span>
          </motion.div>

          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <Waveform />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="text-5xl sm:text-7xl md:text-8xl font-black italic leading-[0.95] tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                background: "linear-gradient(135deg, hsl(263, 84%, 58%), hsl(217, 91%, 60%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 40px hsl(263 84% 58% / 0.3))",
              }}
            >
              Activate
              <br />
              Your Voice
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 space-y-1.5"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Speechmatics × The AI Collective
              </p>
              <p className="text-lg font-bold text-foreground">24h Residency Hackathon</p>
              <p className="text-sm text-foreground/80">The Builders Factory, Paris</p>
              <p className="text-sm font-medium" style={{ color: "hsl(263, 84%, 68%)" }}>
                Feb 28 – March 1, 2026
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-6 text-sm font-bold text-foreground tracking-wide"
            >
              100 builders. 24 hours. 1 house. €100,000 prizes.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-6 text-sm italic text-muted-foreground max-w-md"
            >
              "Architect the future of conversational intelligence and neural dialogue."
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="mt-10"
            >
              <Button
                variant="gradient"
                size="lg"
                className="w-full max-w-md h-14 text-lg font-bold rounded-2xl animate-[subtle-pulse_4s_ease-in-out_infinite]"
                style={{
                  boxShadow: "0 0 25px hsl(263 84% 58% / 0.3), 0 0 50px hsl(217 91% 60% / 0.15)",
                }}
                onClick={() => setView("form")}
              >
                Let's go 🚀
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Confirmation views ── */
  if (view === "magic-link-sent" || view === "signup-confirm") {
    const isMagic = view === "magic-link-sent";
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6 text-center">
          <div className="glass-card p-6 space-y-3">
            <p className="text-lg font-semibold">{isMagic ? "Check your email ✉️" : "Verify your email 📬"}</p>
            <p className="text-sm text-muted-foreground">
              We sent a {isMagic ? "magic link" : "verification link"} to{" "}
              <span className="text-foreground font-medium">{email}</span>.{" "}
              {isMagic ? "Click it to sign in." : "Please confirm to activate your account."}
            </p>
            <Button variant="ghost" size="sm" onClick={() => { setView("form"); if (!isMagic) setMode("signin"); }}>
              ← Back{!isMagic ? " to Sign In" : ""}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Auth Form ── */
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1
            className="text-3xl font-extrabold"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, hsl(263, 84%, 58%), hsl(217, 91%, 60%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Activate Your Voice
          </h1>
          <p className="text-sm text-muted-foreground">Speechmatics × The AI Collective</p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as AuthMode)} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 mt-4">
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted/50 border-border" required />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-muted/50 border-border" required />
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</Label>
              </div>
              <Button variant="gradient" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Button variant="glass" className="w-full" onClick={handleMagicLink} disabled={loading}>
              Send Magic Link 🚀
            </Button>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 mt-4">
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted/50 border-border" required />
              <Input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-muted/50 border-border" required minLength={6} />
              <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-muted/50 border-border" required minLength={6} />
              <Button variant="gradient" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={() => navigate("/onboarding")}>
          Don't log in →
        </Button>
      </motion.div>
    </div>
  );
};

export default Auth;
