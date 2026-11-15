# Habit Tracker With Streaks: Build Plan

Build-along #1 · App · Difficulty: Easy · Target release: Tue Nov 24, 2026

## Goal

A small, polished web app where someone adds daily habits, checks them off each day, and sees their streaks and a calendar heatmap. Everything runs in the browser and saves locally. No accounts, no server.

**One sentence:** For anyone building better habits, it shows at a glance what they did today and how long their streaks are.

## How to work (instructions for Claude Code)

1. Read this whole plan first. Then build **one slice at a time**, in the order under "Build slices".
2. After each slice, stop and summarize what changed and how to test it. Wait for my OK before the next slice.
3. Keep changes small and focused. Don't add features from "Not in this version".
4. Write tests for the streak and date logic before or alongside the code (slice 2).
5. If anything in this plan is unclear or seems wrong, ask instead of guessing.
6. I'm on Windows. Use commands that work in PowerShell.

## Must have

- Add, rename and delete habits (name + color).
- Check a habit off for today with one click; click again to undo.
- Current streak and best streak for each habit.
- A calendar heatmap per habit for the last 12 weeks.
- A "Today" view: all habits with a checkbox and a progress bar ("3 of 5 done").
- Data saved in localStorage, so a page refresh keeps everything.
- Export and import data as a JSON file (backup).
- Works and looks good on desktop and phone widths.
- Light and dark mode, following the system setting.

## Not in this version

- Accounts, login, cloud sync or a backend.
- Habits that aren't daily (weekly, "3 times a week"). Note it as a future idea only.
- Reminders or notifications.
- Charts beyond the heatmap.
- Editing past days older than 7 days.

## Tech stack

- Vite + React + TypeScript
- Plain CSS modules or a single `styles.css` with CSS variables (no UI framework)
- Vitest + React Testing Library for tests
- `date-fns` for date math (only date library allowed)
- No other dependencies without asking me first

## Data model

```ts
type Habit = {
  id: string;          // crypto.randomUUID()
  name: string;        // 1–40 characters
  color: string;       // one of 8 preset colors
  createdAt: string;   // "YYYY-MM-DD"
  archived: boolean;
};

type Completions = Record<string, string[]>; // habitId -> list of "YYYY-MM-DD"

type AppData = {
  version: 1;
  habits: Habit[];
  completions: Completions;
};
```

- Store under one localStorage key: `habit-tracker:v1`.
- Dates are **local** calendar dates as `YYYY-MM-DD` strings, never timestamps, so time zones can't shift a check-off to the wrong day.
- If saved data is missing or broken, start fresh and show a small notice instead of crashing.

## Streak rules (put these in tests)

- **Current streak:** the number of days in a row the habit was completed, counting back from today. If today isn't done yet but yesterday was, the streak still counts from yesterday (the user still has today to keep it alive).
- If neither today nor yesterday is done, the current streak is 0.
- **Best streak:** the longest run of consecutive completed days ever.
- Days before the habit's `createdAt` never count against it.
- Duplicate dates in the data are ignored.

Test cases to include at minimum: no completions; only today; only yesterday; a 5-day run ending today; a 5-day run ending yesterday; a run broken two days ago; best streak in the past longer than the current one; a month boundary (Jan 31 → Feb 1); a year boundary (Dec 31 → Jan 1); duplicate dates.

## Screens

1. **Today (home)**
   - Header with the date and the progress bar.
   - A list of habit cards: color dot, name, checkbox, current streak ("🔥 12" or "12-day streak").
   - "Add habit" button.
   - Empty state: a friendly message and an "Add your first habit" button.
2. **Habit detail** (opens from a card)
   - Name, current streak, best streak, total completions.
   - 12-week heatmap (7 rows × 12 columns, today in the bottom-right). Tapping a day in the last 7 days toggles it.
   - Rename, change color, delete (with a confirm step).
3. **Settings** (small panel or page)
   - Export JSON, import JSON (with a confirm before replacing data), clear all data (with a confirm).

## Build slices (in order)

1. **Project setup.** Vite + React + TS, Vitest, folder structure, a blank Today page, `npm run dev` and `npm test` both working. Create `CLAUDE.md` (see below).
2. **Date and streak logic.** Pure functions in `src/lib/streaks.ts` and `src/lib/dates.ts` with the tests above. No UI yet.
3. **Storage.** `src/lib/storage.ts` to load and save `AppData`, with safe handling of missing or broken data, plus tests.
4. **Today view.** Add habits, list them, check off today, progress bar, empty state.
5. **Streaks on cards.** Show the current streak on each card; it updates when checking or unchecking.
6. **Habit detail + heatmap.** Detail screen, stats, 12-week heatmap, toggling the last 7 days.
7. **Edit and delete.** Rename, recolor, delete with a confirm.
8. **Settings.** Export, import and clear data.
9. **Polish.** Dark mode, phone layout, keyboard focus states, small animations on check-off, final pass for accessibility (labels on all buttons and checkboxes).
10. **Ship.** A production build, and deploy steps for a free static host (I'll pick the host). README with what the app does and how to run it.

## Definition of done

- All tests pass with `npm test`.
- No TypeScript errors, and no console errors in the browser.
- Refreshing the page keeps all data.
- Works at 375 px wide (phone) and 1440 px wide (desktop).
- Every button and checkbox can be used with the keyboard and has an accessible label.

## Suggested CLAUDE.md

```md
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
```

## Notes for the video (not for Claude Code)

- **Hook (first 20 seconds):** show the finished app with a long streak and a full heatmap, then "Let's build this from scratch with Claude Code."
- **Moments to show on screen:** writing this plan; the streak tests catching a bug (the month or year boundary is a good candidate); reviewing a diff and pushing back on something; the final deploy and live link.
- **Shorts from this build:** "The one bug every habit tracker has (time zones)" and "Plan → build → test in 60 seconds."
- **End screen:** link to Snake With Power-Ups (Saturday's build) and the AI engineering workflow video.
