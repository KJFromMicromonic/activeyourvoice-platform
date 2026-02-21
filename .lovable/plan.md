

# Fix: "Enter the Hub" Redirects to Login Page

## Root Cause

There are two scenarios causing this issue:

1. **Unauthenticated users** ("Don't log in" path): The `saveProfile` function detects no user and returns early without saving. Then `finish()` navigates to `/`, but `AuthGuard` sees no session and redirects to `/auth`. This is a dead end -- unauthenticated users can never reach the dashboard.

2. **Authenticated users**: The save works, but `AuthGuard` re-fetches `onboarding_completed` fresh on every mount. There may be a timing issue where the profile query runs before the database write fully propagates, causing a brief `onboarded = false` state that redirects to `/onboarding`.

## Fix

### 1. Onboarding.tsx -- Redirect unauthenticated users to /auth after onboarding

- In the `finish` function, check if there's an active session first.
- If no session exists, redirect to `/auth` instead of `/` (since they can't access the dashboard without logging in). Show a toast like "Sign in to access the Hub."
- For authenticated users, keep `navigate("/")`.

### 2. App.tsx -- Wrap /onboarding in AuthGuard (preferred alternative)

A cleaner approach: move the `/onboarding` route **inside** `AuthGuard` so only authenticated users can access it. The "Don't log in" button on the Auth page would need to be removed or repurposed (since onboarding without auth leads to a dead end anyway -- data can't be saved, and the dashboard can't be accessed).

**Recommended approach**: Keep `/onboarding` outside AuthGuard but handle both paths:

- **Authenticated user**: `saveProfile` saves data normally, `finish()` navigates to `/`, `AuthGuard` sees `onboarding_completed = true` and lets them through.
- **Unauthenticated user**: `saveProfile` skips the DB write, `finish()` navigates to `/auth` with a toast prompting them to sign in.

### 3. AuthGuard -- Prevent stale onboarding check

- After `saveProfile` sets `onboarding_completed: true`, the AuthGuard on `/` re-fetches the profile. To avoid any race condition, add a small state optimization: when navigating from onboarding to `/`, pass a flag (e.g., URL search param `?onboarded=1`) that AuthGuard can use to skip the re-check and trust the user just completed onboarding.

## Technical Details

### Onboarding.tsx changes
```text
finish function:
  1. Check supabase.auth.getUser()
  2. If user exists -> navigate("/")
  3. If no user -> toast("Please sign in to access the Hub") + navigate("/auth")
```

### App.tsx changes (optional optimization)
```text
AuthGuard:
  - Check for ?onboarded=1 search param
  - If present, skip the profiles query and set onboarded = true immediately
  - Remove the param from the URL to keep it clean
```

### Files Modified
- `src/pages/Onboarding.tsx` -- update `finish` to handle unauthenticated users
- `src/App.tsx` -- (optional) optimize AuthGuard to trust onboarding completion flag
