# Hycient Igweze · Portfolio

My personal site. I'm a Senior Full-Stack & ML Engineer, and the site tells my work as a Git history: a graph of branches (`main`, `work`, `ml`, `ventures`) and a newest-first log of "migrations". Each migration is a role, product or model, with its before and after, implementation notes, stack and links. A journal at `/journal/` holds longer write-ups.

Projects and journal entries live in Sanity (project `uin9wku4`, dataset `production`) and load on each visit, so publishing in the Studio updates the site without a build. The Studio is a separate repo: [studio-my-portfolio](https://github.com/emeraldhycient/studio-my-portfolio).

## Run it locally

```bash
npm run dev
```

Then open `http://127.0.0.1:4173/`. The dev server watches `dist/` and reloads open tabs on save, and nothing needs installing first. Use `PORT=4174 npm run dev` for another port. Sanity only accepts requests from the allowed origins, which include `127.0.0.1:4173` and `localhost:4173`, so other ports can't load content until you add them under the project's CORS settings.

`dist/` is the whole static site, with no build step except the journal bundle.

## Deploy

The site runs on Cloudflare as a Worker that serves `dist/` as static files (`wrangler.jsonc`), at [hycient.dev](https://hycient.dev/).

```bash
npm run deploy
```

The first run needs `npx wrangler@4 login`. Each deploy uploads `dist/` as it is on disk, so rebuild the journal first if `src/` changed. Sanity must list every origin the site is served from under CORS (`npx sanity cors add https://… --no-credentials` in the Studio repo).

## Where things live

| What | Where |
|---|---|
| Name, intro, About text, location, email, social links, CV | `profile` in `dist/portfolio.js` |
| Graph branches and their order | `branches` in `dist/portfolio.js` |
| Tech stack groups | `stackGroups` in `dist/portfolio.js` |
| Projects (migrations) and journal entries | The [Studio](https://branchlog-uin9wku4.sanity.studio/) |
| CV download | `dist/Hycient-Igweze-CV.pdf` (`profile.resume`) |
| Project diagrams | `dist/images/`, mapped by slug in `figures` in `dist/app.js` |
| Cover drawings | `drawings` in `dist/art.js` |

Every tool in `stackGroups` appears in the tech stack. A tool that a published project lists links to the log filtered by that tool. A tool that no project lists yet appears as a plain chip, and any tool used by a project but not in a group appears under "Other".

## Editing projects in the Studio

Each migration has a stable slug, a unique number higher than its parents, a date (`YYYY-MM-DD`), a branch and parent migrations. These drive the graph and the log. Keep slugs stable after publishing, because shared links use them.

Optional fields:

- `art` picks a cover from `dist/art.js`. Unknown names fall back to the notebook.
- `links` lists label and URL pairs for the project note. Full `https://` addresses open in a new tab, and site paths such as `/journal/#entry/<slug>` open in the same tab.
- `hash` is a short display hash. Without one, the log shows `M` plus the number.

The graph has four lanes. A fifth branch needs another entry in `lanes` in `repositoryGraph()` (`dist/art.js`), a `.branch-<id>` colour rule in `dist/site.css`, and the new value in the Studio's `branch` options.

## Journal

`/journal/` lists published `journalEntry` documents, newest first, and filters them by kind (work, experience, note). Entries dated in the future appear once their date passes. The journal code is in `src/`. After changing it, run `npm ci` once if `node_modules` is missing, then:

```bash
npm run build:journal
```

That rebuilds `dist/journal/stream.js`.

## Assets

Fonts are self-hosted, with their licences beside them in `dist/fonts/`. The coastal banner is a still image plus an eight-second silent loop. With FFmpeg installed, `node scripts/render-coast.mjs` regenerates the video and GIF from the artwork.
