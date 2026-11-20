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

## Slice 2 · Date and streak logic
- Date: 2026-11-20
- My note: "The code looks clean. Need to check why the terminal is opening in incorrect locations."
- What changed:
  - Added `src/lib/dates.ts`: local "YYYY-MM-DD" helpers built on date-fns (`toDateKey`, `todayKey`, `parseDateKey`, `isDateKey`, `addDaysToKey`).
  - Added `src/lib/streaks.ts`: `currentStreak`, `bestStreak` and `countableDates`, which ignore duplicates, invalid dates, dates before `createdAt` and dates after today.
  - Added `src/lib/dates.test.ts` (21 tests) and `src/lib/streaks.test.ts` (19 tests), covering every case in the plan plus leap day, daylight saving and 11:59 pm local time. They also pass in six time zones.
  - Removed `src/lib/.gitkeep`.
- Plan changes: None
- Tests: 41 passed, 0 failed

## Slice 3 · Storage
- Date: 2026-11-20
- My note: "Code looks clean. No issues seen at this time. Lets continue."
- What changed:
  - Added `src/lib/types.ts` with the `Habit`, `Completions` and `AppData` types.
  - Added `src/lib/storage.ts`. `loadData` never throws and returns a status (`ok`, `empty`, `corrupt` or `unavailable`). `saveData` returns false instead of throwing. `parseAppData` validates the data's shape, and import will reuse it in slice 8.
  - Added `src/lib/storage.test.ts` (37 tests): saving and loading back, broken data, storage that fails on read or write, habit validation, date clean-up, and a `__proto__` habit id.
- Plan changes: None
- Tests: 78 passed, 0 failed
