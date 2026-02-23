import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ExternalLink, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TRACK_MAP, calcSectionTotals, type ScoreRow } from "@/lib/scoring";

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

interface ExistingScore {
  voice_naturalness: number | null;
  voice_turn_taking: number | null;
  voice_persona: number | null;
  voice_multimodal: number | null;
  voice_accessibility: number | null;
  tech_stability: number | null;
  tech_architecture: number | null;
  tech_actions: number | null;
  tech_complexity: number | null;
  tech_autonomy: number | null;
  memory_short_term: number | null;
  memory_long_term: number | null;
  memory_adaptivity: number | null;
  memory_improvement: number | null;
  impact_problem_clarity: number | null;
  impact_feasibility: number | null;
  track_criterion_1: number | null;
  track_criterion_2: number | null;
  presentation_clarity: number | null;
  presentation_qa: number | null;
  notes_strengths: string | null;
  notes_improvements: string | null;
  notes_overall: string | null;
}

interface JudgeScoringSheetProps {
  project: ProjectInfo;
  existingScore?: ExistingScore | null;
  onScored: () => void;
  children: React.ReactNode;
}

type ScoreKey = keyof ScoreRow;

interface CriterionDef {
  key: ScoreKey;
  label: string;
  hint: string;
}

const SECTION_1: CriterionDef[] = [
  { key: "voice_naturalness", label: "Naturalness & Flow", hint: "Very natural, low-latency, fluid and responsive" },
  { key: "voice_turn_taking", label: "Turn-Taking & Recovery", hint: "Gracefully manages interruptions, re-asks, recovers context" },
  { key: "voice_persona", label: "Persona & UX", hint: "Clear, memorable persona, intentional and delightful UX" },
  { key: "voice_multimodal", label: "Multimodal / Environment Awareness", hint: "Deeply integrated with tools/environment, richer conversation" },
  { key: "voice_accessibility", label: "Accessibility & Inclusivity", hint: "Thoughtful design for diverse users (accents, abilities, non-experts)" },
];

const SECTION_2: CriterionDef[] = [
  { key: "tech_stability", label: "Running Code & Stability", hint: "Robust live demo, end-to-end flow works reliably" },
  { key: "tech_architecture", label: "Architecture & Use of Tools", hint: "Well-thought system design, smart and coherent tool use" },
  { key: "tech_actions", label: "Intelligent Actions & Tool Use", hint: "Clear, multi-step actions that matter for the user" },
  { key: "tech_complexity", label: "Technical Complexity", hint: "Tackles complex problems (reasoning, planning, workflows)" },
  { key: "tech_autonomy", label: "Autonomy & Orchestration", hint: "Works towards goals with minimal human steering" },
];

const SECTION_3: CriterionDef[] = [
  { key: "memory_short_term", label: "Short-Term Memory & Context", hint: "Handles complex multi-turn context reliably" },
  { key: "memory_long_term", label: "Long-Term Memory Strategy", hint: "Strong design with structured storage and recall" },
  { key: "memory_adaptivity", label: "Adaptivity & Personalization", hint: "Clearly changes behavior based on user/history/preferences" },
  { key: "memory_improvement", label: "Continuous Improvement Loop", hint: "Explicit loop for learning or improving over time" },
];

const SECTION_4_COMMON: CriterionDef[] = [
  { key: "impact_problem_clarity", label: "Problem Clarity & User Insight", hint: "Sharp insight into user and pain point" },
  { key: "impact_feasibility", label: "Impact & Feasibility", hint: "Obvious high-value use case, believable path to deployment" },
];

const SECTION_5: CriterionDef[] = [
  { key: "presentation_clarity", label: "Clarity of Story & Demo Flow", hint: "Sharp narrative: problem, solution, why voice, why now" },
  { key: "presentation_qa", label: "Team Insight & Q&A", hint: "Deep clarity on technical/product decisions, smart next steps" },
];

