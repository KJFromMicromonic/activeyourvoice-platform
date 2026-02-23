export const TRACK_MAP: Record<string, { judgingName: string; criteria: [string, string]; hints: [string, string] }> = {
  "voice-interfaces": {
    judgingName: "Communication & Human Experience",
    criteria: ["Depth of Human Experience", "Ethics, Safety & Trust"],
    hints: [
      "Deep, memorable human experience (learning, support, collaboration)",
      "Thoughtful design around bias, safety, privacy, user trust",
    ],
  },
  "conversational-ai": {
    judgingName: "Business Automation",
    criteria: ["Level of Automation", "Measurable Value"],
    hints: [
      "Offloads meaningful chunks of real work end-to-end",
      "Strong, quantifiable impact on cost, time, or quality",
    ],
  },
  "ai-agents-tools": {
    judgingName: "Developer & Infrastructure Tools",
    criteria: ["Value for Engineers", "Workflow Integration"],
    hints: [
      "Feels like a tool devs would actually adopt",
      "Deeply embedded in realistic dev workflows",
    ],
  },
};

export interface ScoreRow {
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
}

export interface SectionTotals {
  voice: number;       // /25
  tech: number;        // /25
  memory: number;      // /20
  impact: number;      // /20
  presentation: number; // /10
  total: number;       // /100
}

const sum = (...vals: (number | null)[]): number =>
  vals.reduce<number>((acc, v) => acc + (v ?? 0), 0);

export function calcSectionTotals(s: ScoreRow): SectionTotals {
  const voiceRaw = sum(s.voice_naturalness, s.voice_turn_taking, s.voice_persona, s.voice_multimodal, s.voice_accessibility);
  const techRaw = sum(s.tech_stability, s.tech_architecture, s.tech_actions, s.tech_complexity, s.tech_autonomy);
  const memoryRaw = sum(s.memory_short_term, s.memory_long_term, s.memory_adaptivity, s.memory_improvement);
  const impactCommon = sum(s.impact_problem_clarity, s.impact_feasibility);
  const impactTrack = sum(s.track_criterion_1, s.track_criterion_2);
  const presentationRaw = sum(s.presentation_clarity, s.presentation_qa);

  const voice = voiceRaw * 1.25;
  const tech = techRaw * 1.25;
  const memory = memoryRaw * 1.0;
  const impact = (impactCommon + impactTrack) * 1.0;
  const presentation = presentationRaw * 1.0;

  return {
    voice: Math.round(voice * 100) / 100,
    tech: Math.round(tech * 100) / 100,
    memory: Math.round(memory * 100) / 100,
    impact: Math.round(impact * 100) / 100,
    presentation: Math.round(presentation * 100) / 100,
    total: Math.round((voice + tech + memory + impact + presentation) * 100) / 100,
  };
}

export function isScoreComplete(s: ScoreRow): boolean {
  return Object.values(s).every((v) => v !== null && v !== undefined);
}

export interface RankedProject {
  projectId: string;
  title: string;
  track: string;
  teamName: string;
  avgTotal: number;
  avgVoice: number;
  avgTech: number;
  avgMemory: number;
  avgImpact: number;
  avgPresentation: number;
  judgeCount: number;
  rank: number;
}

export function rankProjects(
  projects: { id: string; title: string; track: string; team_name: string }[],
  allScores: (ScoreRow & { project_id: string })[]
): RankedProject[] {
  const grouped: Record<string, SectionTotals[]> = {};
  for (const score of allScores) {
    if (!grouped[score.project_id]) grouped[score.project_id] = [];
    grouped[score.project_id].push(calcSectionTotals(score));
  }

  const ranked: RankedProject[] = projects.map((p) => {
    const scores = grouped[p.id] || [];
    const count = scores.length;
    if (count === 0) {
      return {
        projectId: p.id,
        title: p.title,
        track: p.track,
        teamName: p.team_name,
        avgTotal: 0,
        avgVoice: 0,
        avgTech: 0,
        avgMemory: 0,
        avgImpact: 0,
        avgPresentation: 0,
        judgeCount: 0,
        rank: 0,
      };
    }
    const avg = (key: keyof SectionTotals) =>
      Math.round((scores.reduce((a, s) => a + s[key], 0) / count) * 100) / 100;

    return {
      projectId: p.id,
      title: p.title,
      track: p.track,
      teamName: p.team_name,
      avgTotal: avg("total"),
      avgVoice: avg("voice"),
      avgTech: avg("tech"),
      avgMemory: avg("memory"),
      avgImpact: avg("impact"),
      avgPresentation: avg("presentation"),
      judgeCount: count,
      rank: 0,
    };
  });

  // Sort with tie-break: 1) total desc, 2) memory desc, 3) voice desc
  ranked.sort((a, b) => {
    if (b.avgTotal !== a.avgTotal) return b.avgTotal - a.avgTotal;
    if (b.avgMemory !== a.avgMemory) return b.avgMemory - a.avgMemory;
    return b.avgVoice - a.avgVoice;
  });

  ranked.forEach((r, i) => { r.rank = i + 1; });
  return ranked;
}
