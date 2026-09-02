## SRTtrail.dev

The source for **SRTtrail.dev**, Vedant Patel's portfolio and web-services site. It combines a fast, static portfolio hub with an interactive business discovery experience that helps prospective clients describe their website needs before a consultation.

**Live site:** [srttrail.dev](https://srttrail.dev/)

## Project At A Glance

- **Portfolio hub:** Presents SRTtrail.dev services, professional profile, skills, experience, social links, resume download, and selected projects.
- **Business discovery flow:** A four-step guided form for qualifying leads and gathering project requirements.
- **Project outline:** Converts selected priorities into a visual radar chart of likely design and development focus areas.
- **Lead notifications:** A Cloudflare Worker sends lead-start and completed-discovery notifications through Resend.
- **Performance-conscious static delivery:** Plain HTML, CSS, and JavaScript with locally hosted assets and no front-end build step.

## What Visitors Can Do

### Portfolio Hub (`/`)

The home page is the public profile and portfolio entry point. Visitors can:

- Review SRTtrail.dev capabilities: custom branding, web hosting, SEO optimization, and accessibility.
- Open featured work, including Shipping with Purpose, Javier Landscaping, NASA Info Gallery, and charity: water.
- View professional skills, education, experience, and displayed performance metrics.
- Visit LinkedIn, GitHub, and Instagram profiles.
- Download the developer vCard or resume.
- Start the business discovery process from the primary call to action.

On devices with a precise pointer and without reduced-motion preferences, portfolio cards use a subtle pointer-driven tilt effect. The business page is prefetched after the call to action is focused, hovered, or when the browser is idle to make navigation feel faster.

### Business Discovery (`/business/`)

The business page is a lead-qualification tool for local businesses. The form guides a visitor through four stages:

1. **Contact details** - name, email, business name, and optional phone number.
2. **Business story** - services, local customers, and the website's main goal.
3. **Top priorities** - up to five priorities from branding, ecommerce, reviews, galleries or menus, customer portals, and advanced quote forms.
4. **Launch readiness** - competitors, desired launch timeline, and domain ownership.

The experience validates required inputs, announces errors accessibly, retains progress in `sessionStorage`, supports moving backward to edit answers, and allows a full reset. Completing the form shows a loading state, an animated radar chart, and a completion message. Chart.js and canvas-confetti load only when the result view needs them.

## Lead Handling

The form posts JSON to the deployed Cloudflare Worker at `https://srttrail-leads.p-vedant7878.workers.dev`.

- When a visitor advances beyond the first step, the application attempts to send a **Started Discovery Form** notification. A delivery failure does not prevent the visitor from continuing.
- When the visitor completes the flow, the application sends a **Completed Discovery Form** notification including a formatted answer summary.
- The Worker sends messages using the Resend API.
- A Cloudflare Durable Object stores a short-lived claim per normalized email and status. It prevents duplicate notifications for the same lead stage for two hours.
- The Worker only permits cross-origin requests from the `ALLOWED_ORIGIN` configured in `wrangler.toml`.

### Required Worker Configuration

Configure the following Cloudflare Worker secrets or variables before production deployment:

| Name | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API credential used to send notifications. |
| `LEAD_TO_EMAIL` | Inbox that receives discovery notifications. |
| `LEAD_FROM_EMAIL` | Verified Resend sender address, for example `SRTtrail Leads <leads@example.com>`. |
| `ALLOWED_ORIGIN` | Allowed browser origin. Set to `https://srttrail.dev` in production. |

Do not commit API keys or email credentials to this repository.

## Technology

| Area | Implementation |
| --- | --- |
| Front end | Semantic HTML5, modern CSS, vanilla JavaScript |
| Typography | Local Quantico, Inter, and Caveat web fonts |
| Data visualization | Chart.js, loaded from jsDelivr when results are displayed |
| Completion effect | canvas-confetti, loaded from jsDelivr when results are displayed |
| Lead backend | Cloudflare Workers, Durable Objects, Resend |
| Search and sharing | Canonical URLs, Open Graph, Twitter cards, JSON-LD, `robots.txt`, and `sitemap.xml` |
| Install metadata | Web App Manifest and platform-specific icons |

## Repository Structure

```text
.
|-- index.html                 # Portfolio hub
|-- business/
|   `-- index.html             # Business discovery page
|-- css/
|   |-- fonts.css              # Font declarations
|   |-- normalize.css           # Base normalization
|   `-- components/            # Reusable and page-specific styles
|-- js/
|   |-- app.js                 # Portfolio interaction and navigation warmup
|   |-- business.js            # Discovery wizard, validation, chart, and submission
|   `-- workers/
|       `-- index.js           # Cloudflare Worker and Durable Object
|-- assets/
|   |-- documents/             # Resume and contact-card downloads
|   |-- fonts/                 # Locally served fonts
|   `-- images/                # Logos, profile image, icons, and project media
|-- CNAME                      # Custom-domain configuration for static hosting
|-- robots.txt                 # Search crawler rules
|-- sitemap.xml                # Discoverable public URLs
|-- site.webmanifest           # Installable web-app metadata
`-- wrangler.toml              # Worker name, bindings, migrations, and variables
```

## Run Locally

This is a static front end, so no dependency installation or front-end build is required. Serve the repository root with a local HTTP server instead of opening the files directly; this keeps paths and browser behavior consistent with deployment.

```bash
python -m http.server 8080
```

Then open:

- `http://localhost:8080/`
- `http://localhost:8080/business/`

The hosted lead endpoint only accepts the production origin, so local form submissions will be rejected unless a development Worker configuration permits the local origin.

## Deploy

### Static Site

Deploy the repository root to a static host such as GitHub Pages, Cloudflare Pages, or Netlify. Preserve the root-level `CNAME` when using the `srttrail.dev` custom domain.

### Lead Worker

Install Wrangler if necessary, authenticate with Cloudflare, configure the required secrets, and deploy:

```bash
npx wrangler login
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put LEAD_TO_EMAIL
npx wrangler secret put LEAD_FROM_EMAIL
npx wrangler deploy
```

The Durable Object migration declared in `wrangler.toml` is applied as part of deployment. Update `LEAD_ENDPOINT` in `js/business.js` if the deployed Worker URL changes.

## Accessibility And Performance

- Uses semantic page regions, heading hierarchy, descriptive link labels, and alternative text for meaningful imagery.
- Applies `aria-live`, `aria-invalid`, field-level messages, and focus management for the multi-step form.
- Honors `prefers-reduced-motion` for card motion and chart animation.
- Uses responsive layouts, explicit image dimensions, local font preloads, and high-priority loading for primary imagery.
- Keeps optional CSS and result-only JavaScript dependencies out of the critical initial experience where possible.

## Maintainer

Vedant Patel - Founder, SRTtrail.dev
