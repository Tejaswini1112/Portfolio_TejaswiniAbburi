# Tejaswini — Cinematic Personal Site

A personal website that opens with a short cinematic reel, then reveals a
scrollable portfolio with an AI narrator chat and Stripe-powered tipping /
"fund something new" / founder tiers.

Built to be picked up and extended on [Zo Computer](https://zo.computer).

---

## What's in this repo

```
.
├── backend/                 FastAPI app (MongoDB + Anthropic + Stripe)
│   ├── server.py            all API routes in one file
│   └── requirements.txt
├── frontend/                Vite + React 19 + Tailwind + Framer Motion
│   ├── public/
│   │   └── story-intro.mp4  pre-rendered opening reel (≈ 45 s)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css        custom fonts + theme variables
│   │   ├── components/
│   │   │   ├── ChatButton.jsx       AI narrator drawer
│   │   │   ├── IntroVideo.jsx       fullscreen intro gate
│   │   │   └── scenes/S10_NextChapter.jsx   the portfolio itself
│   │   ├── lib/             memory.js (client-side "mode"), tejaswini.js (bio)
│   │   └── pages/           Experience.jsx (/), Success.jsx, Founder.jsx
│   ├── package.json         minimal deps (react, framer-motion, sonner, axios, lucide)
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md                this file
```

### What each route does

| Route          | What it renders                                              |
| -------------- | ------------------------------------------------------------ |
| `/`            | Intro video → portfolio (`S10_NextChapter`) + chat button    |
| `/success`     | Stripe post-checkout status (polls the API)                  |
| `/founder`     | Hidden page unlocked after a `founder` tier purchase         |

### API surface (`backend/server.py`)

- `GET /api/payments/packages` – tier list (tip $1, create $25, founder $100)
- `POST /api/payments/checkout` – creates a Stripe Checkout session
- `GET /api/payments/status/{session_id}` – polled by `/success`
- `POST /api/webhook/stripe` – marks sessions paid
- `POST /api/chat` – Claude-powered narrator, aware of viewer "mode"
- `GET /api/chat/history/{session_id}`
- `POST /api/subscribe` – email capture
- `GET /api/stats`, `POST /api/stats/progress` – global counters

---

## Run locally (optional — Zo can do this for you)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cat > .env <<'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=unseen_force
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGINS=http://localhost:5173
EOF

uvicorn server:app --reload --port 8000
```

### Frontend

```bash
cd frontend
echo "VITE_BACKEND_URL=http://localhost:8000" > .env
yarn   # or: npm install
yarn dev
```

Open the URL Vite prints (usually `http://localhost:5173/`).

The intro tier cards render even when the API is offline (default packages
live in `S10_NextChapter.jsx`), so the site still looks complete locally.

---

## Continuing on Zo Computer — prompts to paste

Copy any of these into Zo to pick up where this repo leaves off.
They're written to be self-contained so you can mix and match.

### 1. Initial bootstrap

> Import this repo into a new Zo app. Install the frontend with `yarn` and the
> backend with `pip install -r backend/requirements.txt`. Expose the frontend
> on port 5173 and the FastAPI backend on port 8000. Wire `VITE_BACKEND_URL`
> on the frontend to the public URL of my backend. Provision MongoDB as the
> database and put `MONGO_URL` in the backend env.

### 2. Zo's native Stripe integration (bonus points)

> Replace the `backend/server.py` Stripe code with Zo's native Stripe
> integration. Keep the same three tiers (`tip $1`, `create $25`,
> `founder $100`) and the same API paths
> (`/api/payments/packages`, `/api/payments/checkout`,
> `/api/payments/status/:id`, `/api/webhook/stripe`) so the frontend doesn't
> change. After payment, keep writing a row to the `payment_transactions`
> collection with `{session_id, package_id, amount, payment_status}`.

### 3. Gmail + Calendar follow-up (bonus points)

> When a `create` tier payment completes (Stripe webhook `checkout.session.completed`
> with `metadata.package_id == "create"`), use Zo's Gmail integration to send
> me a short email: subject `"New build fund from {customer_email}"`, body
> with the amount and a link to the Stripe dashboard session. Also use Zo's
> Calendar integration to create a 30-minute "scope the build" event on my
> calendar 2 business days out, inviting the customer email.

### 4. Custom domain (bonus points)

> Attach the custom domain `tejaswini.xyz` (or pick a free `.zo.computer`
> subdomain) to the frontend deployment. Redirect `www.` to the apex.
> Make sure SSL is on.

### 5. Mini-game easter egg (bonus points)

> Add a hidden mini-game at `/mission`. It's a 60-second timing puzzle where
> three "signal" bars drift at different speeds and the player clicks when
> all three align inside a golden window. Beating it sets
> `localStorage.uf_mission_solved = '1'` and reveals a `// HIDDEN` badge on
> the portfolio. Animate with Framer Motion, match the Cormorant Garamond +
> Space Mono type palette already in `index.css`.

### 6. Linear integration for "fund something new"

> When a `create` tier payment lands, also create a Linear issue titled
> "Build fund: ${amount} from ${customer_email}" in my project, tagged
> `build-fund`, with a checklist of `Scope call`, `Design`, `Ship`, `Follow-up`.

### 7. Polish + micro-interactions pass

> Do a polish pass on `frontend/src/components/scenes/S10_NextChapter.jsx`:
> add subtle parallax on the hero name, a magnetic hover on the three tier
> cards, and a scroll-linked gradient that shifts from cyan to amber as the
> user descends. Respect `prefers-reduced-motion`. Keep everything to one
> file.

### 8. Social share card

> Generate and serve a dynamic Open Graph image at `/og.png` that renders
> my name, the tagline `NOT DISCOVERED. BUILT.` over a blurred still from
> `public/story-intro.mp4`. Use the Outfit font. 1200×630.

### 9. Analytics + conversion

> Add privacy-friendly page analytics (Plausible or Zo's built-in analytics
> if available). Track three events: `intro_completed`, `tier_clicked`
> (with tier id), and `tier_checkout_started`.

### 10. Submission checklist

> Deploy the app. Give me the public URL, the custom domain status, the
> Stripe tier IDs, and confirm the webhook is live. Then generate a 30-second
> screen-record script that walks through: intro reel → portfolio scroll →
> chat with the narrator → tip $1 via Stripe → success page.

---

## Design vision (for the submission write-up)

> The site opens like a short film: nine hand-crafted clips stitched into a
> single 45-second intro. When it ends, the portfolio fades in — one long
> scroll with three moments: **who she is**, **what she's built**, and
> **support the next build** via Stripe (tip, fund something new, or become
> a founder). The AI narrator — "The Unseen Force" — is always available
> and shifts its tone based on how the visitor has engaged.

Typography: Cormorant Garamond (display), Space Mono (technical), Outfit (body).
Palette: void black, cyan signal, amber/gold reveal.

---

Credits: built by Tejaswini Abburi. Music/video beds are royalty-free / original.
