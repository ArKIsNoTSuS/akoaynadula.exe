# AD-Vision
Your Vision. Your University. Your Future. A static admission and exam-prep platform (React + Vite, HashRouter, localStorage).

## Deploy to GitHub Pages
1. Create a GitHub repository and upload every file in this folder to the `main` branch.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes the site.
4. Open the URL shown in the Actions run (usually `https://<username>.github.io/<repo>/`).

## Run locally
`npm install` then `npm run dev`. Build with `npm run build`.

## Base URL
By default the site uses a relative base (`./`), which works under any repository name. To force an absolute path, set `VITE_BASE` in the workflow build step, e.g. `VITE_BASE: /your-repo-name/`.

## Features
Favorites, tracked deadlines, bookmarks, completion tracking, study tasks, quizzes, and multiple local profiles, all stored in localStorage (no account).

## Why it works on GitHub Pages
- `vite.config.js` uses `base: './'`, so assets load under any repository path.
- `HashRouter` means URLs like `/#/calendar` never 404 on refresh.
- All data lives in `src/data/*.json`. User progress is saved in the browser's localStorage.

## Replace the demo data
Exam dates, materials and review centers are **demonstration data** (flagged `demo: true`). Verify every date on the university's official admissions page before publishing. Review centers are fictional and are not partners of AD-Vision.
