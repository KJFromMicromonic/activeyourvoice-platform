import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
type AuthMode = "signin" | "signup";
type ViewState = "form" | "magic-link-sent" | "signup-confirm";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem("remembered_email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("remember_me") !== "false");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewState>("form");
  const [mode, setMode] = useState<AuthMode>("signin");

  // Redirect authenticated users away from auth page
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/", { replace: true });
      }
    });
    // Also check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

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
