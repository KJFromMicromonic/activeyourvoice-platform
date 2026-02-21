import { motion } from "framer-motion";
import { Calendar, Users, Scale, BookOpen, MapPin, Handshake, Trophy, ExternalLink, Clock, Coffee, Moon, Sun, PartyPopper, Utensils } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const schedule = [
  { time: "3:00 PM", event: "Registration & Welcome", icon: Users, day: "Sat" },
  { time: "4:00 PM", event: "Opening Ceremony", icon: PartyPopper, day: "Sat" },
  { time: "5:00 PM", event: "Hacking Begins! 🚀", icon: Clock, day: "Sat", highlight: true },
  { time: "8:00 PM", event: "Dinner", icon: Utensils, day: "Sat" },
  { time: "12:00 AM", event: "Midnight Snack", icon: Moon, day: "Sun" },
  { time: "8:00 AM", event: "Breakfast", icon: Coffee, day: "Sun" },
  { time: "12:00 PM", event: "Lunch", icon: Utensils, day: "Sun" },
  { time: "4:45 PM", event: "Submissions Close ⏰", icon: Clock, day: "Sun", highlight: true },
  { time: "5:00 PM", event: "Track Judging", icon: Scale, day: "Sun" },
  { time: "6:30 PM", event: "Finals — Top 6 Demo", icon: Trophy, day: "Sun", highlight: true },
  { time: "7:30 PM", event: "Winner Announcement 🎉", icon: PartyPopper, day: "Sun", highlight: true },
  { time: "8:00 PM", event: "Closing Party", icon: PartyPopper, day: "Sun" },
];

const judges = [
  { name: "Kartik Ahuja", title: "Research Scientist", company: "Meta", track: "Voice Interfaces" },
  { name: "Edgar", title: "DevRel", company: "Speechmatics", track: "Voice Interfaces" },
  { name: "Ekta Sengar", title: "Product Manager", company: "Atlassian", track: "Conversational AI" },
  { name: "Tharsan", title: "Lead AI Engineer", company: "PMU", track: "Conversational AI" },
  { name: "Mohamed Ahmednah", title: "Founder & CTO", company: "Quicksort", track: "AI Agents & Tools" },
];

const criteria = [
  { name: "Innovation & Originality", weight: 25, desc: "How novel is the approach? Does it push boundaries?" },
  { name: "Technical Execution", weight: 25, desc: "Code quality, architecture, use of partner APIs" },
  { name: "User Experience & Design", weight: 20, desc: "Is it intuitive, polished, delightful to use?" },
  { name: "Impact & Real-World Viability", weight: 20, desc: "Could this become a real product?" },
  { name: "Presentation & Demo", weight: 10, desc: "Clarity, storytelling, wow factor" },
];

const partners = [
  { name: "Speechmatics", role: "Title Partner", perks: "$3,000 credits per winning team + $3,000 special prize" },
  { name: "OpenAI", role: "AI Partner", perks: "$1,000 API credits + 1yr ChatGPT Pro + GPT-5.3-Codex access" },
  { name: "Backboard.io", role: "Platform Partner", perks: "$100 credits/person + €300 cash prize" },
  { name: "Station F", role: "Space Partner", perks: "1 month access per winning team member" },
  { name: "42 Entrepreneurs", role: "Co-Host", perks: "Venue & community partner" },
];

