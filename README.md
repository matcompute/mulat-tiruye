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

## Add photos (Beyond the lab gallery)
1. Put photos in a tag folder: `private/photos-inbox/mountains/`, `travel/`, `labs/`, `events/` (or make a new one).
   The file name becomes the caption: `dolomites-sunrise.jpg` → "Dolomites sunrise".
2. Run `python tools/photos.py`. It fixes rotation, **removes GPS/EXIF data**, and writes
   1600px + 640px WebP files to `assets/gallery/`, then adds them to `assets/gallery/gallery.js`.
3. Optionally edit `caption` / `place` in `gallery.js`, then commit and push.

Originals stay in `private/`, which is never committed or deployed.

## "Buy me a coffee" (blog pages)
Create a free page on buymeacoffee.com (or ko-fi.com) and paste its link into `url` in `support.js`.
Until then the coffee menu shows with "opening soon". Menu items and prices are in the same file.
