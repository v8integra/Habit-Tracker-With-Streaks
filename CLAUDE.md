# Habit Tracker

## Commands
- Dev server: npm run dev
- Tests: npm test
- Type check: npx tsc --noEmit
- Build: npm run build

## Rules
- TypeScript strict mode. No `any`.
- Dates are local "YYYY-MM-DD" strings. Use date-fns for date math.
- Business logic lives in src/lib as pure functions with tests.
- Components stay small; one component per file.
- No new dependencies without asking.
- Build one slice at a time and stop for review after each.
- After I approve a slice, I run /checkpoint, which commits it. Don't commit on your own.

## Changes during the build
- The plan (`habit-tracker-plan.md`) is the source of truth. When I ask for something the plan doesn't cover, or that changes it, don't build it yet. First propose the exact plan edit:
  - add the change to the right section (for example "Must have"), and
  - add a line under "Changes during the build" at the end of the plan: `- Nb · <short title>: <one sentence>, from my slice N note`. Use the letter after the slice it follows (5b, then 5c).
- Wait for my OK on the plan edit, then build only that change and stop. I'll run `/checkpoint Nb` for it.
- Never fold a change into the next numbered slice.
