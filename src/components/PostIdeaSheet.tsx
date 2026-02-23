import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { postActivity } from "@/lib/activity";

const TRACKS = [
  { id: "voice-interfaces", name: "Voice Interfaces" },
  { id: "conversational-ai", name: "Conversational AI" },
  { id: "ai-agents-tools", name: "AI Agents & Tools" },
];

const titleStyle: React.CSSProperties = {
  fontFamily: "'Orbitron', sans-serif",
  background: "linear-gradient(135deg, hsl(263,84%,58%), hsl(217,91%,60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

interface PostIdeaSheetProps {
  children: React.ReactNode;
}

const PostIdeaSheet = ({ children }: PostIdeaSheetProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!open) return;
    const fetchName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("first_name, last_name").eq("user_id", user.id).single();
      if (data) setUserName(`${data.first_name} ${data.last_name}`.trim());
    };
    fetchName();
  }, [open]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setTrack("");
  };

  const handlePost = async () => {
    if (!title.trim()) {
      toast.error("Give your idea a title");
      return;
    }
    setSaving(true);
    try {
      const trackLabel = TRACKS.find((t) => t.id === track)?.name || "";
      const detail = `pitched "${title.trim()}"${trackLabel ? ` for ${trackLabel}` : ""}`;
      await postActivity("team_created", userName || "Someone", detail);

      // Also post as an announcement so it shows up on the home feed
      await supabase.from("announcements").insert({
        title: `Idea: ${title.trim()}`,
        body: `${description.trim() || "No description yet."}${trackLabel ? `\n\nTrack: ${trackLabel}` : ""}${userName ? `\n\nPosted by ${userName}` : ""}`,
        pinned: false,
      });

      toast.success("Idea posted! Others can see it on the home feed.");
      setOpen(false);
      reset();
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
        className="h-[75vh] border-t border-primary/20"
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
                <h2 className="text-2xl font-bold uppercase tracking-wide" style={titleStyle}>Post an idea</h2>
                <p className="text-xs text-muted-foreground mt-1">Share what you want to build and find like-minded teammates</p>
              </div>
              <div className="gradient-primary h-px w-12 rounded-full" />

              <div className="space-y-3">
                <Input
                  placeholder="What's your idea? (e.g. AI voice journaling app)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  maxLength={100}
                />
                <Textarea
                  placeholder="Describe your idea in a few sentences — what problem does it solve?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input min-h-[100px] resize-none"
                  maxLength={400}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Track (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {TRACKS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTrack(track === t.id ? "" : t.id)}
                      className={track === t.id ? "pill-button-active" : "pill-button"}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-3">
                <p className="text-xs text-muted-foreground">
                  Your idea will appear in the announcements feed so others can find you and team up.
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-6 pt-2 border-t border-border/30">
            <Button
              variant="gradient"
              className="w-full rounded-xl h-12"
              onClick={handlePost}
              disabled={saving || !title.trim()}
            >
              {saving ? "Posting..." : "Post Idea"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PostIdeaSheet;
