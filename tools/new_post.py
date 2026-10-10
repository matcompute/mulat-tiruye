"""Create a new blog post and wire it into the site.

Usage (from the site folder):
    python tools/new_post.py "Post title" "One or two sentences that summarise it."
Options:
    --slug my-url-name     address of the post (default: made from the title)
    --minutes 6            reading time shown on the cards (default: 5)

What it does, in one go:
  1. creates blog/<slug>.html (same design as the other posts, with starter text)
  2. adds a card for it at the top of blog/index.html
  3. shows it as the featured post on the home page
  4. adds it to sitemap.xml

Then: write your text in blog/<slug>.html (between the WRITE HERE comments),
preview with  python -m http.server 8080 , and commit + push.
"""
import argparse
import html
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOG = ROOT / "blog"
SITE = "https://www.mulattiruye.com"
AUTHOR = "Mulat Ayinet Tiruye"

STARTER = """      <!-- WRITE HERE: start ------------------------------------------------
           Use <p> for paragraphs, <h2> for section titles, <ul><li> for lists,
           <blockquote> for a highlighted thought, <b> for bold.            -->
      <p>Open with the one idea you want readers to remember.</p>

      <h2>First section title</h2>
      <p>Explain it in plain words. One idea per paragraph.</p>
      <ul>
        <li><b>Point one:</b> a short explanation.</li>
        <li><b>Point two:</b> a short explanation.</li>
      </ul>

      <h2>Where my research fits</h2>
      <blockquote>One or two sentences that link this topic to BUC-6G.</blockquote>
      <!-- WRITE HERE: end -------------------------------------------------- -->

"""


def sub1(pattern, repl, text, what):
    out, n = re.subn(pattern, lambda _m: repl, text, count=1, flags=re.S)
    if n != 1:
        sys.exit(f"Could not find the {what}. Has the page layout changed? Nothing was written.")
    return out


def main():
    ap = argparse.ArgumentParser(description="Create a new blog post.")
    ap.add_argument("title")
    ap.add_argument("summary")
    ap.add_argument("--slug")
    ap.add_argument("--minutes", type=int, default=5)
    a = ap.parse_args()

    slug = a.slug or re.sub(r"[^a-z0-9]+", "-", a.title.lower()).strip("-")[:60].strip("-")
    post = BLOG / f"{slug}.html"
    if post.exists():
        sys.exit(f"blog/{slug}.html already exists. Pick another --slug.")
    shells = sorted(p for p in BLOG.glob("*.html") if p.name != "index.html")
    if not shells:
        sys.exit("No existing post to copy the page design from.")

    title, summary = html.escape(a.title), html.escape(a.summary)
    meta = f"{date.today():%b %Y} · {a.minutes} min read"
    url = f"{SITE}/blog/{slug}"
    page_title = f"{title} · {AUTHOR}"

    # 1) the post page, built from an existing post's shell
    s = (BLOG / "imt-2030.html" if (BLOG / "imt-2030.html").exists() else shells[0]).read_text(encoding="utf-8")
    s = sub1(r"<title>.*?</title>", f"<title>{page_title}</title>", s, "page title")
    s = sub1(r'<meta name="description" content=".*?" />', f'<meta name="description" content="{summary}" />', s, "description")
    s = sub1(r'<link rel="canonical" href=".*?" />', f'<link rel="canonical" href="{url}" />', s, "canonical link")
    s = sub1(r'<meta property="og:url" content=".*?" />', f'<meta property="og:url" content="{url}" />', s, "og:url")
    s = sub1(r'<meta property="og:title" content=".*?" />', f'<meta property="og:title" content="{page_title}" />', s, "og:title")
    s = sub1(r'<section class="post-hero force-dark">.*?</section>',
             f'''<section class="post-hero force-dark">
    <div class="wrap">
      <p class="crumbs"><a href="/blog/">Blog</a> · {meta}</p>
      <h1>{title}</h1>
      <p>{summary}</p>
    </div>
  </section>''', s, "post header")
    s = sub1(r'(?<=<article class="prose wrap">\n).*?(?=      <div class="share")', STARTER, s, "article body")
    s = sub1(r'<div class="post-foot">.*?</div>',
             '<div class="post-foot">\n        <a href="/blog/">← All posts</a>\n      </div>', s, "post footer")

    # 2) card on the blog index (newest first)
    idx_path = BLOG / "index.html"
    idx = idx_path.read_text(encoding="utf-8")
    card = f'''        <li>
          <a class="blog-card" href="/blog/{slug}.html">
            <span class="blog-meta">{meta}</span>
            <h3>{title}</h3>
            <p>{summary}</p>
            <span class="more">Read the post →</span>
          </a>
        </li>
'''
    idx = sub1(r'(?<=<ul class="posts">\n)', card, idx, "post list on blog/index.html")

    # 3) featured post on the home page
    home_path = ROOT / "index.html"
    home = home_path.read_text(encoding="utf-8")
    home = sub1(r'<a class="blog-card" href="blog/.*?</a>',
                f'''<a class="blog-card" href="blog/{slug}.html">
        <span class="blog-meta">{meta}</span>
        <h3>{title}</h3>
        <p>{summary}</p>
        <span class="more">Read the post →</span>
      </a>''', home, "blog teaser on the home page")

    # 4) sitemap
    sm_path = ROOT / "sitemap.xml"
    sm = sm_path.read_text(encoding="utf-8")
    sm = sub1(r"</urlset>", f"""  <url>
    <loc>{url}</loc>
    <lastmod>{date.today():%Y-%m-%d}</lastmod>
    <priority>0.6</priority>
  </url>

</urlset>""", sm, "end of sitemap.xml")

    # write only after every step succeeded
    post.write_text(s, encoding="utf-8")
    idx_path.write_text(idx, encoding="utf-8")
    home_path.write_text(home, encoding="utf-8")
    sm_path.write_text(sm, encoding="utf-8")
    print(f"Created blog/{slug}.html  ->  {url}")
    print("Updated blog/index.html, index.html (featured post) and sitemap.xml")
    print(f"Next: write your text in blog/{slug}.html, then commit and push.")


if __name__ == "__main__":
    main()
