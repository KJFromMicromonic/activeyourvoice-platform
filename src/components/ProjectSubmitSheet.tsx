import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { postActivity } from "@/lib/activity";

const TECH_OPTIONS = [
  "React", "Next.js", "Python", "Node.js", "TypeScript", "OpenAI API",
  "Speechmatics", "LangChain", "FastAPI", "Tailwind", "Supabase", "Other",
];

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  background: "linear-gradient(135deg, hsl(263,84%,58%), hsl(217,91%,60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

interface ProjectSubmitSheetProps {
  teamId: string;
  teamTrack: string;
  onSubmitted: () => void;
  children: React.ReactNode;
}

const ProjectSubmitSheet = ({ teamId, teamTrack, onSubmitted, children }: ProjectSubmitSheetProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);

  const reset = () => {
    setTitle("");
    setTagline("");
    setDescription("");
    setDemoUrl("");
    setRepoUrl("");
    setTechStack([]);
  };

  const toggleTech = (tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !tagline.trim()) {
      toast.error("Title and tagline are required");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("projects").upsert(
        {
          team_id: teamId,
          title: title.trim(),
          tagline: tagline.trim(),
          description: description.trim() || null,
          demo_url: demoUrl.trim() || null,
          repo_url: repoUrl.trim() || null,
          track: teamTrack,
          tech_stack: techStack,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "team_id" }
      );

      if (error) {
        toast.error("Failed to submit project");
        console.error(error);
      } else {
        toast.success("Project submitted!");
        await postActivity("project_submitted", title.trim(), `submitted "${title.trim()}"`);
        onSubmitted();
        setOpen(false);
        reset();
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-[85vh] border-t border-primary/20"
        style={{
          background: "rgba(var(--glass-bg), 0.02)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
            <div className="max-w-md mx-auto space-y-5">
              <div>
                <h2 className="text-2xl font-black italic" style={titleStyle}>Submit your project</h2>
                <p className="text-xs text-muted-foreground mt-1">Show the world what you've built</p>
              </div>
              <div className="gradient-primary h-px w-12 rounded-full" />

              <div className="space-y-3">
                <Input
                  placeholder="Project title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  maxLength={100}
                />
                <Input
                  placeholder="Tagline (one-liner)"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="glass-input"
                  maxLength={140}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input min-h-[80px] resize-none"
                  maxLength={500}
                />
                <Input
                  placeholder="Demo URL (optional)"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="glass-input"
                />
                <Input
                  placeholder="Repo URL (optional)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tech Stack</label>
                <div className="flex flex-wrap gap-2">
                  {TECH_OPTIONS.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={techStack.includes(tech) ? "pill-button-active" : "pill-button"}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground">
                  Track: <span className="font-semibold text-foreground">{teamTrack.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-6 pt-2 border-t border-border/30">
            <Button
              variant="gradient"
              className="w-full rounded-xl h-12"
              onClick={handleSubmit}
              disabled={saving || !title.trim() || !tagline.trim()}
            >
              {saving ? "Submitting..." : "Submit Project"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProjectSubmitSheet;
