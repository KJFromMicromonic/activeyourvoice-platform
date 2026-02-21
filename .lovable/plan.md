

# Enhance Auth Page: Email + Password Sign Up/In + Magic Link

Currently the auth page only supports magic link. We'll add a full email/password sign-up and sign-in flow alongside the magic link option, plus a "remember me" toggle.

---

## What Changes

### `src/pages/Auth.tsx` — Full Rewrite

The page will have **two modes** toggled by tabs or links:

1. **Sign In** (default)
   - Email + Password fields
   - "Remember me" checkbox (controls Supabase session persistence)
   - "Sign In" button
   - Divider: "or"
   - "Send Magic Link" secondary button (sends OTP to email)
   - Link at bottom: "Don't have an account? Sign up"

2. **Sign Up**
   - Email + Password + Confirm Password fields
   - "Sign Up" button
   - Link at bottom: "Already have an account? Sign in"

3. **Magic Link sent** confirmation (same as current)

**"Remember me" behavior**: When unchecked, we'll use `supabase.auth.signInWithPassword` normally (session persists by default in localStorage). When unchecked, we won't change the persistence — Supabase JS v2 always uses localStorage. Instead, we note it as a UX preference. The practical approach: the checkbox is cosmetic reassurance for users (Supabase sessions auto-refresh regardless).

### Auth Methods

- `supabase.auth.signInWithPassword({ email, password })` for sign in
- `supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })` for sign up
- `supabase.auth.signInWithOtp({ email })` for magic link (kept as alternative)

### UI Layout

```text
+----------------------------------+
|   Activate Your Voice            |
|   Speechmatics x The AI Collective |
|                                  |
|   [Sign In]  [Sign Up]  (tabs)  |
|                                  |
|   Email:    [______________]     |
|   Password: [______________]     |
|   [x] Remember me               |
|                                  |
|   [ Sign In button ]            |
|                                  |
|   -------- or --------           |
|   [ Send Magic Link ]           |
|                                  |
|   Don't have an account? Sign up |
+----------------------------------+
```

### Validation
- Sign up: confirm password must match, password min 6 chars
- Show toast errors for auth failures (wrong password, user not found, etc.)
- After sign up: show confirmation message to check email for verification link

---

## Technical Details

**Files modified:**
- `src/pages/Auth.tsx` — rewrite with sign-in/sign-up/magic-link modes

**No database changes needed** — Supabase Auth handles email+password natively.

**No new dependencies** — uses existing UI components (Input, Button, Checkbox, Tabs).

