# Social Dashboard

A lightweight live dashboard for tracking brand performance across:

- LinkedIn
- Instagram
- Facebook
- X
- YouTube
- Threads
- Pinterest

It includes both per-channel views and a **Combined** page with aggregated metrics.

## Run locally

Because this is a static app, you can open `index.html` directly or serve it with any local server.

Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

- Metrics refresh every 15 seconds to simulate live updates.
- Data generation and refresh logic live in `app.js`.
- Combined view includes benchmarking bar charts for followers and engagement rate across all channels.
- Individual platform views include simulated top posts, trending hashtags, topics to discuss, and topics to avoid.

