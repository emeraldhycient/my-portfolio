# Branchlog

A developer portfolio with two views of the same work: a Git graph and a reverse chronological migration log. Select a node or a log entry to read what changed, why it changed, and how it was built. Jules Park and all six projects are mock content.

## Run it

Run `npm run dev` and open `http://127.0.0.1:4173/`. The local server watches the site directory and refreshes open tabs when a file changes. No dependency installation or build is needed. To select a different port, run `PORT=4174 npm run dev`.

## Replace the mock content

Edit `dist/portfolio.js`. The `profile` object holds the name, introduction, README, location and email; change `sample` to `false` once the information is real.

Each migration has a stable `id` used in its URL, an increasing `number`, a date, a short display hash, a branch, and a list of earlier migration IDs in `parents`. Both graphs use these parent relationships. The hash is a display label; the site does not read or require a real Git repository. Keep the IDs stable when editing a project so shared links continue to work.

The optional `art` field selects a cover from `dist/art.js`. Unknown cover names use the notebook illustration. Dates use ISO format (`YYYY-MM-DD`).

The `dist/` folder is the complete static site. Fonts are self-hosted; the font licenses are beside the assets in `dist/fonts/`. The local reload endpoint exists only in the development server.
