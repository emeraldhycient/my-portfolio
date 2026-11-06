# Branchlog

A developer portfolio with two views of the same work: a Git graph and a reverse chronological migration log. Select a node or a log entry to read what changed, why it changed, and how it was built. Jules Park and all six projects are mock content.

## Run it

Run `npm run dev` and open `http://127.0.0.1:4173/`. The local server watches the site directory and refreshes open tabs when a file changes. No dependency installation or build is needed. To select a different port, run `PORT=4174 npm run dev`.

## Replace the mock content

Edit `dist/portfolio.js`. The `profile` object holds the name, introduction, README, location and email; change `sample` to `false` once the information is real.

Set `profile.social.github` and `profile.social.linkedin` to enable those contact links. The downloadable text résumé uses the profile and project data. The tech stack lists the tools used by the projects, and each tool links to its filtered log.

Create and edit migrations under **Migration** in the [standalone Studio](https://branchlog-uin9wku4.sanity.studio/). Each has a stable slug, an increasing number, an optional display hash, a date, a branch and references to earlier migrations. The graph, log, project notes, tech stack and résumé all read those published records on page load. Keep slugs stable when editing a project so shared links continue to work.

The optional `art` field selects a cover from `dist/art.js`. Unknown cover names use the notebook illustration. Dates use ISO format (`YYYY-MM-DD`).

The `dist/` folder is the complete static site. Fonts are self-hosted; the font licenses are beside the assets in `dist/fonts/`. The local reload endpoint exists only in the development server.

The coastal banner uses the still artwork in `dist/images/` and an eight-second silent loop. With FFmpeg installed, `node scripts/render-coast.mjs` regenerates the video and GIF from the artwork.

## Journal

The Journal at `/journal/` reads published `journalEntry` documents from Sanity project `uin9wku4`, dataset `production`. Write and publish in the [standalone Studio](https://branchlog-uin9wku4.sanity.studio/). While the dataset has no published entries, the journal displays a labeled sample stream. The first published entry replaces the examples without a site build.

The Studio source is in the sibling folder `../studio-my-portfolio`. The site’s journal source is in `src/`. After editing its JavaScript, run `npm ci` once if dependencies are missing, then `npm run build:journal`.
