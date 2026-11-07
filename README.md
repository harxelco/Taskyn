# Taskyn V5

Upgrade of Taskyn V4 — still a static HTML/CSS/vanilla-JS app (no framework, no build step).

## Run
Serve the folder over HTTP (needed for the service worker / offline mode):

    python3 -m http.server 8080   # then open http://localhost:8080

Opening `index.html` directly works too, but offline caching is disabled for `file://`.

## Files
| File | Purpose |
|---|---|
| `index.html` | Shell: sidebar, top bar, drawer/modal/palette containers |
| `v5.css` | Single stylesheet: design tokens (CSS variables), light + dark theme, components, responsive layouts. Replaces `styles.css` + `v4.css` |
| `config.js` | Runtime config: `GOOGLE_MAPS_API_KEY`, `API_BASE`, `AI_ENDPOINT` |
| `script.js` | Demo data (team, customers, jobs, templates, stock…) + date/zone helpers |
| `v5-core.js` | Engine: state, persistence, job costing, dispatch scoring + conflicts, automation rules, offline queue/sync |
| `v5-intel.js` | Alerts, deterministic daily briefing, question answering over live data |
| `v5-ui.js` | Router, drawers, modals, toasts, theme, command bar, charts, delegated events |
| `v5-jobs.js` | Overview, Jobs & Tasks (templates, recurring, subtasks, dependencies, costing drawer), Smart Dispatch |
| `v5-ops.js` | Schedule, Team, Customers, Live Operations, Inventory, Equipment, Requests, Quotes, Invoices, Payments |
| `v5-field.js` | Worker view (offline) and Customer portal (approval demo) |
| `v5-business.js` | Reports & Analytics, Profitability, Taskyn AI, Notifications, Settings (roles, notifications, automations, integrations), Harxel |
| `v5-boot.js`, `sw.js`, `manifest.webmanifest`, `assets/` | Startup, service worker, PWA manifest, icon, bundled Inter font |

V4's `v4.js`, `v4.css`, `styles.css` were folded into the files above (their views were rewritten on the new design system). Navigation: Services, Recurring, Analytics and Insights pages were merged into Jobs (templates + recurring), Reports and Taskyn AI so the sidebar is shorter (28 → 22 items). Old routes still redirect.

## What is real vs demo
**Real, working in the browser:** every form validates; filters/search filter; costing maths is shared by all modules (`JC` in `v5-core.js`); automation rules actually run on assignment / delay / completion / report / low stock; the worker view queues actions in localStorage (photos in IndexedDB) and replays them in order; CSV/JSON export; theme; data persists per calendar day (configuration and templates persist indefinitely). Reset in Settings → Data.

**Demonstration (clearly labelled in the UI):**
- Workspace data is simulated and held in the browser.
- Smart Dispatch uses skills, availability/roster, hours-based workload and **demo service zones — not GPS or road distance**. Every assignment needs manager approval.
- Live Operations map is schematic. Jobs sit at neighbourhood centres; worker positions are simulated unless a worker taps *Share my location* in Worker view on that device (real GPS, labelled live).
- Offline sync: with no `API_BASE`, "applied" means *applied to this browser's demo workspace*, never shown as "Synced". With `API_BASE` set, items POST to `{API_BASE}/sync` and show *Synced* only after an HTTP 2xx.
- Customer portal approvals are simulated actions, labelled as such.
- Taskyn AI is deterministic analysis of workspace data (labelled). Set `AI_ENDPOINT` to send questions to your own model (`POST {question, context}` → `{answer}`).
- Report summaries are drafted from worker input, labelled as drafted, not verified.

## Still needs backend / API integration
- Persistent multi-user database, authentication and real role enforcement (roles are enforced client-side for the demo)
- `POST {API_BASE}/sync` endpoint (JSON; photos as multipart with `meta` + `file`) and `GET /health`
- Real GPS/location stream and street-level geocoding / distance-based dispatch
- Customer portal (secure links, e-sign), WhatsApp / SMS / email delivery
- M-Pesa / card payments and invoice delivery
- AI model endpoint (`AI_ENDPOINT`)
- Server-side scheduler for recurring jobs and overdue detection (currently client-side, runs while the app is open)
- Harxel logo: place the supplied logo file where the Harxel page placeholder indicates; it was not altered or recreated.

## Testing notes
Automated browser run (Chromium): all 21 views at 1440px and 390px — no console errors, no horizontal overflow; dispatch propose→approve, offline queue→sync, completion→report→approval→portal, expenses, template→job creation, search, persistence across reload, dark theme.
