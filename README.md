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
