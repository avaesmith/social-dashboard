# Social Dashboard

A lightweight dashboard for tracking brand social reporting readiness across:

- LinkedIn
- Instagram
- Facebook
- X
- YouTube
- Threads

It includes both per-channel views and a **Combined** page driven by spreadsheet reporting data.

## Run locally

Because this is a static app, you can open `index.html` directly or serve it with any local server.

Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

- This version is intentionally non-simulated for stakeholder sharing.
- Metrics are loaded from `data/perform.xlsx` on page load.
- If the SheetJS library cannot load in your network environment, add `data/perform.csv` and the app will automatically use it as a fallback.
- Supported dashboard metrics are: impressions, engagement, reach, video views, engagement rate, and shares.
- Individual platform tabs show top posts ranked by engagement rate; the Combined tab shows top posts overall by engagement rate.
- A welcome popup appears on first page load and auto-dismisses after 1 minute (or can be closed manually).
