import { Calendar, Users, Scale, BookOpen, MapPin, Handshake, Trophy, ExternalLink, Clock, Coffee, Moon, Sun, PartyPopper, Utensils, ChevronDown, Megaphone, Wrench, Laptop, AlertTriangle, Wine } from "lucide-react";

export interface TimelineEvent {
  time: string;
  event: string;
  icon: React.ElementType;
  highlight?: boolean;
  subItems?: string[];
}

export interface TimelineDay {
  date: string;
  label: string;
  emoji: string;
  isMilestone?: boolean;
  events: TimelineEvent[];
}

export const timelineDays: TimelineDay[] = [
  {
    date: "Tuesday, Feb 24",
    label: "Track Announcement",
    emoji: "\u{1F4C5}",
    isMilestone: true,
    events: [{ time: "", event: "Announcement of 3 tracks + team formation facilitation", icon: Megaphone }],
  },
  {
    date: "Wednesday, Feb 25",
    label: "Partners Demo",
    emoji: "\u{1F4C5}",
    isMilestone: true,
    events: [
      { time: "6:30 PM CET", event: "Speechmatics demo \ud83c\udfa4", icon: Handshake },
      { time: "7:00 PM CET", event: "Backboard demo \ud83d\udcbb", icon: Handshake },
      { time: "7:20 PM \u2013 7:30 PM CET", event: "Wrap up", icon: Clock },
    ],
  },
  {
    date: "Thursday, Feb 26",
    label: "Deadline Day",
    emoji: "\u{1F4C5}",
    isMilestone: true,
    events: [
      { time: "", event: "Deadline: Team submission", icon: AlertTriangle, highlight: true },
      { time: "", event: "Codex Access \u2014 organisation ID distributed", icon: Laptop },
    ],
  },
  {
    date: "Saturday, Feb 28",
    label: "Hackathon Day 1",
    emoji: "\u{1F4C5}",
    events: [
      { time: "2:00 PM \u2013 3:00 PM", event: "Check-in & welcome coffee \u2615", icon: Coffee },
      {
        time: "3:00 PM \u2013 3:30 PM", event: "Opening ceremony \ud83c\udfa4", icon: PartyPopper, highlight: true,
        subItems: [
          "Welcome speech: The AI Collective",
          "Introduction to hackathon rules & tracks",
          "Introduction to mentors, jury & judging criteria",
          "Agenda overview",
          "Perks from sponsors",
        ],
      },
      { time: "3:30 PM \u2013 4:15 PM", event: "Partners workshop \ud83e\udd1d", icon: Wrench },
      { time: "4:15 PM \u2013 8:00 PM", event: "Working session #1 \ud83d\udcbb", icon: Laptop },
      { time: "8:00 PM \u2013 9:00 PM", event: "Dinner \ud83c\udf7d\ufe0f", icon: Utensils },
      { time: "8:30 PM \u2013 11:00 PM", event: "Working session #2 \ud83d\udcbb", icon: Laptop },
      { time: "11:00 PM", event: "Overnight build begins \ud83c\udf19", icon: Moon },
    ],
  },
  {
    date: "Sunday, March 1",
    label: "Hackathon Day 2",
    emoji: "\u{1F4C5}",
    events: [
      { time: "9:00 AM", event: "Coffee \u2615", icon: Coffee },
      { time: "9:00 AM \u2013 12:30 PM", event: "Working session #3 \ud83d\udcbb", icon: Laptop },
      { time: "12:30 PM \u2013 1:30 PM", event: "Lunch \ud83c\udf7d\ufe0f", icon: Utensils },
      { time: "12:30 PM \u2013 5:00 PM", event: "Final working session \ud83d\udcbb", icon: Laptop },
      { time: "4:30 PM", event: "Jury arrival time \ud83e\uddd1\u200d\u2696\ufe0f", icon: Scale },
      { time: "5:00 PM", event: "Project submission deadline \ud83d\udea8", icon: Clock, highlight: true },
      { time: "5:00 PM \u2013 6:00 PM", event: "Demo & jury fire \ud83d\udd25 (3 min pitch + Q&A)", icon: Trophy, highlight: true },
      { time: "6:00 PM \u2013 6:30 PM", event: "Top 6 teams demo \ud83c\udfc6", icon: Trophy, highlight: true },
      { time: "6:30 PM \u2013 7:00 PM", event: "Jury deliberation & networking \ud83e\udd1d", icon: Handshake },
      { time: "7:00 PM", event: "Result announcement & prizes \ud83c\udf89", icon: PartyPopper, highlight: true },
      { time: "7:00 PM \u2013 8:00 PM", event: "Cocktail celebration \ud83e\udd42", icon: Wine },
    ],
  },
];

export const HACKATHON_DATES: Record<string, string> = {
  "Saturday, Feb 28": "2026-02-28",
  "Sunday, March 1": "2026-03-01",
};

function parseTime12h(timeStr: string, dateStr: string): Date {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date(0);
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  // Create date in CET (UTC+1)
  return new Date(`${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+01:00`);
}

export function parseTimeRange(dayDate: string, timeStr: string): { start: Date; end: Date | null } | null {
  const isoDate = HACKATHON_DATES[dayDate];
  if (!isoDate || !timeStr) return null;

  const parts = timeStr.split(/\s*[\u2013\-]\s*/);
  const start = parseTime12h(parts[0], isoDate);
  const end = parts.length > 1 ? parseTime12h(parts[1], isoDate) : null;
  return { start, end };
}

export function findCurrentEvent(now: Date): { dayDate: string; eventIndex: number; event: TimelineEvent } | null {
  for (const day of timelineDays) {
    if (!HACKATHON_DATES[day.date]) continue;
    for (let i = 0; i < day.events.length; i++) {
      const ev = day.events[i];
      const range = parseTimeRange(day.date, ev.time);
      if (!range) continue;
      if (range.end) {
        if (now >= range.start && now <= range.end) {
          return { dayDate: day.date, eventIndex: i, event: ev };
        }
      } else {
        // Single time point — consider "current" for 30 min after start
        const windowEnd = new Date(range.start.getTime() + 30 * 60 * 1000);
        if (now >= range.start && now <= windowEnd) {
          return { dayDate: day.date, eventIndex: i, event: ev };
        }
      }
    }
  }
  return null;
}

export function findNextEvent(now: Date): { dayDate: string; eventIndex: number; event: TimelineEvent; startsIn: number } | null {
  let closest: { dayDate: string; eventIndex: number; event: TimelineEvent; startsIn: number } | null = null;

  for (const day of timelineDays) {
    if (!HACKATHON_DATES[day.date]) continue;
    for (let i = 0; i < day.events.length; i++) {
      const ev = day.events[i];
      const range = parseTimeRange(day.date, ev.time);
      if (!range) continue;
      const diff = range.start.getTime() - now.getTime();
      if (diff > 0 && (!closest || diff < closest.startsIn)) {
        closest = { dayDate: day.date, eventIndex: i, event: ev, startsIn: diff };
      }
    }
  }
  return closest;
}
