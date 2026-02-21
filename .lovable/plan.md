

# Redesign Onboarding Step 3 -- "We want to take care of you"

## Overview
Replace the current dietary dropdown + language pills on Step 3 with 5 new questions, some with conditional visibility. Languages are removed from this step entirely.

## Database Changes

Add 3 new columns to the `profiles` table via migration:

- `allergies_detail` (text, nullable) -- free text for allergy details
- `meat_preference` (text, nullable) -- chicken/beef/fish/any meats
- `drinks_beer` (text, nullable) -- yes/no
- `staying_overnight` (text, nullable) -- yes/no

The existing `dietary` column will store the answer to Q1 (Vegetarian/Vegan/Allergies/No).

## Frontend Changes (src/pages/Onboarding.tsx)

### New State Variables
- `allergiesDetail` (string) -- text field for allergy list
- `meatPreference` (string) -- single select
- `drinksBeer` (string) -- single select
- `stayingOvernight` (string) -- single select

Remove: `languages` state, `LANGUAGES` constant, and language-related code from step 3.

### Step 3 UI (replaces current content)

All questions use the same pill-button pattern for single-select options:

1. **"Do you have any dietary restrictions?"** (required, single-select pills)
   - Vegetarian / Vegan / Allergies / No
   - Stored in `dietary`

2. **"If yes to allergies, please list below."** (text input)
   - Only visible when `dietary === "Allergies"`
   - Stored in `allergiesDetail`

3. **"If not, any preferences?"** (single-select pills)
   - Only visible when `dietary === "No"`
   - Chicken / Beef / Fish / Any meats
   - Stored in `meatPreference`

4. **"Do you drink beer?"** (required, single-select pills)
   - Yes / No
   - Stored in `drinksBeer`

5. **"Are you planning to stay overnight at the Builders Factory?"** (required, single-select pills)
   - Yes / No
   - Below this: a muted italic note: "No beds provided -- but couches and quiet zones available. You may bring equipment for better rest."
   - Stored in `stayingOvernight`

### Validation Update
Step 3 `canProceed` changes from `dietary && languages.length > 0` to:
`dietary && drinksBeer && stayingOvernight`

### Save Profile Update
Add `allergies_detail`, `meat_preference`, `drinks_beer`, `staying_overnight` to the profile update payload. Remove `languages` from the update.

## Conditional Visibility Approach
Simple conditional rendering using the `dietary` state value:
- `dietary === "Allergies"` shows the allergies text input
- `dietary === "No"` shows the meat preference pills
- Both hidden otherwise

When `dietary` changes, the conditionally-shown fields reset (clear `allergiesDetail` when switching away from Allergies, clear `meatPreference` when switching away from No).

## Files Modified
- **Database migration** -- add 4 new columns
- **src/pages/Onboarding.tsx** -- replace step 3 content, new state vars, updated validation and save logic

