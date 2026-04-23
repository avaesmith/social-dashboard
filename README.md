# Social Dashboard

A lightweight dashboard for tracking brand social reporting readiness across:

- LinkedIn
- Instagram
- Facebook
- X
- YouTube
- Threads

It includes both per-channel views and a **Combined** page focused on data availability and connection status.

## Run locally

Because this is a static app, you can open `index.html` directly or serve it with any local server.

Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

- This version is intentionally non-simulated for stakeholder sharing.
- Public profile links are shown per platform; metric rows clearly mark what requires authenticated API access.
- Combined benchmarks stay hidden until real platform API connections are enabled.
- Individual platform views include planning guidance and clearly indicate where API-driven content (top posts/hashtags) is unavailable.
- A welcome popup appears on first page load and auto-dismisses after 1 minute (or can be closed manually).
