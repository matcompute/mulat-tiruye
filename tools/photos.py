"""Add photos to the website gallery.

1. Drop photos (jpg/png/heic-exported jpg) into a tag folder under
   private/photos-inbox/   e.g.  private/photos-inbox/mountains/dolomites-sunrise.jpg
   Folder name = filter tag (travel, mountains, labs, events, or any new one).
   File name   = default caption ("dolomites-sunrise" -> "Dolomites sunrise").
2. Run:   python tools/photos.py
3. Check assets/gallery/gallery.js, fix captions/places if you like, commit, push.

What it does: fixes phone rotation, strips ALL metadata (EXIF, GPS location),
writes a 1600px WebP (full view) and a 640px WebP (grid thumbnail), and adds
the photo to assets/gallery/gallery.js. Originals stay in private/ (never uploaded).
Re-running is safe: photos already in the gallery are skipped.
"""
import json
import re
from datetime import date
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
INBOX = ROOT / "private" / "photos-inbox"
OUT = ROOT / "assets" / "gallery"
DATA = OUT / "gallery.js"
EXTS = {".jpg", ".jpeg", ".png", ".webp"}
HEADER = DATA.read_text(encoding="utf-8").split("window.GALLERY")[0] if DATA.exists() else ""


def load():
    if not DATA.exists():
        return []
    m = re.search(r"window\.GALLERY\s*=\s*(\[.*\])\s*;", DATA.read_text(encoding="utf-8"), re.S)
    return json.loads(m.group(1)) if m else []


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "photo"


def save(img, path, max_side, quality):
    im = img.copy()
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    im.save(path, "WEBP", quality=quality, method=6)  # new file: no metadata carried over
    return im.size


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    gallery = load()
    known = {g["src"] for g in gallery}
    added = 0
    for f in sorted(INBOX.rglob("*")):
        if f.suffix.lower() not in EXTS or not f.is_file():
            continue
        tag = f.parent.name if f.parent != INBOX else "life"
        name = slug(f"{tag}-{f.stem}")
        src, thumb = f"assets/gallery/{name}.webp", f"assets/gallery/{name}-thumb.webp"
        if src in known:
            continue
        with Image.open(f) as raw:
            img = ImageOps.exif_transpose(raw).convert("RGB")
            w, h = save(img, OUT / f"{name}.webp", 1600, 80)
            save(img, OUT / f"{name}-thumb.webp", 640, 72)
        gallery.append({
            "src": src, "thumb": thumb, "w": w, "h": h, "tag": tag.capitalize(),
            "caption": f.stem.replace("-", " ").replace("_", " ").strip().capitalize(),
            "place": "", "date": date.today().strftime("%b %Y"),
        })
        added += 1
        print(f"  + {f.relative_to(INBOX)}  ->  {src}  ({w}x{h})")

    body = json.dumps(gallery, indent=2, ensure_ascii=False)
    DATA.write_text(HEADER + f"window.GALLERY = {body};\n", encoding="utf-8")
    print(f"Done: {added} new photo(s), {len(gallery)} in gallery.")


if __name__ == "__main__":
    main()
