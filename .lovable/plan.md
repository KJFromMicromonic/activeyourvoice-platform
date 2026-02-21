

# Fix "Enter the Hub" + Connect Pages to Real Data

## Overview
The "Enter the Hub" button already navigates to "/" and saves profile data correctly. The core issues are: (1) unauthenticated users (via "Don't log in") hit errors on save, (2) the Home/People/Profile pages show hardcoded mock data instead of real database data, and (3) there are no `teams` or `project_ideas` tables yet for the Teams page.

## Changes

### 1. Onboarding.tsx -- Guard the save for unauthenticated users
- In `saveProfile`, if no authenticated user is found, skip the database save gracefully and still navigate to "/". This handles the "Don't log in" bypass path.
- The `finish` function (`navigate("/")`) already works correctly for authenticated users since `onboarding_completed: true` is set during step 5.

### 2. Index.tsx (Home Dashboard) -- Show real user data
- Fetch the current user's profile from the `profiles` table on mount.
- Display their real `first_name` in the welcome banner ("Welcome back, Sarah").
- Calculate real profile completion % based on which fields are filled (first_name, last_name, avatar_url, bio, skills, company, role, linkedin, dietary, looking_for, team_status).
- Show real team status ("Solo" vs team name) from `team_status`.
- Show real points from `profiles.points`.

### 3. People.tsx -- Fetch real profiles from database
- Replace the `mockPeople` array with a query to `profiles` table: `supabase.from("profiles").select("*").eq("onboarding_completed", true)`.
- Map profile fields to the card UI: `first_name + last_name` for name, `bio`, `skills`, `company`, `avatar_url` (or initials fallback), and `team_status` to determine "Looking for team" badge.
- Keep the search and skill filter functionality working against real data.

### 4. Profile.tsx -- Show current user's saved data
- Fetch the authenticated user's profile from `profiles` table on mount.
- Display real values in the "My Info" tab (bio, skills, company, role, linkedin, dietary, looking_for).
- Calculate real profile completion steps (which fields are filled vs empty).
- Show real points and avatar.

### 5. Teams.tsx -- Keep mock data (no tables exist)
- The `teams` and `project_ideas` tables don't exist in the database yet. Creating them is a separate feature.
- Keep the current mock data for tracks and project ideas as placeholder content.
- No database changes needed for this page right now.

### 6. No database changes required
- All needed columns already exist in the `profiles` table.
- `onboarding_completed` is already being set to `true` in the save function.
- The AuthGuard in `App.tsx` already checks `onboarding_completed` and prevents re-showing onboarding on subsequent logins.

---

## Technical Details

### Profile Completion Calculation (Index.tsx + Profile.tsx)
```text
Fields checked: first_name, last_name, avatar_url, bio, skills (length > 0),
company, role, linkedin, dietary, looking_for (length > 0), team_status
Completion % = (filled fields / total fields) * 100
```

### People.tsx Query
```text
SELECT * FROM profiles WHERE onboarding_completed = true
- Map to card: first_name + last_name, bio, skills[], company, avatar_url
- "Looking for team" badge shown when team_status = "No" or "Not yet"
- Search filters on name, bio, company
- Skill filter checks skills[] array
```

### Files Modified
- `src/pages/Onboarding.tsx` -- graceful handling for unauthenticated save
- `src/pages/Index.tsx` -- fetch real profile, real completion %, real points
- `src/pages/People.tsx` -- replace mock data with profiles query
- `src/pages/Profile.tsx` -- fetch and display current user's real profile data