const Event = () => {
  return (
    <div className="px-5 pt-12 pb-6 max-w-lg mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold">Event</h1>
        <p className="text-sm text-muted-foreground mt-1">Everything you need, all in one place</p>
      </motion.div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="w-full bg-muted/50 rounded-xl p-1 h-auto flex-wrap gap-0.5">
          <TabsTrigger value="schedule" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">📅 Schedule</TabsTrigger>
          <TabsTrigger value="jury" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">🧑‍⚖️ Jury</TabsTrigger>
          <TabsTrigger value="rules" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">📋 Rules</TabsTrigger>
          <TabsTrigger value="venue" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">🏠 Venue</TabsTrigger>
          <TabsTrigger value="partners" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">🤝 Partners</TabsTrigger>
        </TabsList>

        {/* Schedule */}
        <TabsContent value="schedule" className="mt-4 space-y-2">
          {schedule.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.highlight ? "glass-card border-primary/20" : "hover:bg-muted/30"}`}
              style={item.highlight ? { borderColor: "hsl(263 84% 58% / 0.2)" } : {}}
            >
              <div className="text-right min-w-[60px]">
                <p className="text-xs font-semibold">{item.time}</p>
                <p className="text-[10px] text-muted-foreground">{item.day}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.highlight ? "gradient-primary" : "bg-muted"}`}>
                <item.icon className="w-4 h-4 text-foreground" />
              </div>
              <span className={`text-sm ${item.highlight ? "font-semibold" : "text-muted-foreground"}`}>{item.event}</span>
            </motion.div>
          ))}
        </TabsContent>

        {/* Jury */}
        <TabsContent value="jury" className="mt-4 space-y-3">
          {judges.map((judge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="glass-card-hover p-4 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white glow-avatar">
                {judge.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{judge.name}</h3>
                <p className="text-xs text-muted-foreground">{judge.title} @ {judge.company}</p>
                <Badge variant="skill" className="text-[10px] mt-1">{judge.track}</Badge>
              </div>
            </motion.div>
          ))}
          <div className="glass-card p-4 text-center">
            <p className="text-sm text-muted-foreground">+ more judges TBA</p>
          </div>
        </TabsContent>

        {/* Rules & Criteria */}
        <TabsContent value="rules" className="mt-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Judging Criteria</h3>
            {criteria.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="glass-card p-4"
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-semibold">{c.name}</h4>
                  <span className="gradient-text font-bold text-sm">{c.weight}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
                <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                  <div className="h-full gradient-bar" style={{ width: `${c.weight * 4}%` }} />
                </div>
              </motion.div>
            ))}
            <div className="glass-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Finals = <span className="text-primary font-semibold">80% jury</span> + <span className="text-secondary font-semibold">20% public vote</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rules</h3>
            {[
              "Teams of 3-6 people",
              "Team registration deadline: Thursday Feb 26",
              "Submission deadline: Sunday March 1, 4:45 PM",
              "Must use at least one partner API (Speechmatics, OpenAI, Backboard)",
              "All code must be written during the hackathon",
              "7 teams max per track — first come first served",
              "Top 2 per track → 6 finalists → Winner announcement",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="gradient-text font-bold mt-0.5">•</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Venue */}
        <TabsContent value="venue" className="mt-4 space-y-3">
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">École 42, Paris</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is more than a hackathon — you'll be living together for 24 hours. Private offices for each team, rest areas with couches, and all meals provided.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">We've Got You Covered</h3>
            {[
              { emoji: "🍽️", text: "All meals: breakfast, lunch, dinner, snacks & drinks" },
              { emoji: "🏢", text: "Private team offices with dedicated workspaces" },
              { emoji: "🛋️", text: "Rest areas with couches for power naps" },
              { emoji: "📶", text: "High-speed WiFi throughout the venue" },
            ].map((item, i) => (
              <div key={i} className="glass-card p-3 flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="glass-card p-4 space-y-2" style={{ borderColor: "hsl(263 84% 58% / 0.2)" }}>
            <h3 className="text-sm font-semibold">🎒 What to Bring</h3>
            <div className="flex flex-wrap gap-2">
              {["Laptop + charger", "Mattress/blanket/pillow", "Headphones", "Water bottle", "Comfortable clothes", "ID"].map((item) => (
                <Badge key={item} variant="glass" className="text-xs">{item}</Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Partners & Prizes */}
        <TabsContent value="partners" className="mt-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Partners & Sponsors</h3>
            {partners.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="glass-card-hover p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">{p.name}</h4>
                  <Badge variant="skill" className="text-[10px]">{p.role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.perks}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">🏆 Prizes</h3>
            <div className="glass-card p-5 space-y-4" style={{ background: "linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(59, 130, 246, 0.08))" }}>
              <div className="text-center">
                <p className="gradient-text text-3xl font-extrabold">€100,000+</p>
                <p className="text-xs text-muted-foreground mt-1">Total prize pool in cash + credits</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Per track winner (×3)", prize: "€1,000 cash + partner credits" },
                  { label: "Speechmatics Special", prize: "$3,000 additional credits" },
                  { label: "Backboard Special", prize: "€300 cash prize" },
                  { label: "All winners", prize: "1yr ChatGPT Pro + 1mo Station F" },
                ].map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-semibold text-xs">{p.prize}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Event;
