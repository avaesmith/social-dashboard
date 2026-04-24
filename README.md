# Social Dashboard

A lightweight dashboard for tracking brand social reporting readiness across:

- LinkedIn
- Instagram
- Facebook
- X
- YouTube

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
- LinkedIn, Instagram, X, and YouTube are loaded from `data/perform.csv`.
- Their previous timeframe comparison is loaded from `data/performq125.csv`.
- Facebook is loaded from `data/fbq126` (current) and `data/fbq125` (previous), checking `.xlsx` first and then `.csv`.
- For Facebook files, the loader checks `.xlsx` first (when SheetJS is available) and then `.csv`.
- Supported dashboard metrics are: impressions, engagement, reach, video views, engagement rate, and shares.
- Individual platform tabs show top posts ranked by engagement rate; the Combined tab focuses on channel-to-channel comparisons.
- Top posts are displayed as clean numbered links (Post 1, Post 2, etc.) ranked by engagement rate.
- A welcome popup appears on first page load and auto-dismisses after 1 minute (or can be closed manually).
