

# Redesign Onboarding Steps to Match Splash Energy

## Overview
Transform the flat, empty-feeling onboarding steps (1-5) into an immersive cinematic experience that matches the splash screen. The animated mesh background and waveform persist continuously while only form content transitions between steps.

## Architecture

The MeshBackground and Waveform components currently live inline in `Auth.tsx`. I will extract them into shared components, then restructure `Onboarding.tsx` so the background layer sits **outside** AnimatePresence -- making it persistent while only the form slides/fades.

```text
+----------------------------------+
|  MeshBackground (canvas, fixed)  |
|  +----------------------------+  |
|  |  Back button (top-left)    |  |
|  |  Progress bar + "1/5"      |  |
|  |  Waveform (subtle, static) |  |
|  |  +----------------------+  |  |
|  |  | AnimatePresence      |  |  |
|  |  |   Title (Playfair)   |  |  |
|  |  |   Subtitle           |  |  |
|  |  |   Gradient divider   |  |  |
|  |  |   Form fields        |  |  |
|  |  +----------------------+  |  |
|  |  Next CTA (bottom, full-w) |  |
|  +----------------------------+  |
+----------------------------------+
```

---

## Files to Create

### `src/components/MeshBackground.tsx`
Extract the animated canvas mesh gradient from Auth.tsx (the 4-blob radial gradient animation on deep charcoal). Reusable component, renders a fixed full-screen canvas.

### `src/components/Waveform.tsx`
Extract the animated SVG waveform from Auth.tsx. Accept an optional `subtle` prop that reduces opacity and max-width for use in onboarding steps (vs. full-size on splash).

---

## Files to Modify

### `src/pages/Auth.tsx`
- Replace inline MeshBackground and Waveform definitions with imports from the new shared components.
- No visual changes.

### `src/pages/Onboarding.tsx` -- Main Redesign

**Layout restructure:**
- Add `MeshBackground` as a fixed layer behind everything (persistent, never re-renders between steps).
- Add subtle `Waveform` at top of screen, outside AnimatePresence, so it stays continuous.
- Progress bar sits below waveform with gradient indicator.

**"Back" button:**
- Move from bottom-left button to a text link in the **top-left corner** (above progress bar area), using ChevronLeft icon + "Back" text. Styled as ghost/text.

**Step titles:**
- Apply Playfair Display serif font with purple-to-blue gradient fill (same inline style as splash "Activate Your Voice").
- Increase size to `text-3xl` or `text-4xl`.
- Left-aligned, positioned at ~15% from top (using `pt-[15vh]` or similar).

**Gradient divider line:**
- Add a thin `<div>` with `gradient-primary h-px w-16 rounded-full` between the title/subtitle and the form content area.

**Avatar circle (Step 1):**
- Increase from `w-24 h-24` to `w-[120px] h-[120px]`.
- Add `animate-[subtle-pulse_4s_ease-in-out_infinite]` to the glow ring for a breathing effect.

**Input fields (all steps):**
- Replace `bg-muted/50 border-border` with glassmorphism: `bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-xl`.
- Add focus styles: `focus:border-purple-500/50 focus:shadow-[0_0_15px_hsl(263_84%_58%_/_0.15)]`.

**Select trigger (Step 3):**
- Same glassmorphism treatment as inputs.

**Textarea (Step 5):**
- Same glassmorphism treatment.

**"Next" button:**
- Make full-width (`w-full`) instead of `flex-1` sharing space with Back.
- Keep gradient variant. Anchored to bottom of screen.
- Step 5 keeps "Skip for now" as a text link above the main CTA.

**Content positioning:**
- Remove `items-center justify-center` from the main content area. Instead use `pt-[15vh]` to push content to upper portion, removing dead space above.

### `src/components/ui/progress.tsx`
- Change indicator class from `bg-primary` to `gradient-primary` so the progress bar uses the purple-to-blue gradient.

### `src/index.css`
- Add a `.glass-input` utility class for the frosted glass input styling with focus glow (reusable across all form fields).

---

## Transition Strategy

The waveform and mesh background are rendered **outside** the `AnimatePresence` block, so they never unmount or re-animate. Only the inner form content (title, fields, buttons) slides and fades via the existing `slideVariants`. This creates the feeling of moving through one continuous immersive experience.

---

## Summary of Visual Changes
- Animated mesh gradient background on all steps (matches splash)
- Subtle waveform at top (persistent across steps)
- Playfair Display serif titles with gradient text
- Content pushed to upper 15% (no dead space)
- Glassmorphism inputs with purple focus glow
- Larger avatar circle (120px) with pulsing glow
- Gradient divider line between title and form
- Full-width Next CTA at bottom
- Back as top-left text link
- Gradient progress bar

