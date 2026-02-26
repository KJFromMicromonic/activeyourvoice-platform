import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Scale, BookOpen, MapPin, Handshake, Trophy, ExternalLink, Clock, Coffee, Moon, Sun, PartyPopper, Utensils, ChevronDown, Megaphone, Wrench, Laptop, AlertTriangle, Wine } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { timelineDays, parseTimeRange, HACKATHON_DATES } from "@/lib/schedule-utils";

const judges = [
  { name: "Kartik Ahuja", title: "Research Scientist", company: "Meta", track: "Communication & Human Experience", image: "https://www.activateyourvoice.tech/Partners/Kartik-Ahuja.jpeg" },
  { name: "Edgars Adamovics", title: "DevRel", company: "Speechmatics", track: "Communication & Human Experience", image: "https://www.activateyourvoice.tech/Partners/85f63cc9-17b5-4e7a-af3d-caa8b6d3c76a.jpeg" },
  { name: "Ekta Sengar", title: "Product Manager", company: "Atlassian", track: "Business Automation", image: "https://www.activateyourvoice.tech/Partners/Ekta-Sengar.jpeg" },
  { name: "Tharsan Senthivel", title: "Lead AI Engineer", company: "PMU", track: "Business Automation", image: "https://www.activateyourvoice.tech/Partners/Tharsan.jpeg" },
  { name: "Mohamed Ahmednah", title: "Founder & CTO", company: "Quicksort", track: "Developer & Infrastructure Tools", image: "https://media.licdn.com/dms/image/v2/D4E03AQE0zeV3pTztiQ/profile-displayphoto-scale_400_400/B4EZvYAKgJGgAk-/0/1768855481205?e=1772668800&v=beta&t=0GNc1wJg3IAIndAQThnbBQMLAT1BvGceRe1KbH4fNNs" },
  { name: "Sylvain Cordier", title: "CPTO", company: "Stairling", track: "Developer & Infrastructure Tools", image: "https://media.licdn.com/dms/image/v2/D5603AQEz2_X28-_XUw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1727710393657?e=1773273600&v=beta&t=tSNfmyQXxg-jTd4rrZhcsZFafjqfh4xlbjr-ypBUJtg" },
  { name: "Salim Louanjli", title: "Pre-Seed VC", company: "Campus Fund", track: "Business Automation", image: "https://media.licdn.com/dms/image/v2/C5603AQH8ABLKR5QBNw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1649406922052?e=1773273600&v=beta&t=0JA1qG4aSR_Tx3HEB9aFkj1-upjLd5pMtwHYmteRWuc" },
  { name: "Aliénor Dartiguenave", title: "Director Of AI Products", company: "Foundever", track: "Communication & Human Experience", image: "https://media.licdn.com/dms/image/v2/D4E03AQFkiPq5KyI6WA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1680623104213?e=1773273600&v=beta&t=rCj7hFtqJ9y48O_qVD6nVgB7MABfflAeR6_HHyhOt_g" },
  { name: "Robin Guignard-Perret", title: "CEO", company: "Tellers.ai", track: "Developer & Infrastructure Tools", image: "https://media.licdn.com/dms/image/v2/D4E03AQGP59fVrSo42w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1706861829571?e=1773273600&v=beta&t=PfzvG5kD1cIkt6BPXD3PM8olwwH-0lr7LaxygJMV0aw" },
];

const criteria = [
  {
    name: "Conversation Feel & UX",
    weight: 20,
    bullets: [
      "How natural, fast, and effortless is the interaction across both voice and interface?",
      "Do the visuals, states, and prompts support the conversation (clear, uncluttered, obvious next step)?",
    ],
  },
  {
    name: "Task Completion & Autonomy",
    weight: 15,
    bullets: [
      "Does the agent actually get real tasks done end‑to‑end with minimal hand‑holding?",
      "Does it take intelligent actions via tools/APIs, not just talk?",
    ],
  },
  {
    name: "Memory & Adaptivity",
    weight: 20,
    bullets: [
      "Does it remember relevant context (short‑term + long‑term) and change behavior accordingly?",
      "Is there any loop for improving from interactions, even if simple?",
    ],
  },
  {
    name: "Real‑World Impact",
    weight: 15,
    bullets: [
      "Is there a sharp problem and a clearly defined user?",
      "Would this clearly matter in the real world (time saved, quality, delight)?",
    ],
  },
  {
    name: "Technical Depth & Difficulty",
    weight: 10,
    bullets: [
      "How non‑trivial is the technical work (architecture, reasoning, robustness)?",
      "Did they tackle something meaningfully hard vs a thin wrapper?",
    ],
  },
  {
    name: "Partner Utilisation",
    weight: 10,
    bullets: [
      "Do they make smart, relevant use of partner tech (Speechmatics, Backboard, etc.)?",
      "Is that integration essential to the solution, not just name‑dropping?",
    ],
  },
  {
    name: "Product Story & Craft",
    weight: 10,
    bullets: [
      "One‑sentence clarity: \"It's for X, it does Y, and voice is the best way because Z.\"",
      "Demo, UI, and flows are tight; trade‑offs are thoughtful; it feels like a real product, not just a 24‑hour project.",
    ],
  },
];

