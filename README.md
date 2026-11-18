# Peer Guide Coach (Beta)

Minimal, local, rule-based CRM emulator with an embedded Peer Guide Coach widget that suggests Next Best Actions (NBA) for peer guides supporting people with Serious Mental Illness (SMI). Runs locally with one command and packages into a zip for easy sharing.

## Guardrails
- Never diagnoses or gives medical advice.
- Always includes an option to escalate to a clinician and the 988 Suicide & Crisis Lifeline link.
- C-SSRS: brief demo screen with clear handoff to clinician on any positive.
- Safety Planning: checklist + public links only (no copyrighted forms).
- FUH nudges align with HEDIS FUH 7/30-day concepts.
- Synthetic data only; no PHI.

## Run Locally
Prereqs: Python 3.11+ and Node 18+.

Two options:

- Using the Python helper (recommended)
  1. From the repo root, run `python dev.py`
  2. Watch console for URLs. Example:
     - Backend: `http://127.0.0.1:8000`
     - Frontend: printed as `[dev] Frontend: http://localhost:<port>`

  Notes:
  - The helper creates `.venv`, installs backend requirements, installs frontend deps, and starts both with live reload.
  - Frontend port: the helper selects a free port (tries 5173..5192). If 5173 is stuck, it attempts to free it on Windows and falls back to another port. CORS allows any localhost port.

- Using Makefile
  1. From the repo root, run `make dev`
  2. Open the printed frontend URL (5173 by default)

## Package as a Zip
- `make package` -> creates `dist/peer-guide-coach_beta.zip` with frontend build and source, excluding heavy folders.
  - Demo media and walkthrough live in `scripts/screenshot_demo.md` with GIFs under `scripts/media/`.

## Deploy on Render

We include a Render Blueprint (`render.yaml`) to create a FastAPI backend and a Static Site frontend.

1) Push this repo to GitHub (or GitLab/Bitbucket).

2) Backend (Web Service)
- Create New + Web Service → Use your repo → Choose `render.yaml` or Manual.
- If Manual:
  - Runtime: Python
  - Build Command: `pip install -r backend/requirements.txt`
  - Start Command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
  - Env var (optional): `FRONTEND_ORIGIN_REGEX = ^https?://(localhost|127\.0\.0\.1)(:\d+)?$|^https?://([a-zA-Z0-9-]+\.)*onrender\.com$`

3) Frontend (Static Site)
- Create New + Static Site → Use your repo
- Build Command: `cd frontend && npm ci && npm run build`
- Publish Directory: `frontend/dist`
- After backend deploys, set env var on the Static Site: `VITE_API_URL` = your backend URL (e.g., `https://peer-guide-coach-backend.onrender.com`), then redeploy the Static Site.

4) Test
- Open your Static Site URL and verify members load and chat works.
- Health check: `GET <backend>/api/health` returns `{ "ok": true }`.

Notes
- CORS: backend allows localhost and any `*.onrender.com` by default. You can also set `FRONTEND_ORIGINS` with a comma-separated list of exact origins if you prefer explicit allow-listing.
- Dev vs Prod: In dev, the Vite proxy handles `/api` to 8000; in prod, the frontend uses `VITE_API_URL`.

## Project Structure
```
README.md
LICENSE
Makefile
rules.json
dev.py
system_prompt.md      # the spec prompt this beta was built from
tests/
  test_chat.py
scripts/
  package.py
  screenshot_demo.md
backend/
  app.py
  models.py
  seed_members.json
  requirements.txt
frontend/
  index.html
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  package.json
  eslint.config.js
  .prettierrc
  src/
    main.tsx
    App.tsx
    styles.css
    crm/
      CRMApp.tsx
      MemberList.tsx
      MemberDetail.tsx
    widget/
      WidgetFrame.tsx
      ChatBox.tsx
      WidgetApp.tsx
      RiskBanner.tsx
      NBAList.tsx
      api.ts
      flows/
        CSSRSQuick.tsx
        SafetyPlan.tsx
        FollowUpNudge.tsx
        BarrierSolver.tsx
```

## Scenarios (Demo Members)
Three seeded scenarios are included:
- Crisis: ideation keywords; recent positive C-SSRS flag true.
- Post-discharge: inpatient/ED discharge within 30 days; no 7-day FUH.
- Recovery: low risk with a small WRAP-style recovery step.

Open the CRM emulator (see printed frontend URL), select a member on the left panel, view details in the middle panel, and use the Peer Guide Coach on the right to see risk and suggested NBAs. Each action opens a simple micro-flow with an autofill note you can copy back into the CRM note box.

## New: Chat with Coach (Q&A)

Backend
- Endpoint: `POST /api/chat`
- Request: `{ "memberId": string, "message": string }`
- Response: `{ "reply": string, "suggestedActions": [{ id, label }] }`
- Logic:
  - Looks up the selected member using existing loaders.
  - Reuses rule engine (`apply_rules(member, note_text=message)`) to generate actions.
  - Adds light intent mapping for keywords (suicide, meds, followup, housing, food).

Frontend
- A new Chat box appears at the bottom of the Peer Guide Coach panel.
- Type a question (e.g., “needs FUH after hospital”, “med refill issue”).
- You’ll get a concise reply plus clickable suggested actions that can be added as note snippets.

Files touched
- Backend: `backend/app.py` (chat models, intents, `/api/chat` route)
- Frontend: `src/widget/ChatBox.tsx`, `src/widget/api.ts`, `src/widget/WidgetFrame.tsx`

## Linting and Tooling Updates
- ESLint upgraded to v9 with flat config.
  - Config: `frontend/eslint.config.js` using `@eslint/js`, `@typescript-eslint` v8, `react-hooks`, `react-refresh`, and `globals`.
  - Some stricter rules are temporarily relaxed to match existing code (`no-explicit-any`, `no-unused-vars`, `no-empty`).
- Vite upgraded to 7.x and dependencies audited (0 known vulnerabilities post-upgrade).

## Troubleshooting
- Port 5173 in use:
  - The dev helper auto-selects a free port and prints it.
  - To close stray Vite processes on Windows:
    - Kill by name: `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'vite' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`
    - Or by port range: `5173..5190 | ForEach-Object { Get-NetTCPConnection -State Listen -LocalPort $_ -ErrorAction SilentlyContinue } | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Try { Stop-Process -Id $_ -Force } Catch {} }`

## Disclaimers
- This is a beta, non-clinical tool for demonstration purposes only.
- No ML or external APIs; purely rule-based with synthetic data.
- Do not use for actual patient care.

## License
MIT. See [LICENSE](LICENSE).
