

# Implementation Plan

This plan covers 4 changes: adding a story-style onboarding flow, updating venue references, replacing the schedule with a detailed timeline, and updating the submission deadline.

---

## 1. Onboarding Flow (New Page + Routing Logic)

### New file: `src/pages/Onboarding.tsx`

A full-screen, step-based onboarding experience with 7 screens (Welcome Splash, Steps 1-5, Done Screen). Key details:

- **State management**: A `step` state variable (0-6) controls which screen is shown
- **Progress bar**: A gradient bar at the top showing progress across steps 1-5 (hidden on splash and done screens)
- **Swipe/navigation**: "Next" and "Back" buttons; framer-motion `AnimatePresence` for smooth slide transitions between steps
- **Validation**: Steps 1-4 have required fields; Step 5 has a "Skip for now" link
- **Local state only** (no backend yet): Form data stored in component state; on completion, navigates to Home

**Screen 0 — Welcome Splash**: Animated gradient glow behind a heading, tagline with event details, "Let's go" CTA button

**Step 1 — Name + Photo**: First name and last name inputs (required), avatar circle with camera icon overlay for photo upload placeholder

**Step 2 — Skills + LinkedIn**: Multi-select skill tags using toggleable pill buttons, LinkedIn URL input

**Step 3 — Dietary + Languages**: Dietary needs dropdown (Select component), spoken languages as multi-select pills

**Step 4 — Looking for + Team status**: "I'm looking for..." multi-select pills, "Do you already have a team?" as 3-option toggle (Yes / No / Not yet)

**Step 5 — Bio + Details (skippable)**: Bio input (100 char max), Company, Role inputs, two textareas (280 char max each), "Skip for now" link

**Done Screen**: Confetti/sparkle animation (CSS keyframes), "+50 points" animated counter, badge unlock visual, "Enter the Hub" CTA navigating to `/`

### Routing changes in `src/App.tsx`

- Add `/onboarding` route outside the Layout (no bottom nav during onboarding)
- The onboarding page is a standalone full-screen experience

### Simulated "first-time" logic

Since there's no auth yet, a simple `localStorage` flag (`onboarding_completed`) will control whether the Home page redirects to `/onboarding`. Once completed, the flag is set and the user goes straight to Home on future visits.

---

## 2. Update Venue References

**Files affected:**
- `index.html` line 7: Change meta description from "Ecole 42 Paris" to "The Builders Factory, Paris"
- `src/pages/Event.tsx` line 161: Change "Ecole 42, Paris" to "The Builders Factory"
- `src/pages/Event.tsx` venue section text: Update address to "18 rue la Condamine, 75017 Paris"

---

## 3. Replace Schedule with Full Detailed Timeline

Replace the current flat `schedule` array and simple list in `Event.tsx` with a day-grouped collapsible timeline:

- **Data structure**: Array of day objects, each containing a date label and array of time-block events with icons and optional sub-items (e.g., the opening ceremony has multiple bullet points)
- **UI**: Use Collapsible components (already available) for each day section. Pre-event days (Mon Feb 23, Wed Feb 25, Thu Feb 26) shown as compact milestone cards. Hackathon days (Sat Feb 28, Sun Mar 1) shown as detailed timelines with expandable blocks
- **"Now" indicator**: A visual "NOW" badge on the current time block (based on comparing current time to event times)

The schedule tab content will be completely rewritten with the new detailed timeline data.

---

## 4. Update Submission Deadline to 5:00 PM

**Files affected:**
- `src/pages/Event.tsx` line 14: Already shows "4:45 PM" for submissions close -- change to "5:00 PM"
- `src/pages/Event.tsx` line 142: Rule text "Submission deadline: Sunday March 1, 4:45 PM" -- change to "5:00 PM"

(Note: Since we're replacing the entire schedule in change #3, the old 4:45 PM entry will be replaced with the new timeline that already uses 5:00 PM.)

---

## Technical Details

- **New file**: `src/pages/Onboarding.tsx` (~400 lines)
- **Modified files**: `src/App.tsx`, `src/pages/Event.tsx`, `src/pages/Index.tsx` (redirect logic), `index.html`
- **No new dependencies** -- uses existing framer-motion, Radix Collapsible, and Lucide icons
- **CSS additions**: Confetti/sparkle keyframe animation added to `src/index.css`

