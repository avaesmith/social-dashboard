# Social Dashboard

A lightweight dashboard for tracking brand social reporting readiness across:

- LinkedIn
- Instagram
- Facebook
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
- LinkedIn, Instagram, and YouTube are loaded from `data/performq126.xlsx` (with `.csv` fallback) and benchmarked against `data/performq125.xlsx` (with `.csv` fallback).
- Facebook is loaded from `data/fbq126.xlsx` (with `.csv` fallback) and benchmarked against `data/fbq125.xlsx` (with `.csv` fallback).
- Combined comparisons use LinkedIn, Instagram, YouTube, and Facebook channel data from those same source files.
- Supported dashboard metrics are: impressions, engagement, reach, video views, engagement rate, and shares.
- Facebook engagement totals are calculated from `reactions + comments + shares`, Facebook omits impressions cards, and Facebook shows Total Clicks instead of Engagement Rate on KPI cards.
- Instagram KPI cards hide Video Views.
- Individual platform tabs show top posts ranked by engagement rate; the Combined tab focuses on channel-to-channel comparisons.
- Combined benchmark charts compare Engagement by platform and Reach by platform.
- Combined channel snapshot compares Engagements, Reach, and Shares (without Impressions).
- Facebook metric-details table omits Impressions and Engagement Rate.
- Top-posts area includes ranked lists for video views and engagements in addition to the primary top-post ranking.
- Top posts are displayed as clean numbered links (Post 1, Post 2, etc.) ranked by engagement rate.
- A welcome popup appears on first page load and auto-dismisses after 1 minute (or can be closed manually).
