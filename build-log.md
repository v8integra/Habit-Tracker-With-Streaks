# Build log: Habit Tracker With Streaks

One entry per slice, added by `/checkpoint` after each slice is approved. Changes between slices get their own entry (5b, 5c). The notes are what make the episode: what surprised me, what the AI got wrong, what I changed.

## Slice 1 · Project setup
- Date: 2026-11-20
- My note: "Yes, update the plan's suggested CLAUDE.md too. Lets continue"
- What changed:
  - Vite + React + TypeScript project from the official template, with strict mode on, oxlint, and a blank Today page (`src/components/TodayPage.tsx`, `src/styles.css`).
  - Added date-fns, Vitest, jsdom and Testing Library, a `test` and a `typecheck` script, and a smoke test (`src/App.test.tsx`).
  - Replaced `.gitignore` with Vite's version; CLAUDE.md's type-check command is now `npm run typecheck`.
- Plan changes:
  - Pre-build fixes: kept the existing CLAUDE.md; pre-approved test dev dependencies; removed `archived`; name, color and delete rules; ignore dates before `createdAt` or after today; streak functions take `today`; heatmap uses weekday rows with Sunday on top; "last 7 days" means today plus the 6 days before; midnight rollover; import validation; "Archiving habits" moved to Not in this version; added the "Changes during the build" section.
  - Suggested CLAUDE.md: type check is now `npm run typecheck`.
- Tests: 1 passed, 0 failed
