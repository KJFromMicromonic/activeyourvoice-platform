import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Scale, BookOpen, MapPin, Handshake, Trophy, ExternalLink, Clock, Coffee, Moon, Sun, PartyPopper, Utensils, ChevronDown, Megaphone, Wrench, Laptop, AlertTriangle, Wine } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { timelineDays, parseTimeRange, HACKATHON_DATES } from "@/lib/schedule-utils";

const judges = [
  { name: "Kartik Ahuja", title: "Research Scientist", company: "Meta", track: "Communication & Human Experience" },
  { name: "Edgar", title: "DevRel", company: "Speechmatics", track: "Communication & Human Experience" },
  { name: "Ekta Sengar", title: "Product Manager", company: "Atlassian", track: "Business Automation" },
  { name: "Tharsan", title: "Lead AI Engineer", company: "PMU", track: "Business Automation" },
  { name: "Mohamed Ahmednah", title: "Founder & CTO", company: "Quicksort", track: "Developer & Infrastructure Tools" },
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
  { name: "Backboard.io", role: "Platform Partner", perks: "$100 credits/person + \u20ac300 cash prize" },
  { name: "Station F", role: "Space Partner", perks: "1 month access per winning team member" },
  { name: "42 Entrepreneurs", role: "Co-Host", perks: "Venue & community partner" },
];

const ScheduleTab = () => {
  const [openDays, setOpenDays] = useState<string[]>(["Saturday, Feb 28", "Sunday, March 1"]);
  const [now, setNow] = useState(new Date());
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const toggleDay = (date: string) => {
    setOpenDays((prev) => prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]);
  };

  const isActive = (dayDate: string, timeStr: string): boolean => {
    const range = parseTimeRange(dayDate, timeStr);
    if (!range) return false;
    if (range.end) {
      return now >= range.start && now <= range.end;
    }
    const windowEnd = new Date(range.start.getTime() + 30 * 60 * 1000);
    return now >= range.start && now <= windowEnd;
  };

  const isNext = (dayDate: string, timeStr: string): boolean => {
    const range = parseTimeRange(dayDate, timeStr);
    if (!range) return false;
    const diff = range.start.getTime() - now.getTime();
    return diff > 0 && diff <= 2 * 60 * 60 * 1000; // within 2 hours
  };

  return (
    <div className="space-y-3">
      {timelineDays.map((day) => (
        <div key={day.date}>
          {day.isMilestone ? (
            <div className="glass-card p-3 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day.emoji} {day.date}</h4>
              {day.events.map((ev, j) => (
                <div key={j} className={`flex items-start gap-2 text-sm ${ev.highlight ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  <ev.icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    {ev.time && <p className="text-[10px] font-medium text-muted-foreground/70 mb-0.5">{ev.time}</p>}
                    <span>{ev.event}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Collapsible open={openDays.includes(day.date)} onOpenChange={() => toggleDay(day.date)}>
              <CollapsibleTrigger className="w-full glass-card-hover p-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">{day.emoji} {day.date}</h4>
                  <p className="text-xs text-muted-foreground">{day.label}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openDays.includes(day.date) ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 space-y-1 pl-2 border-l-2 border-primary/20 ml-4">
                {day.events.map((ev, j) => {
                  const active = isActive(day.date, ev.time);
                  const next = !active && isNext(day.date, ev.time);
                  return (
                    <motion.div
                      key={j}
                      ref={active ? activeRef : undefined}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: j * 0.03 }}
                      className={`flex items-start gap-3 p-2.5 rounded-lg ${
                        active ? "glass-card border-green-500/30 ring-1 ring-green-500/20" :
                        next ? "glass-card border-primary/15" :
                        ev.highlight ? "glass-card border-primary/20" : ""
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        active ? "bg-green-500/20" : ev.highlight ? "gradient-primary" : "bg-muted"
                      }`}>
                        {active ? (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        ) : (
                          <ev.icon className="w-3.5 h-3.5 text-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {ev.time && <p className="text-[10px] text-muted-foreground font-medium">{ev.time}</p>}
                          {active && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">NOW</span>
                          )}
                          {next && (
                            <span className="text-[9px] font-medium uppercase tracking-wider text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-full">Up next</span>
                          )}
                        </div>
                        <p className={`text-sm ${active ? "font-semibold text-green-300 dark:text-green-300" : ev.highlight ? "font-semibold" : "text-muted-foreground"}`}>{ev.event}</p>
                        {ev.subItems && (
                          <ul className="mt-1.5 space-y-0.5">
                            {ev.subItems.map((sub, k) => (
                              <li key={k} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="gradient-text mt-0.5">&bull;</span> {sub}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      ))}
    </div>
  );
};

const Event = () => {
  return (
    <div className="px-5 pt-12 pb-6 max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-bold">Event</h1>
        <p className="text-sm text-muted-foreground mt-1">Everything you need, all in one place</p>
      </motion.div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="w-full bg-muted/50 rounded-xl p-1 h-auto flex-wrap gap-0.5">
          <TabsTrigger value="schedule" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Schedule</TabsTrigger>
          <TabsTrigger value="jury" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Jury</TabsTrigger>
          <TabsTrigger value="rules" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Rules</TabsTrigger>
          <TabsTrigger value="venue" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Venue</TabsTrigger>
          <TabsTrigger value="partners" className="rounded-lg text-xs flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Partners</TabsTrigger>
        </TabsList>

        {/* Schedule */}
        <TabsContent value="schedule" className="mt-4">
          <ScheduleTab />
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
              "Submission deadline: Sunday March 1, 5:00 PM",
              "Must use at least one partner API (Speechmatics, OpenAI, Backboard)",
              "All code must be written during the hackathon",
              "7 teams max per track \u2014 first come first served",
              "Top 2 per track \u2192 6 finalists \u2192 Winner announcement",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="gradient-text font-bold mt-0.5">&bull;</span>
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
              <h3 className="font-semibold">The Builders Factory</h3>
            </div>
            <p className="text-sm text-muted-foreground">18 rue la Condamine, 75017 Paris</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is more than a hackathon &mdash; you'll be living together for 24 hours. Private offices for each team, rest areas with couches, and all meals provided.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">We've Got You Covered</h3>
            {[
              { emoji: "\ud83c\udf7d\ufe0f", text: "All meals: breakfast, lunch, dinner, snacks & drinks" },
              { emoji: "\ud83c\udfe2", text: "Private team offices with dedicated workspaces" },
              { emoji: "\ud83d\udecb\ufe0f", text: "Rest areas with couches for power naps" },
              { emoji: "\ud83d\udcf6", text: "High-speed WiFi throughout the venue" },
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
                  { label: "Per track winner (\u00d73)", prize: "\u20ac1,000 cash + partner credits" },
                  { label: "Speechmatics Special", prize: "$3,000 additional credits" },
                  { label: "Backboard Special", prize: "\u20ac300 cash prize" },
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
