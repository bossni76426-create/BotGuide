# GOGITO Dokkan Bot Guide

A small static website that documents every command exposed by `bot.py`
and `commands.py`. Designed to be the first place a new user lands to
understand what the bot can do.

## Quick start

```bash
cd dokkan_guide
npm install
npm run start          # local dev server with the /admin/ editor
npm run start:public   # local dev server WITHOUT /admin/ (matches prod)
npm run build          # builds _site/ for deploy (no /admin/)
npm run build:full     # builds _site/ WITH /admin/ (local-only use)
```

The `start` script enables the editor at <http://localhost:8080/admin/>.
The `build` script (used by Vercel) **excludes** the admin so it never
ships to production.

## Deploying

The repo includes `vercel.json`. Vercel will auto-run `npm run build`
and publish `_site/`. The admin folder is stripped during build, and a
redirect rule sends any stray `/admin/*` request back to `/`.

```bash
# from this folder, after `vercel link` once:
vercel --prod
```

## Community links

- Patreon tiers: <https://www.patreon.com/c/GComuntity/membership>
- Discord invite: <https://discord.com/invite/pS7Acz3au3>

## Multi-image gallery

Each command card supports up to 4 screenshots out of the box. Drop
files named `cmd-<id>.png`, `cmd-<id>-2.png`, `cmd-<id>-3.png`, … in
`src/img/` — the public site auto-discovers them, shows a `+N` badge on
the thumbnail, and opens a lightbox with prev/next on click.

## Adding real screenshots

Two ways, pick whichever is comfier:

### Option A — use the admin page (no-code)

Open `/admin/` (linked from the public site footer) and drop screenshots
into `src/img/`, then use the filename picker or paste an `img/...` URL
into each card. Edits live in your browser only, so the public site only
shows them on **that** browser. Use **Export JSON** to save a snapshot,
then either:

- Re-import on another device, or
- Bake permanent images by saving them in `src/img/` and committing the
  exported `src/overrides.json`.

The admin stores screenshot paths/URLs instead of embedding image data in
`localStorage`, which keeps browser storage small even with many images.
Preview via <http://localhost:8080/> from `npm run start`; double-clicking
`index.html` uses a different browser origin and will not see admin drafts.

### Option B — drop files directly

Every command card and onboarding step automatically tries to load an
image. Drop your PNG into `src/img/` with one of these filenames and the
placeholder will be replaced:

| Card                | Filename               |
|---------------------|------------------------|
| Step 1 (launch)     | `step-start.png`       |
| Step 2 (login)      | `step-login.png`       |
| Step 3 (help)       | `step-help.png`        |
| Any command card    | `cmd-<id>.png`         |

The `<id>` is the `id` field used in `script.js` (e.g.
`cmd-omegafarm.png`, `cmd-zbattles.png`, `cmd-baba-gui.png`). If no file
is present, the card falls back to a dashed placeholder so the layout
stays intact.

## Structure

```
dokkan_guide/
├── .eleventy.js        # Eleventy passthrough config
├── netlify.toml        # Build command + publish dir for Netlify
├── package.json
└── src/
    ├── index.html      # Public guide shell
    ├── style.css       # Theme + layout (public + admin)
    ├── script.js       # COMMANDS / STEPS data + public renderer
    ├── admin.js        # Admin page logic
    ├── admin/
    │   └── index.html  # /admin/ editor page
    └── img/            # Drop your screenshots here (optional)
```

## Editing commands

Open `src/script.js` and edit the `COMMANDS` array. Each entry is:

```js
{
  section: "in-game",   // "in-game" or "menu"
  cat:     "stage",     // category chip key
  tier:    "basic",     // "basic" = Basic (Free); or "vip" | "premium"
  id:      "omegafarm", // unique id (also screenshot filename)
  name:    "omegafarm", // displayed in the card header
  desc:    "…",         // short user-facing description
  example: "omegafarm", // optional, shown as a code block
}
```

That's it — refresh the page and the new card shows up.

## Deploy

The project deploys cleanly on Netlify (or any static host).
`netlify.toml` already sets:

- build command: `npx @11ty/eleventy`
- publish directory: `_site`
- Node version: `18`

For other hosts, just run `npm run build` and upload `_site/`.
