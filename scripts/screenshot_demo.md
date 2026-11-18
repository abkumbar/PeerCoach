# Demo Walkthrough (GIFs)

This doc aggregates short GIFs that show the full app in action for each sample member, including the new Chat with Coach box.

Tip: Store your GIFs in `scripts/media/` so they’re bundled by `make package`.

## Scenario 1 — Maria Rivera (Crisis)

What to capture:
- Select Maria in Members list; show red risk banner and reasons.
- Open "Brief C-SSRS" flow and show the guidance with 988 escalation.
- Use Chat with Coach with a prompt like "member said not wanting to live"; show reply and suggested actions.

GIF:

![Maria Rivera — Full Demo](./media/maria-rivera-full-demo.gif)

## Scenario 2 — Jamal Harris (Post-discharge)

What to capture:
- Select Jamal; show amber risk with FUH gap.
- Open "7-day Follow Up" nudge; show scheduling template.
- Use Chat with Coach with a prompt like "after hospital follow up"; show reply and suggested actions.

GIF:

![Jamal Harris — Full Demo](./media/jamal-harris-full-demo.gif)

## Scenario 3 — Ava Chen (Recovery)

What to capture:
- Select Ava; show green risk.
- Open BarrierSolver in Recovery mode; add a small next step.
- Use Chat with Coach with a prompt like "recovery goal for this week"; show reply and suggested actions.

GIF:

![Ava Chen — Full Demo](./media/ava-chen-full-demo.gif)

---

## How to Record on Windows

Option A — ScreenToGif (recommended)
- Install: https://www.screentogif.com/
- Settings: 30 fps, crop to app window; keep under ~10–15s per scenario.
- Export: GIF, optimized palette; save to `scripts/media/` with names above.

Option B — OBS + ffmpeg
- Record a short MP4 in OBS, then convert to GIF via ffmpeg:
  - `ffmpeg -i input.mp4 -vf "fps=12,scale=1280:-1:flags=lanczos" -loop 0 output.gif`

## Packaging
`make package` zips the repo (excluding large folders) including `scripts/media/*.gif` and this markdown so you can share a self-contained demo.
