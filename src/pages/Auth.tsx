import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

type AuthMode = "signin" | "signup";
type ViewState = "splash" | "form" | "magic-link-sent" | "signup-confirm";

/* ── Animated mesh gradient background ── */
const MeshBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };
    resize();
    window.addEventListener("resize", resize);

    const blobs = [
      { x: 0.3, y: 0.25, r: 0.35, color: [120, 60, 220], speed: 0.0004 },
      { x: 0.7, y: 0.3, r: 0.3, color: [60, 100, 240], speed: 0.0006 },
      { x: 0.5, y: 0.7, r: 0.25, color: [100, 40, 200], speed: 0.0005 },
      { x: 0.2, y: 0.6, r: 0.2, color: [50, 80, 220], speed: 0.0003 },
    ];

    const draw = () => {
      t++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "hsl(240, 25%, 3%)";
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        const cx = (b.x + Math.sin(t * b.speed) * 0.08) * w;
        const cy = (b.y + Math.cos(t * b.speed * 1.3) * 0.06) * h;
        const r = b.r * Math.min(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${b.color.join(",")}, 0.18)`);
        grad.addColorStop(1, `rgba(${b.color.join(",")}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

/* ── Waveform SVG ── */
const Waveform = () => (
  <svg viewBox="0 0 200 30" className="w-full max-w-xs opacity-20" preserveAspectRatio="none">
    {Array.from({ length: 40 }).map((_, i) => {
      const h = 4 + Math.sin(i * 0.5) * 8 + Math.random() * 6;
      return (
        <motion.rect
          key={i}
          x={i * 5}
          y={15 - h / 2}
          width={2.5}
          height={h}
          rx={1.25}
          fill="url(#waveGrad)"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0.3, 1, 0.5, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />
      );
    })}
    <defs>
      <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(263, 84%, 58%)" />
        <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
      </linearGradient>
    </defs>
  </svg>
);

const Auth = () => {
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
          {/* Top logos */}
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

          {/* Hero section */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
            {/* Waveform */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <Waveform />
            </motion.div>

            {/* Title */}
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

            {/* Event details — left aligned */}
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

            {/* Punchy line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-6 text-sm font-bold text-foreground tracking-wide"
            >
              100 builders. 24 hours. 1 house. €100,000 prizes.
            </motion.p>

            {/* Quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-6 text-sm italic text-muted-foreground max-w-md"
            >
              "Architect the future of conversational intelligence and neural dialogue."
            </motion.p>

            {/* CTA */}
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

        <p className="text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>Don't have an account?{" "}<button className="text-primary hover:underline" onClick={() => setMode("signup")}>Sign up</button></>
          ) : (
            <>Already have an account?{" "}<button className="text-primary hover:underline" onClick={() => setMode("signin")}>Sign in</button></>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
