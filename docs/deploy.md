# Deploy

How to ship `onda.video` to Vercel. Estimated time: ~30 minutes, most of which is DNS propagation.

## Prerequisites

- A Vercel account on a team that can create new projects.
- The GitHub repository connected to that Vercel team (Settings → Git → connect GitHub).
- The `onda.video` domain purchased at a registrar (Namecheap, Cloudflare Registrar, Porkbun, etc.) with DNS managed at the registrar — not yet delegated anywhere.
- Local repo on `main`, with `vercel.json` committed and pushed.

## Why the config looks the way it does

The repo is a pnpm workspace. The site (`www/`) imports from `../registry/*` and `../lib/*` via TS path aliases. Vercel's **Root Directory** setting sandboxes the build and forbids `..`, so we cannot set Root Directory to `www/`. Instead we leave Root Directory at the repo root and let `vercel.json` filter into the `@onda/www` workspace.

`vercel.json`:

```json
{
  "framework": "nextjs",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm --filter @onda/www build",
  "outputDirectory": "www/.next"
}
```

`pnpm --filter @onda/www build` runs the `build` script in `www/package.json`, which is `next build`. The `prebuild` hook (which copies registry JSON into `www/public/r/`) runs automatically before `next build` because pnpm respects npm lifecycle hooks. `outputDirectory: "www/.next"` tells Vercel where the Next.js build artifacts live so the Next.js builder picks them up.

## Vercel project setup

1. Vercel dashboard → **Add New → Project**.
2. **Import Git Repository** → pick the `onda` repo.
3. On the configuration screen:
   - **Framework Preset**: leave on `Next.js` (auto-detected from `vercel.json`).
   - **Root Directory**: leave as `./` (the repo root). Do **not** set it to `www`. If you do, the build will fail with `Module not found` errors against `@onda/registry/*` and `@onda/lib/*`.
   - **Build & Output Settings**: leave all overrides off. The values in `vercel.json` win.
   - **Environment Variables**: none required for the first deploy. The site has no runtime secrets.
   - **Node.js Version** (Project Settings → General after import): set to `20.x` or `22.x` to match `engines.node >= 20` in the root `package.json`.
4. Click **Deploy**.

## First deploy

What to expect:

- Vercel reads `packageManager: "pnpm@9.0.0"` from the root `package.json` and uses pnpm automatically.
- `pnpm install --frozen-lockfile` runs against `pnpm-lock.yaml` at the repo root (~30–60s on a cold build).
- `pnpm --filter @onda/www build` runs `prebuild` (copies `registry/r/*.json` into `www/public/r/`) then `next build`.
- The build log should end with a static-pages summary showing **~48 pages** (1 home, 1 components index, 38 component detail pages, `/compare`, `/docs`, `/lab`, `/sitemap.xml`, `/robots.txt`, etc.). The exact number drifts with the catalog.
- Build logs are at: Project → **Deployments** → click the deployment → **Build Logs**.

Verify on the auto-assigned `*.vercel.app` preview URL before connecting the real domain:

```
https://onda-<hash>.vercel.app/
https://onda-<hash>.vercel.app/components
https://onda-<hash>.vercel.app/r/index.json
```

## Connecting the domain

### 1. Add the domain in Vercel

Project → **Settings → Domains** → add both:

- `onda.video` (apex)
- `www.onda.video`

Vercel will mark `www.onda.video` as a redirect to `onda.video` automatically (or set it the other way around in the same panel — owner's call; apex-as-canonical is the modern default and matches the `https://onda.video` constant in `www/src/lib/seo.ts`).

### 2. Add DNS records at the registrar

Add these two records in the registrar's DNS panel:

| Type  | Host / Name | Value                    | TTL  |
| ----- | ----------- | ------------------------ | ---- |
| A     | `@`         | `76.76.21.21`            | 3600 |
| CNAME | `www`       | `cname.vercel-dns-0.com.`| 3600 |

Notes:

- `@` means the apex (`onda.video` itself). Some registrars use a blank field or the literal domain name instead.
- The trailing dot on the CNAME is correct DNS notation. Most registrar UIs accept it with or without; both work.
- `cname.vercel-dns-0.com` is Vercel's current general-purpose CNAME target. The older `cname.vercel-dns.com` still works but is deprecated. **Owner: confirm the exact records Vercel shows in Settings → Domains for this specific project** — they sometimes vary. See <https://vercel.com/docs/domains/working-with-dns> and <https://vercel.com/docs/domains/set-up-custom-domain>.
- TTL `3600` (1 hour) is fine for a fresh domain. If the domain has been used elsewhere and you're cutting over, drop TTL to `60` ~24h before the switch.
- Propagation is typically a few minutes to a few hours; full global propagation can take up to 48 hours. Check with <https://www.whatsmydns.net>.

Once Vercel detects the records, the domain rows in Settings → Domains will turn green and an SSL cert will be issued automatically (Let's Encrypt, usually within ~5 minutes of verification).

## Verification

After the domain is live, hit these URLs and confirm a 200 + correct content:

```
https://onda.video/
https://onda.video/components
https://onda.video/components/blur-reveal
https://onda.video/compare
https://onda.video/r/blur-reveal.json
https://onda.video/r/index.json
https://onda.video/sitemap.xml
https://onda.video/robots.txt
```

Also confirm `https://www.onda.video/` 301-redirects to `https://onda.video/`.

Quick check from the terminal:

```bash
curl -sI https://onda.video/ | head -1
curl -sI https://www.onda.video/ | head -2
curl -s https://onda.video/r/index.json | head -c 200
```

## Troubleshooting

**Build fails with `Cannot find module '@onda/registry/...'` or `'@onda/lib/...'`**

Root Directory got set to `www` in the Vercel UI. Settings → Build and Deployment → Root Directory → change back to `./` and redeploy.

**Build fails with `ERR_PNPM_OUTDATED_LOCKFILE`**

`pnpm-lock.yaml` is out of sync with the manifests. Locally: `pnpm install`, commit the updated lockfile, push.

**`/r/blur-reveal.json` returns 404**

The `prebuild` script didn't run, or the source `registry/r/*.json` files weren't committed. Check the build log for the prebuild output. Locally reproduce with `pnpm --filter @onda/www build` and inspect `www/public/r/` after the run.

**Fonts (Clash Display / Space Grotesk) render as fallback on production but work locally**

The font files are loaded from a CDN that blocks the production hostname, or the `@font-face` URLs are relative. Check the Network tab in DevTools on `https://onda.video/` and confirm the font requests are 200. If they're served from Fontshare/Adobe/Typekit, add `onda.video` and `www.onda.video` to the allowed domains in that provider's dashboard.

**"No Next.js version detected"**

Vercel didn't find Next.js in the resolved workspace. Confirm `vercel.json` has `"framework": "nextjs"` and that `pnpm install` succeeded (check the install log section). If pnpm install was skipped because of the wrong Root Directory, fix that first.

**Deployment succeeds but site shows a stale build**

Vercel caches aggressively. Project → Deployments → latest → **Redeploy** with the **Use existing Build Cache** checkbox unchecked.

**DNS records are added but the domain still shows "Invalid Configuration" in Vercel**

Wait. DNS propagation. If it's still failing after 2 hours, run `dig onda.video A +short` and `dig www.onda.video CNAME +short` — the values must exactly match what Vercel asked for. A common gotcha is the registrar silently adding a parking page A record alongside yours; delete any extra A records on `@`.
