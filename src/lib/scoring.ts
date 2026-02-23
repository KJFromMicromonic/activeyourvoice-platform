export interface ScoreRow {
  conversation_ux: number | null;
  task_autonomy: number | null;
  memory_adaptivity: number | null;
  real_world_impact: number | null;
  technical_depth: number | null;
  partner_utilisation: number | null;
  product_story: number | null;
}

export const CRITERIA = [
  {
    key: "conversation_ux" as const,
    label: "Conversation Feel & UX",
    max: 20,
    hint: "How natural, fast, and effortless is the interaction across both voice and interface? Do the visuals, states, and prompts support the conversation?",
  },
  {
    key: "task_autonomy" as const,
    label: "Task Completion & Autonomy",
    max: 15,
    hint: "Does the agent actually get real tasks done end-to-end with minimal hand-holding? Does it take intelligent actions via tools/APIs, not just talk?",
  },
  {
    key: "memory_adaptivity" as const,
    label: "Memory & Adaptivity",
    max: 20,
    hint: "Does it remember relevant context (short-term + long-term) and change behavior accordingly? Is there any loop for improving from interactions?",
  },
  {
    key: "real_world_impact" as const,
    label: "Real-World Impact",
    max: 15,
    hint: "Is there a sharp problem and a clearly defined user? Would this clearly matter in the real world (time saved, quality, delight)?",
  },
  {
    key: "technical_depth" as const,
    label: "Technical Depth & Difficulty",
    max: 10,
    hint: "How non-trivial is the technical work (architecture, reasoning, robustness)? Did they tackle something meaningfully hard vs a thin wrapper?",
  },
  {
    key: "partner_utilisation" as const,
    label: "Partner Utilisation",
    max: 10,
    hint: "Do they make smart, relevant use of partner tech (Speechmatics, Backboard, etc.)? Is that integration essential to the solution?",
  },
  {
    key: "product_story" as const,
    label: "Product Story & Craft",
    max: 10,
    hint: 'One-sentence clarity: "It\'s for X, it does Y, and voice is the best way because Z." Demo, UI, and flows are tight; it feels like a real product.',
  },
] as const;

export type ScoreKey = (typeof CRITERIA)[number]["key"];

export function calcTotal(s: ScoreRow): number {
  return (s.conversation_ux ?? 0) +
    (s.task_autonomy ?? 0) +
    (s.memory_adaptivity ?? 0) +
    (s.real_world_impact ?? 0) +
    (s.technical_depth ?? 0) +
    (s.partner_utilisation ?? 0) +
    (s.product_story ?? 0);
}

export interface RankedProject {
  projectId: string;
  title: string;
  track: string;
  teamName: string;
  avgTotal: number;
  avgScores: Record<ScoreKey, number>;
  judgeCount: number;
  rank: number;
}

export function rankProjects(
  projects: { id: string; title: string; track: string; team_name: string }[],
  allScores: (ScoreRow & { project_id: string })[]
): RankedProject[] {
  const grouped: Record<string, ScoreRow[]> = {};
  for (const score of allScores) {
    if (!grouped[score.project_id]) grouped[score.project_id] = [];
    grouped[score.project_id].push(score);
  }

  const ranked: RankedProject[] = projects.map((p) => {
    const scores = grouped[p.id] || [];
    const count = scores.length;
    const emptyAvg: Record<ScoreKey, number> = {
      conversation_ux: 0, task_autonomy: 0, memory_adaptivity: 0,
      real_world_impact: 0, technical_depth: 0, partner_utilisation: 0, product_story: 0,
    };

    if (count === 0) {
      return { projectId: p.id, title: p.title, track: p.track, teamName: p.team_name, avgTotal: 0, avgScores: emptyAvg, judgeCount: 0, rank: 0 };
    }

    const avgScores = { ...emptyAvg };
    for (const key of Object.keys(avgScores) as ScoreKey[]) {
      avgScores[key] = Math.round((scores.reduce((a, s) => a + (s[key] ?? 0), 0) / count) * 10) / 10;
    }
    const avgTotal = Math.round((scores.reduce((a, s) => a + calcTotal(s), 0) / count) * 10) / 10;

    return { projectId: p.id, title: p.title, track: p.track, teamName: p.team_name, avgTotal, avgScores, judgeCount: count, rank: 0 };
  });

  // Sort: total desc, then memory desc, then conversation desc
  ranked.sort((a, b) => {
    if (b.avgTotal !== a.avgTotal) return b.avgTotal - a.avgTotal;
    if (b.avgScores.memory_adaptivity !== a.avgScores.memory_adaptivity) return b.avgScores.memory_adaptivity - a.avgScores.memory_adaptivity;
    return b.avgScores.conversation_ux - a.avgScores.conversation_ux;
  });

  ranked.forEach((r, i) => { r.rank = i + 1; });
  return ranked;
}
