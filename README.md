# Mulat A. Tiruye: research website

Personal PhD site (DISI, University of Trento): AI-native 6G systems and networks.
Plain HTML, CSS and JS with no build step.

## Update content
Edit `content.js`, then commit and push. Vercel redeploys automatically.

- `news`: newest first
- `projects`: an empty list shows "Coming soon" cards
- `publications`: entries with a DOI link
- `reading`: an empty list shows a placeholder
- `cv`: put the PDF in `assets/` and set `cv: "assets/<file>.pdf"`

## Run locally
    python -m http.server 8080
