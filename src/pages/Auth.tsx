import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 text-center"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold gradient-text">Activate Your Voice</h1>
          <p className="text-sm text-muted-foreground">Speechmatics × The AI Collective</p>
        </div>

        {sent ? (
          <div className="glass-card p-6 space-y-3">
            <p className="text-lg font-semibold">Check your email ✉️</p>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <span className="text-foreground font-medium">{email}</span>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/50 border-border text-center"
              required
            />
            <Button variant="gradient" size="lg" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Magic Link 🚀"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