const partners = [
  { name: "Speechmatics", role: "Title Partner", perks: "$3,000 credits per winning team + $1,000 special prize" },
  { name: "OpenAI", role: "AI Partner", perks: "$1,000 API credits + 1yr ChatGPT Pro + GPT-5.3-Codex access" },
  { name: "Backboard.io", role: "Platform Partner", perks: "$100 credits/person + €300 cash prize" },
  { name: "Station F", role: "Space Partner", perks: "1 month access per winning team member" },
  { name: "Builders Factory", role: "Co-Host", perks: "50% off 6-month founders residency + always-on HQ access + mentorship & community perks" },
  { name: "API Days", role: "Community Partner", perks: "Speaking at FOST — invitation to speak at API Days' FOST Conferences + 5 tickets to FOST per winning team" },
  { name: "Lovable", role: "Partner", perks: "Pro Plan 1 (100 credits) for the build" },
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
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white glow-avatar overflow-hidden shrink-0">
                {judge.image
                  ? <img src={judge.image} alt={judge.name} className="w-full h-full object-cover" />
                  : judge.name.split(" ").map((n) => n[0]).join("")
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{judge.name}</h3>
                <p className="text-xs text-muted-foreground">{judge.title} @ {judge.company}</p>
                <Badge variant="skill" className="text-[10px] mt-1">{judge.track}</Badge>
              </div>
            </motion.div>
          ))}
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
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold">{c.name}</h4>
                  <span className="gradient-text font-bold text-sm">0–{c.weight}</span>
                </div>
                <ul className="space-y-1">
                  {c.bullets.map((bullet, k) => (
                    <li key={k} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <span className="gradient-text font-bold shrink-0 mt-0.5">&bull;</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="h-1.5 rounded-full bg-muted mt-3 overflow-hidden">
                  <div className="h-full gradient-bar" style={{ width: `${(c.weight / 20) * 100}%` }} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hackathon Rules</h3>
            {[
              "Teams of 3–6 people (all members must be registered participants).",
              "All work (code, prompts, architectures) must be created during the hackathon — no pre-built projects or old repos. You may come prepared with a clear idea and strategy though.",
              "Each project must use at least one partner API (Speechmatics, OpenAI, Backboard, etc.).",
              "All submissions are due by Sunday at 5:00 PM sharp; late submissions cannot be judged.",
              "Max 7 teams per track; spots are first come, first served as teams confirm.",
              "Top 2 teams per track advance to finals; final ranking is based on jury score + public vote (weights defined in judging criteria).",
              "Teams must be transparent about which tools, models, and external assets they used in their project.",
              "Plagiarism or reuse of someone else's code or IP without permission leads to disqualification.",
              "By participating, you agree to our Code of Conduct: respectful, inclusive behavior is mandatory; harassment or discrimination of any kind is not tolerated.",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="gradient-text font-bold mt-0.5 shrink-0">&bull;</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">🏠 House Rules (Builders Factory Overnight Residency)</h3>
            {[
              "Respect the space: treat Builders Factory like a home, not a venue (clean up after yourself, no damage to furniture, equipment, or walls).",
              "Quiet zones: keep noise reasonable in work areas at night; use designated break zones for calls or loud conversations.",
              "Sleep corners: rest areas with couches are for short naps, not for blocking others' access; be considerate when lights are dimmed.",
              "No smoking, vaping, or open flames anywhere inside the venue (including windows and bathrooms); follow all safety instructions from staff. There is a terrasse for smokers.",
              "Alcohol and substances: no illegal substances; if alcohol is present, consumption must remain moderate and compatible with a safe, professional environment.",
              "Security & access: do not let unknown people into the building; badges/wristbands must be worn at all times and shown on request.",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="gradient-text font-bold mt-0.5 shrink-0">&bull;</span>
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
            For 24 hours, Builders Factory becomes your home base: 600m² of founders’ HQ, private spaces, chill zones and fuel, all engineered so you can ship your best work.
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
