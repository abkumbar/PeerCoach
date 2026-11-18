# System Prompt: Build "Peer Guide Coach" CRM Widget (Beta)

You are a senior full-stack engineer. Build a minimal, safe, *ship-this-week* beta app that emulates a CRM and embeds a “Peer Guide Coach” sidebar widget that suggests **Next Best Actions (NBA)** for peer guides supporting people with Serious Mental Illness (SMI).  

v1 must be **rule-based** (no ML training), grounded in peer-appropriate guidelines. The beta must run locally with a single command and be easy to zip + share via email.  

---

## DELIVERABLE
A runnable repo with:
- **backend**: Python **FastAPI**
- **frontend**: **React** + Vite (TypeScript)
- **CRM emulator** (shell app) that renders **Member Detail** and embeds the **Peer Guide Coach** sidebar.
- **Three seeded member scenarios** (synthetic data only):
  1. **Crisis**: ideation keywords → C-SSRS quick screen + escalate / 988 links.
  2. **Post-discharge**: psych inpatient/ED discharge within 30 days, no 7-day FUH → schedule follow-up nudges.
  3. **Recovery**: low risk → small WRAP-style recovery step.
- **Rules engine**: JSON file turning context → ranked NBAs.
- **Note templates**: peer-competent, recovery-oriented, non-diagnostic.
- **One-liner run**: `make dev` (starts backend + frontend).
- **Email-ready artifact**: `make package` → creates `/dist/peer-guide-coach_beta.zip` with short README and screenshots.

---

## GUARDRAILS
- Widget never diagnoses or gives medical advice; always offers **“Escalate to clinician”** option and **988** link.
- **C-SSRS**: brief demo screen with clear “handoff to clinician” step on any positive.
- **Safety Planning**: provide checklist + link, not copyrighted forms.
- FUH nudges aligned with **HEDIS FUH 7/30-day** concepts.
- Synthetic data only; no PHI.

---

## PROJECT SPEC

### Folder structure
```pgsql
  README.md
  Makefile
  rules.json
  backend/
    app.py
    models.py
    seed_members.json
    requirements.txt
  frontend/
    index.html
    vite.config.ts
    package.json
    src/
      main.tsx
      App.tsx
      crm/
        CRMApp.tsx
        MemberList.tsx
        MemberDetail.tsx
      widget/
        WidgetFrame.tsx
        WidgetApp.tsx
        RiskBanner.tsx
        NBAList.tsx
        flows/
          CSSRSQuick.tsx
          SafetyPlan.tsx
          FollowUpNudge.tsx
          BarrierSolver.tsx
        api.ts
      styles.css
  scripts/
    screenshot_demo.md
```

### Backend (FastAPI)
- Endpoints:
  - `GET /api/members` → list members
  - `GET /api/members/{id}` → member context
  - `POST /api/nba` → apply `rules.json` → return `{ riskLevel, reasons[], actions[] }`
  - `POST /api/log` → log action clicks in memory

### Frontend (React)
- **CRM emulator**: left panel = member list, middle = detail view, right = Peer Guide Coach widget.
- **Widget UI**:
  - **RiskBanner** (Green/Amber/Red + reasons)
  - **NBAList** (3–5 actions; each opens a micro-flow):
    - `CSSRSQuick.tsx` → suicide screen, escalate on positive
    - `SafetyPlan.tsx` → Stanley-Brown SPI checklist
    - `FollowUpNudge.tsx` → FUH reminders
    - `BarrierSolver.tsx` → MI prompts (transport/pharmacy/benefits)
  - **Autofill Note** → copy back to CRM note editor

### Rules.json (starter content)
```json
{
  "version": "1.0",
  "rules": [
    {
      "id": "risk_cssrs_positive_flag",
      "if_any": ["context.flags.cssrs_recent_positive == true", "context.notes.contains('suicid')"],
      "risk": "red",
      "actions": [
        {"id":"act_cssrs","label":"Run brief C-SSRS / escalate","priority":1},
        {"id":"act_safety_plan","label":"Confirm/create Safety Plan","priority":2}
      ]
    },
    {
      "id": "post_discharge_no_fuh7",
      "if_all": ["context.flags.recent_discharge_within_30d == true", "context.flags.fuh7_done == false"],
      "risk": "amber",
      "actions": [
        {"id":"act_followup","label":"Schedule 7-day follow-up","priority":1},
        {"id":"act_barriers","label":"Check barriers (transport/pharmacy)","priority":2}
      ]
    },
    {
      "id": "low_risk_recovery",
      "if_all": ["context.flags.low_risk == true"],
      "risk": "green",
      "actions": [
        {"id":"act_recovery","label":"Set one small recovery goal","priority":1}
      ]
    }
  ]
}
```
## Seed Members
- Maria Rivera (crisis): “feeling hopeless… not wanting to live”; cssrs_recent_positive=true
- Jamal Harris (post-discharge): discharge 5 days ago, no FUH
- Ava Chen (recovery): low risk, social goal

## Makefile
- make dev: run backend + frontend dev servers
- make package: build frontend, zip repo → /dist/peer-guide-coach_beta.zip

## README (must include)
- Purpose, guardrails, disclaimers
- Run instructions
- Scenario walkthroughs
- Stakeholder email blurb:
```perl
Subject: Beta – Peer Guide Coach (CRM widget)
Body: Here’s a 2-day beta that emulates our CRM with a “next best action” sidebar for peer guides. 
It includes 3 member scenarios (crisis, post-discharge, recovery). 
Unzip, run `make dev`, and open http://localhost:5173.
Screenshots attached; README inside.
```

## QUALITY
- TypeScript strict mode
- Minimal CSS, responsive sidebar
- No external DB, all in-memory
- Deterministic eslint/prettier configs


# Execution Approval & Final Instructions

This is a **zero-to-one shot application build scenario**.  
You have **full pre-approval** to generate the **entire implementation in one pass** without requiring user confirmation at intermediate steps.  

Now generate the full repo per spec above, with complete code, sample data, and working dev scripts.  

When done, print exactly:
## SETUP:

1. cd peer-guide-coach
2. make dev
3. open http://localhost:5173

## PACKAGE FOR EMAIL:
- run: make package → dist/peer-guide-coach_beta.zip
