# Tejaswini — Cinematic Personal Site

A personal website that opens with a short cinematic reel, then reveals a
scrollable portfolio with an AI narrator chat and Stripe-powered tipping /
"fund something new" / founder tiers.

Designed to be picked up by [Zo Computer](https://zo.computer) so Zo's
**native integrations** (Stripe, LLM chat, Gmail, Calendar, database) power
the dynamic parts — no separate backend to babysit.

---

## What's in this repo

```
.
├── README.md
├── .gitignore
└── frontend/                Vite + React 19 + Tailwind + Framer Motion
    ├── public/
    │   └── story-intro.mp4  pre-rendered opening reel (≈ 45 s)
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css        fonts + theme variables
    │   ├── components/
    │   │   ├── ChatButton.jsx        AI narrator drawer
    │   │   ├── IntroVideo.jsx        fullscreen intro gate
    │   │   └── scenes/S10_NextChapter.jsx   the portfolio itself
    │   ├── lib/             memory.js (viewer "mode"), tejaswini.js (bio)
    │   └── pages/
    │       ├── Experience.jsx   /
    │       ├── Success.jsx      /success (Stripe return)
    │       └── Founder.jsx      /founder (hidden after founder tier)
    ├── package.json         minimal deps
    ├── tailwind.config.js
    └── vite.config.js
```

Frontend routes:

| Route       | What it renders                                             |
| ----------- | ----------------------------------------------------------- |
| `/`         | Intro video → portfolio (`S10_NextChapter`) + chat          |
| `/success`  | Stripe post-checkout status (polls the API)                 |
| `/founder`  | Hidden page unlocked after the `founder` tier purchase      |

---

## API contract the frontend expects

The frontend calls these endpoints under `VITE_BACKEND_URL`. On Zo they map
to native integrations — no Python/FastAPI needed.

| Method | Path                                | Used by                              |
| ------ | ----------------------------------- | ------------------------------------ |
| GET    | `/api/payments/packages`            | Tier cards (has local fallback)      |
| POST   | `/api/payments/checkout`            | Redirect to Stripe Checkout          |
| GET    | `/api/payments/status/{session_id}` | `/success` polling                   |
| POST   | `/api/webhook/stripe`               | Mark sessions paid                   |
| POST   | `/api/chat`                         | AI narrator                          |
| GET    | `/api/chat/history/{session_id}`    | Restore chat across refresh          |
| POST   | `/api/subscribe`                    | Email capture                        |

**Payloads / shapes**

```jsonc
// POST /api/payments/checkout
{ "package_id": "tip" | "create" | "founder", "origin_url": "https://site.com" }
// → { "url": "https://checkout.stripe.com/...", "session_id": "cs_..." }

// GET /api/payments/packages
// → { "packages": [
//     { "id": "tip",     "amount": 1,   "currency": "usd", "name": "Tip" },
//     { "id": "create",  "amount": 25,  "currency": "usd", "name": "Fund something new" },
//     { "id": "founder", "amount": 100, "currency": "usd", "name": "Founding Supporter" }
// ] }

// POST /api/chat
{ "session_id": "uf-xxx", "message": "Who is she?", "memory": { /* optional */ } }
// → { "session_id": "uf-xxx", "reply": "...", "timestamp": "2026-04-22T..." }

// POST /api/subscribe
{ "email": "you@example.com" }
// → { "ok": true }
```

Even when the API isn't wired yet, the **portfolio itself renders fully** —
`S10_NextChapter.jsx` carries a local `DEFAULT_PACKAGES` array so the tier
cards always show.

---

## Run locally (frontend only)

```bash
cd frontend
echo "VITE_BACKEND_URL=" > .env   # or point at your Zo API once deployed
yarn       # or: npm install
yarn dev
```

Open the URL Vite prints (usually `http://localhost:5173/`). Intro video
plays, portfolio reveals, tier cards show. Clicking a tier will toast an
error until `VITE_BACKEND_URL` points at a backend that implements the
contract above.

---

## Prompts to paste into Zo Computer

### 1. Bootstrap + Zo-native backend

> Import this repo into a new Zo app. Install the frontend with `yarn` and
> serve it on port 5173.
>
> Implement the following API on Zo (all under the site's base URL) so the
> frontend doesn't need any changes — use **Zo's native integrations** for
> Stripe, LLM, and the datastore.
>
> - `GET  /api/payments/packages` → return the three tiers `tip $1`,
>   `create $25`, `founder $100` (USD).
> - `POST /api/payments/checkout` with body `{ package_id, origin_url }` →
>   create a Stripe Checkout session via Zo's Stripe integration.
>   Success URL: `${origin_url}/success?session_id={CHECKOUT_SESSION_ID}`.
>   Cancel URL: `${origin_url}/?cancelled=1`. Store the session in Zo's DB.
> - `GET  /api/payments/status/{session_id}` → return
>   `{ status, payment_status, amount_total, currency, metadata }`.
> - `POST /api/webhook/stripe` → handle `checkout.session.completed` and
>   mark the stored row as paid.
> - `POST /api/chat` with `{ session_id, message, memory }` → call my
>   configured LLM (Claude or equivalent). Use the system prompt in
>   `frontend/src/lib/tejaswini.js` as the narrator's knowledge base.
>   Persist both messages keyed by `session_id`.
> - `GET  /api/chat/history/{session_id}` → return the persisted messages
>   in time order.
> - `POST /api/subscribe` with `{ email }` → upsert into a `subscribers`
>   collection. Validate the email.
>
> Then set `VITE_BACKEND_URL` on the frontend to the Zo backend base URL
> and rebuild the frontend.

### 2. Gmail + Calendar follow-up (bonus)

> When a `create` tier payment completes (Stripe webhook
> `checkout.session.completed` with `metadata.package_id == "create"`), use
> Zo's Gmail integration to email me: subject
> `"New build fund from {customer_email}"`, body with the amount and a
> link to the Stripe session. Also use Zo's Calendar integration to create
> a 30-minute "scope the build" event two business days out, inviting the
> customer.

### 3. Custom domain (bonus)

> Attach a custom domain (I'll pick it later — default to a free
> `.zo.computer` subdomain now). Force SSL. Redirect `www.` to apex.

### 4. Mini-game easter egg at `/mission` (bonus)

> Add a hidden page at `/mission`: a 60-second signal-alignment game where
> three bars drift at different speeds and the player clicks when all
> three align inside a golden window. Winning sets
> `localStorage.uf_mission_solved = "1"` and reveals a `// HIDDEN` badge on
> the portfolio. Match the Cormorant Garamond + Space Mono palette already
> defined in `index.css` and respect `prefers-reduced-motion`.

### 5. Linear integration (bonus)

> When a `create` tier payment lands, also create a Linear issue titled
> `"Build fund: ${amount} from ${customer_email}"`, labeled `build-fund`,
> with a checklist of `Scope call`, `Design`, `Ship`, `Follow-up`.

### 6. Polish pass

> Do a polish pass on
> `frontend/src/components/scenes/S10_NextChapter.jsx`: parallax on the
> hero name, magnetic hover on the three tier cards, and a scroll-linked
> gradient that shifts cyan → amber as the user descends. Respect
> `prefers-reduced-motion`. One file only.

### 7. Dynamic Open Graph image

> Generate and serve `/og.png` (1200×630) that renders my name plus the
> tagline `NOT DISCOVERED. BUILT.` over a blurred still from
> `/story-intro.mp4`. Use the Outfit font.

### 8. Analytics

> Add privacy-friendly analytics (Plausible or Zo's built-in). Track
> three events: `intro_completed`, `tier_clicked` (with tier id),
> `tier_checkout_started`.

### 9. Submission checklist

> Deploy the app. Give me the public URL, the custom domain status, the
> Stripe tier IDs + webhook status, and a 30-second screen-record script
> that walks through: intro reel → portfolio scroll → narrator chat →
> tip $1 via Stripe → `/success`.

---

## Design vision (for the submission post)

> The site opens like a short film: nine hand-crafted clips stitched into a
> single 45-second intro. When it ends, the portfolio fades in — one long
> scroll with three moments: **who she is**, **what she's built**, and
> **support the next build** via Stripe (tip, fund something new, or become
> a founder). The AI narrator — "The Unseen Force" — is always available
> and shifts its tone based on how the visitor has engaged.

Typography: Cormorant Garamond (display), Space Mono (technical), Outfit (body).
Palette: void black, cyan signal, amber/gold reveal.

Built on Zo Computer — native Stripe, native chat, no extra backend to run.