const ScoreSlider = ({
  criterion,
  value,
  onChange,
}: {
  criterion: CriterionDef;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-2 py-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{criterion.label}</span>
      <span className="text-sm font-bold gradient-text min-w-[32px] text-right">{value}/5</span>
    </div>
    <Slider
      min={1}
      max={5}
      step={1}
      value={[value]}
      onValueChange={([v]) => onChange(v)}
      className="w-full"
    />
    <p className="text-[10px] text-muted-foreground leading-snug">{criterion.hint}</p>
  </div>
);

const JudgeScoringSheet = ({ project, existingScore, onScored, children }: JudgeScoringSheetProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["s1"]);

  const initScores = (): Record<ScoreKey, number> => {
    const defaults: Record<ScoreKey, number> = {
      voice_naturalness: 3, voice_turn_taking: 3, voice_persona: 3, voice_multimodal: 3, voice_accessibility: 3,
      tech_stability: 3, tech_architecture: 3, tech_actions: 3, tech_complexity: 3, tech_autonomy: 3,
      memory_short_term: 3, memory_long_term: 3, memory_adaptivity: 3, memory_improvement: 3,
      impact_problem_clarity: 3, impact_feasibility: 3,
      track_criterion_1: 3, track_criterion_2: 3,
      presentation_clarity: 3, presentation_qa: 3,
    };
    if (existingScore) {
      for (const key of Object.keys(defaults) as ScoreKey[]) {
        if (existingScore[key] != null) defaults[key] = existingScore[key] as number;
      }
    }
    return defaults;
  };

  const [scores, setScores] = useState<Record<ScoreKey, number>>(initScores);
  const [notesStrengths, setNotesStrengths] = useState(existingScore?.notes_strengths || "");
  const [notesImprovements, setNotesImprovements] = useState(existingScore?.notes_improvements || "");
  const [notesOverall, setNotesOverall] = useState(existingScore?.notes_overall || "");

  useEffect(() => {
    if (open) {
      setScores(initScores());
      setNotesStrengths(existingScore?.notes_strengths || "");
      setNotesImprovements(existingScore?.notes_improvements || "");
      setNotesOverall(existingScore?.notes_overall || "");
    }
  }, [open, existingScore]);

  const setScore = (key: ScoreKey, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const totals = calcSectionTotals(scores as ScoreRow);

  const trackInfo = TRACK_MAP[project.track];
  const trackCriteria: CriterionDef[] = trackInfo
    ? [
        { key: "track_criterion_1", label: trackInfo.criteria[0], hint: trackInfo.hints[0] },
        { key: "track_criterion_2", label: trackInfo.criteria[1], hint: trackInfo.hints[1] },
      ]
    : [
        { key: "track_criterion_1", label: "Track Criterion 1", hint: "" },
        { key: "track_criterion_2", label: "Track Criterion 2", hint: "" },
      ];

  const toggleSection = (id: string) => {
    setOpenSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); setSaving(false); return; }

      const payload = {
        judge_id: user.id,
        project_id: project.id,
        ...scores,
        notes_strengths: notesStrengths.trim() || null,
        notes_improvements: notesImprovements.trim() || null,
        notes_overall: notesOverall.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("judge_scores").upsert(payload, {
        onConflict: "judge_id,project_id",
      });

      if (error) {
        toast.error("Failed to save score");
        console.error(error);
      } else {
        toast.success(`Score saved: ${totals.total}/100`);
        onScored();
        setOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const sections = [
    { id: "s1", title: "1. Voice Experience & Conversation Quality", max: 25, score: totals.voice, criteria: SECTION_1 },
    { id: "s2", title: "2. Technical Execution & Autonomy", max: 25, score: totals.tech, criteria: SECTION_2 },
    { id: "s3", title: "3. Memory, Adaptivity & Continuous Learning", max: 20, score: totals.memory, criteria: SECTION_3 },
    { id: "s4c", title: `4. Real-World Impact — Common`, max: 10, score: Math.round((scores.impact_problem_clarity + scores.impact_feasibility) * 100) / 100, criteria: SECTION_4_COMMON },
    { id: "s4t", title: `4. Track-Specific: ${trackInfo?.judgingName || project.track}`, max: 10, score: Math.round((scores.track_criterion_1 + scores.track_criterion_2) * 100) / 100, criteria: trackCriteria },
    { id: "s5", title: "5. Presentation & Storytelling", max: 10, score: totals.presentation, criteria: SECTION_5 },
  ];

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
          {/* Header with total */}
          <div className="px-5 pt-4 pb-3 border-b border-border/30">
            <div className="flex items-start justify-between gap-3 max-w-2xl mx-auto">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold uppercase tracking-wide truncate" style={titleStyle}>{project.title}</h2>
                <p className="text-xs text-muted-foreground truncate">{project.team_name} &middot; {trackInfo?.judgingName || project.track}</p>
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
                <p className="text-3xl font-black gradient-text">{totals.total}</p>
                <p className="text-[10px] text-muted-foreground">/100</p>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <div className="max-w-2xl mx-auto space-y-3 pt-3">
              {sections.map((section) => (
                <Collapsible
                  key={section.id}
                  open={openSections.includes(section.id)}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger className="w-full glass-card-hover p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-left">{section.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="skill" className="text-xs">{section.score}/{section.max}</Badge>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.includes(section.id) ? "rotate-180" : ""}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 pb-2 pt-1">
                    {section.criteria.map((c) => (
                      <ScoreSlider
                        key={c.key}
                        criterion={c}
                        value={scores[c.key]}
                        onChange={(v) => setScore(c.key, v)}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {/* Notes */}
              <Collapsible open={openSections.includes("notes")} onOpenChange={() => toggleSection("notes")}>
                <CollapsibleTrigger className="w-full glass-card-hover p-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Judge Notes & Comments</h3>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openSections.includes("notes") ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pb-2 pt-1 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Strengths</label>
                    <Textarea
                      placeholder="What stood out?"
                      value={notesStrengths}
                      onChange={(e) => setNotesStrengths(e.target.value)}
                      className="glass-input min-h-[60px] resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Improvements</label>
                    <Textarea
                      placeholder="What could be better?"
                      value={notesImprovements}
                      onChange={(e) => setNotesImprovements(e.target.value)}
                      className="glass-input min-h-[60px] resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Overall Impression</label>
                    <Textarea
                      placeholder="Your overall take..."
                      value={notesOverall}
                      onChange={(e) => setNotesOverall(e.target.value)}
                      className="glass-input min-h-[60px] resize-none text-sm"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
                {saving ? "Saving..." : `Submit Score (${totals.total}/100)`}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default JudgeScoringSheet;
