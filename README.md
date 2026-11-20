# Habit Tracker With Streaks

A small web app for daily habits. Add a few habits, check them off each day, and watch your streaks grow. Everything runs in your browser and is saved there. There are no accounts and no server.

## What it does

- **Today view:** every habit with a checkbox, its current streak (🔥 12), and a progress bar ("2 of 3 done").
- **Habit detail:** current streak, best streak, total days done, and a 12-week heatmap. You can change any of the last 7 days from the heatmap.
- **Edit and delete:** rename a habit or change its color. Deleting asks you to confirm first.
- **Backup:** export everything to a JSON file and import it again, for example to move to another browser or device. You can also clear all data.
- **Works everywhere:** phone and desktop widths, light and dark mode (following your system setting), keyboard only, and screen readers.

### How streaks are counted

- **Current streak:** the number of days in a row you've done the habit, counting back from today. If you haven't done it yet today but did yesterday, the streak still counts, because you have the rest of today to keep it going.
- **Best streak:** the longest run ever.
- Days before you created a habit never count against it.
- Dates are your **local** calendar dates (`YYYY-MM-DD`), not timestamps, so a late-night check-off never slips into tomorrow.

### Where your data lives

Your habits are saved in this browser's `localStorage`, under the key `habit-tracker:v1`. They stay on this device and in this browser only. Use **Settings → Export JSON** to keep a backup or move your data. Clearing your browser's site data deletes it.

## Run it locally

You need [Node.js](https://nodejs.org/) 22 or newer. It was built and tested with Node 24. In PowerShell, from this folder:

```powershell
npm install
```

```powershell
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Starts the dev server with hot reload               |
| `npm test`          | Runs the tests and reruns them when files change    |
| `npm test -- --run` | Runs the tests once                                 |
| `npm run typecheck` | Checks TypeScript                                   |
| `npm run lint`      | Lints with oxlint                                   |
| `npm run build`     | Type-checks, then builds the production site into `dist/` |
| `npm run preview`   | Serves the built `dist/` folder at http://localhost:4173 |

## Deploy

`npm run build` makes a plain static site in `dist/`: one HTML file, one JS file, one CSS file and a favicon. Any free static host can serve it. You don't need any special settings:

- **Asset paths are relative,** so the site works both at a domain root and under a sub-path like `/Habit-Tracker-With-Streaks/` on GitHub Pages.
- **Screens use the URL hash** (`#/habit/…`, `#/settings`), so the host needs no redirect or rewrite rules.

Pick one host. For all of them the settings are the same:

- **Build command:** `npm run build`
- **Output directory:** `dist`

### GitHub Pages

1. On GitHub, go to the repository's **Settings → Pages**, and set **Source** to **GitHub Actions**.
2. Add a workflow at `.github/workflows/deploy.yml` that installs, builds and uploads `dist/` with `actions/upload-pages-artifact` and `actions/deploy-pages`. GitHub suggests a "Static HTML" starter workflow on the same Pages screen; change its upload `path` to `dist` and add `npm ci` and `npm run build` steps before the upload.
3. Push to `main`. The site goes live at `https://<your-user>.github.io/Habit-Tracker-With-Streaks/`.

### Netlify

1. **Add new site → Import an existing project**, then pick this repository.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Deploy. Every push to `main` redeploys automatically.

### Vercel

1. **Add New → Project**, then import this repository. Vercel detects Vite automatically.
2. Check that the output directory is `dist`, then deploy.

### Cloudflare Pages

1. **Workers & Pages → Create → Pages → Connect to Git**, then pick this repository.
2. Framework preset: **Vite** (build command `npm run build`, output directory `dist`).
3. Save and deploy.

### Any other static host

Run `npm run build` and upload the contents of `dist/`.

## Project structure

```
src/
  lib/          Pure logic with tests: dates, streaks, storage, backup, heatmap, habits
  hooks/        React hooks: saved data, today's date, the current screen, page title
  components/   One component per file
  *.test.tsx    App-level tests (Today, detail, edit/delete, settings, accessibility)
```

Built with Vite, React, TypeScript, `date-fns`, Vitest and React Testing Library.

## Ideas for later

These are not in this version:

- Habits that aren't daily (weekly, or "3 times a week")
- Reminders or notifications
- Sync across devices
- More charts
