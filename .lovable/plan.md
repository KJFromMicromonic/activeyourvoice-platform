
# Redesign: Home Dashboard -- Match the Onboarding Energy

## Overview
Transform the Home dashboard from its current flat, functional appearance into a cinematic, premium experience that matches the onboarding screens. This involves adding the MeshBackground, Waveform, Playfair Display serif font, glassmorphism upgrades, and removing the Icebreaker Challenge section.

## Changes

### 1. `src/pages/Index.tsx` -- Full visual overhaul

**Background and Structure:**
- Wrap the entire page in a relative container with the `MeshBackground` component (same as onboarding) behind all content
- Add a subtle `Waveform` component at the top behind the welcome text (low opacity, fixed/absolute positioned)
- Change outer container to position relative with overflow hidden

**Welcome Header:**
- Keep "Welcome back," in Inter (sans-serif)
- Render the user's name (`displayName`) in Playfair Display with gradient text, using the same `titleStyle` object from onboarding
- Replace the tagline "In 2026, the interface is no longer a screen..." with a dynamic countdown line: "6 days until we build the future" (calculated from TARGET_DATE)

**Countdown Timer Card:**
- Add a gradient glow border using inline style: `border-color: hsl(263 84% 58% / 0.25)` and `box-shadow` with purple/blue glow
- Make countdown numbers larger (`text-3xl font-bold text-white` instead of gradient-text)
- Individual number boxes get enhanced glassmorphism: `background: rgba(255,255,255,0.06)`, subtle border
- Add a dark purple gradient background inside the card

**Your Status Card:**
- Enhanced glassmorphism with purple-tinted border (`border-color: rgba(139, 92, 246, 0.15)`)
- Completion percentage: larger, bolder, gradient-text (already has this)
- Team status dot: change from `bg-destructive` (red) to `bg-amber-500` with a CSS pulse animation for "solo" users
- Points: add a text-shadow glow effect in purple

**Quick Action Buttons:**
- Add `hover:border-primary/30` for purple border on hover
- Add `active:scale-95 transition-transform` for tap animation
- Wrap icons in a small gradient background circle/pill

**Remove Icebreaker Challenge:**
- Delete the entire Icebreaker Challenge section (lines 192-211)

**Announcements Section:**
- Section label: add `tracking-[0.2em]` for wider letter-spacing
- Timestamp color: change from `text-muted-foreground/60` to a muted purple (`text-primary/40`)
- Pin icon already uses `text-primary` (purple) -- keep as is

**Achievements Section:**
- Add a badge count header: "Your Achievements -- 1/6 earned" (dynamically counted)
- Earned badges: add `glow-ring` class for purple glow around them
- Unearned badges: add `backdrop-blur-sm` and a frosted overlay instead of just opacity-30

**Spacing:**
- Change outer container from `space-y-6` to `space-y-8` for more breathing room between sections
- Add bottom padding for scroll clearance past the nav bar

### 2. `src/index.css` -- New utility classes

Add these CSS classes to support the dashboard redesign:
- `.glow-border` -- purple-to-blue gradient border glow for special cards
- `.pulse-amber` -- pulsing amber dot animation for team status
- `.badge-locked` -- frosted glass overlay for unearned badges

### 3. No changes to other files
- `MeshBackground` and `Waveform` components already exist and are reused as-is
- Layout.tsx stays unchanged
- No database changes needed

## Technical Details

### Import additions in Index.tsx
```text
+ import MeshBackground from "@/components/MeshBackground";
+ import Waveform from "@/components/Waveform";
```

### Title style object (reused from onboarding)
```text
const titleStyle = {
  fontFamily: "'Playfair Display', serif",
  background: "linear-gradient(135deg, hsl(263,84%,58%), hsl(217,91%,60%))",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};
```

### Dynamic subtitle
```text
const daysUntil = Math.max(0, Math.ceil((TARGET_DATE.getTime() - Date.now()) / 86400000));
subtitle = `${daysUntil} days until we build the future`
```

### Icebreaker removal
The entire block from lines 192-211 (the motion.div containing the Icebreaker Challenge) will be deleted. The `Sparkles` import can also be removed.

### Badge count
```text
const earnedCount = badges.filter(b => b.earned).length;
// Header: "Your Achievements -- {earnedCount}/{badges.length} earned"
```

### New CSS: pulse-amber animation
```text
@keyframes pulse-amber {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0); }
}
```

### Files Modified
- `src/pages/Index.tsx` -- full visual overhaul + remove icebreaker
- `src/index.css` -- add new utility classes for glow border, pulse amber, badge locked
