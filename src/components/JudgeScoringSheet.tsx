import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ExternalLink, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CRITERIA, calcTotal, type ScoreKey, type ScoreRow } from "@/lib/scoring";

const titleStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', sans-serif",
  background: "linear-gradient(135deg, hsl(263,84%,58%), hsl(217,91%,60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

interface ProjectInfo {
  id: string;
  title: string;
  tagline: string;
  track: string;
  team_name: string;
  demo_url: string | null;
  repo_url: string | null;
}

interface ExistingScore extends ScoreRow {
  notes: string | null;
}

interface JudgeScoringSheetProps {
  project: ProjectInfo;
  existingScore?: ExistingScore | null;
  onScored: () => void;
  children: React.ReactNode;
}

const JudgeScoringSheet = ({ project, existingScore, onScored, children }: JudgeScoringSheetProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const initScores = (): Record<ScoreKey, number> => {
    const defaults: Record<ScoreKey, number> = {
      conversation_ux: 10, task_autonomy: 8, memory_adaptivity: 10,
      real_world_impact: 8, technical_depth: 5, partner_utilisation: 5, product_story: 5,
    };
    if (existingScore) {
      for (const c of CRITERIA) {
        if (existingScore[c.key] != null) defaults[c.key] = existingScore[c.key] as number;
      }
    }
    return defaults;
  };

  const [scores, setScores] = useState<Record<ScoreKey, number>>(initScores);
  const [notes, setNotes] = useState(existingScore?.notes || "");

  useEffect(() => {
    if (open) {
      setScores(initScores());
      setNotes(existingScore?.notes || "");
    }
  }, [open, existingScore]);

  const total = calcTotal(scores as ScoreRow);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); setSaving(false); return; }

      const { error } = await supabase.from("judge_scores").upsert({
        judge_id: user.id,
        project_id: project.id,
        ...scores,
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "judge_id,project_id" });

      if (error) {
        toast.error("Failed to save score");
        console.error(error);
      } else {
        toast.success(`Score saved: ${total}/100`);
        onScored();
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-[90vh] border-t border-primary/20"
        style={{
          background: "rgba(var(--glass-bg), 0.02)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-border/30">
            <div className="flex items-start justify-between gap-3 max-w-2xl mx-auto">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold uppercase tracking-wide truncate" style={titleStyle}>{project.title}</h2>
                <p className="text-xs text-muted-foreground truncate">{project.team_name}</p>
                <div className="flex gap-2 mt-1">
                  {project.demo_url && (
                    <button onClick={() => window.open(project.demo_url!, "_blank", "noopener")} className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Demo
                    </button>
                  )}
                  {project.repo_url && (
                    <button onClick={() => window.open(project.repo_url!, "_blank", "noopener")} className="text-[10px] text-primary flex items-center gap-1 hover:underline">
                      <Github className="w-3 h-3" /> Repo
                    </button>
                  )}
                </div>
              </div>
              <div className="text-center shrink-0">
                <p className="text-3xl font-black gradient-text">{total}</p>
                <p className="text-[10px] text-muted-foreground">/100</p>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <div className="max-w-2xl mx-auto space-y-5 pt-4">
              {CRITERIA.map((c) => (
                <div key={c.key} className="glass-card p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{c.label}</h3>
                      <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{c.hint}</p>
                    </div>
                    <span className="text-lg font-bold gradient-text shrink-0">{scores[c.key]}<span className="text-xs text-muted-foreground font-normal">/{c.max}</span></span>
                  </div>
                  <Slider
                    min={0}
                    max={c.max}
                    step={1}
                    value={[scores[c.key]]}
                    onValueChange={([v]) => setScores((prev) => ({ ...prev, [c.key]: v }))}
                    className="w-full"
                  />
                </div>
              ))}

              {/* Notes */}
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-sm font-semibold">Notes (optional)</h3>
                <Textarea
                  placeholder="Strengths, improvements, overall impression..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass-input min-h-[80px] resize-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="px-5 pb-6 pt-2 border-t border-border/30">
            <div className="max-w-2xl mx-auto">
              <Button
                variant="gradient"
                className="w-full rounded-xl h-12"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Saving..." : `Submit Score (${total}/100)`}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default JudgeScoringSheet;
