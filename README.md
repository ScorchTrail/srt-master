# SRTtrail.dev

A lightweight, static web project that combines:
- A central hub page for brand and portfolio navigation
- A business discovery experience for lead qualification
- A serverless worker folder for backend lead handling

## Structure

- `index.html` : Public hub page (`/`)
- `business/index.html` : Primary business page content (`/business/`)
- `assets/` : Shared images and brand assets
- `fonts/` : Shared web fonts
- `css/` : Shared stylesheets (`normalize.css`, `fonts.css`, `components/` component styles)
- `js/` : Shared scripts (`app.js`, `business.js`, `worker/index.js`)
- `wrangler.toml` : Cloudflare Worker configuration (repo root)

## Launch Notes

- The hub page loads block styles individually so above-the-fold CSS can render immediately while secondary blocks are preloaded.
- The discovery form posts to the Cloudflare Worker configured in `wrangler.toml`; production requires `RESEND_API_KEY`, `LEAD_TO_EMAIL`, and `LEAD_FROM_EMAIL`.

## Local Run

Because this is static HTML/CSS/JS, you can run it with any static server.

Example (Python):

```bash
python -m http.server 8080
```

Then open:
- `http://localhost:8080/`
- `http://localhost:8080/business/`

## SEO Notes

- Root canonical: `https://srttrail.dev/`
- Business canonical: `https://srttrail.dev/business/`
- Open Graph, Twitter cards, geo metadata, and structured data are configured on indexable pages.
- Redirect/helper pages are marked `noindex`.

## Deployment

Deploy as a static site (GitHub Pages, Cloudflare Pages, Netlify, etc.).
Keep `CNAME` at repo root for custom domain mapping.

## Maintainer

Vedant Patel  
SRTtrail.dev
