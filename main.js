(() => {
  const S = window.SITE;
  const $ = (s) => document.querySelector(s);
  const { eco, animate, accentRGB, redrawers, ecoHooks } = window.UI;

  /* ---------------- content ---------------- */
  const soon = (n) => Array.from({ length: n }, (_, i) => `
    <article class="soon reveal"><span class="soon-n">${String(i + 1).padStart(2, "0")}</span><p>Coming soon</p></article>`).join("");

  $("#projectList").innerHTML = S.projects.length ? S.projects.map((p) => `
    <article class="project reveal">
      <header>
        <span class="pname">${p.name}${p.active ? '<span class="status">active</span>' : ""}</span>
        <span class="period">${p.period || ""}</span>
      </header>
      <h3>${p.title}</h3>
      <p>${p.text}</p>
      <ul class="tags">${(p.tags || []).map((t) => `<li>${t}</li>`).join("")}</ul>
      ${p.link ? `<a class="more" href="${p.link}" target="_blank" rel="noopener">View project →</a>` : ""}
    </article>`).join("") : soon(3);

  $("#pubList").innerHTML = S.publications.map((p) => `
    <li class="reveal">
      <span class="yr">${p.year}</span>
      <div>
        <a class="t" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">${p.title}</a>
        <span class="a">${p.authors}</span>
        <div class="v">${p.venue} · DOI ${p.doi}</div>
      </div>
    </li>`).join("");

  $("#newsList").innerHTML = S.news.map((n) => `
    <li class="reveal"><div class="meta">${n.date}<span>${n.tag}</span></div><p>${n.text}</p></li>`).join("");

  $("#readingList").innerHTML = S.reading.length ? S.reading.map((r) => `
    <li class="reveal"><a href="${r.url}" target="_blank" rel="noopener"><span class="org">${r.org}</span><span class="ttl">${r.title}</span></a></li>`).join("")
    : `<li class="soon reveal"><p>Coming soon</p></li>`;

  if (S.cv) { const b = $("#cvBtn"); b.href = S.cv; b.target = "_blank"; b.textContent = "CV (PDF)"; b.removeAttribute("aria-disabled"); }

  document.querySelectorAll(".theme, .stack-panel, .lab-card, .sec-head, .blog-card").forEach((el) => el.classList.add("reveal"));
  window.UI.reveal();

  /* ---------------- hero sky scene: fit to screen shape ---------------- */
  (function sky() {
    const svg = $("#sky");
    const fit = () => svg.setAttribute("preserveAspectRatio",
      innerWidth / innerHeight < 1.15 ? "xMidYMax meet" : "xMidYMax slice");
    fit(); addEventListener("resize", fit);
  })();

  /* ---------------- hero: dotted world map ---------------- */
  (function hero() {
    const cv = $("#heroCanvas"), ctx = cv.getContext("2d");
    // rough continent blobs in normalised map coords: [cx, cy, rx, ry]
    const land = [
      [0.19, 0.30, 0.11, 0.13], [0.13, 0.22, 0.07, 0.07], [0.25, 0.45, 0.04, 0.05],
      [0.31, 0.64, 0.05, 0.15], [0.38, 0.13, 0.04, 0.04],
      [0.50, 0.27, 0.05, 0.06], [0.53, 0.53, 0.07, 0.15], [0.58, 0.40, 0.04, 0.04],
      [0.68, 0.27, 0.15, 0.11], [0.66, 0.44, 0.03, 0.06], [0.76, 0.49, 0.04, 0.05],
      [0.85, 0.70, 0.05, 0.05], [0.82, 0.32, 0.04, 0.06]
    ];
    const isLand = (x, y) => {
      const n = 0.18 * Math.sin(x * 37 + y * 11) * Math.cos(y * 29 - x * 7);
      return land.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1 + n);
    };
    let W, H, dpr = 1, map, mx = 0, my = 0;
    const box = () => { // world map box, sized to cover the whole hero
      const w = Math.max(W * 1.04, H * 1.7), h = w * 0.5;
      return { x: (W - w) / 2, y: (H - h) / 2 + H * 0.04, w, h };
    };
    function build() {
      W = cv.clientWidth; H = cv.clientHeight;
      dpr = eco() ? 1 : Math.min(devicePixelRatio || 1, 2); // eco: fewer pixels to push
      cv.width = W * dpr; cv.height = H * dpr;
      map = document.createElement("canvas");
      map.width = cv.width; map.height = cv.height;
      const m = map.getContext("2d"); m.scale(dpr, dpr);
      const b = box(), step = Math.max(6, b.w / 150);
      const rgb = accentRGB(cv);
      for (let gy = 0; gy < b.h; gy += step) for (let gx = 0; gx < b.w; gx += step) {
        const nx = gx / b.w, ny = gy / b.h;
        if (!isLand(nx, ny)) continue;
        const a = 0.16 + 0.3 * Math.abs(Math.sin(gx * 0.13 + gy * 0.07));
        m.fillStyle = `rgba(${rgb}, ${a})`;
        m.beginPath(); m.arc(b.x + gx, b.y + gy, step * 0.17, 0, 7); m.fill();
      }
    }
    // static map: redraw only on resize, theme change or (mouse) parallax
    let queued = false;
    function frame() {
      queued = false;
      if (!map.width || W !== cv.clientWidth) build();
      if (!map.width) return void setTimeout(kick, 250); // hidden at load: try again
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(map, mx * 10, my * 6, W, H);
      // central vignette keeps the headline readable
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.45);
      g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    const kick = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
    addEventListener("pointermove", (e) => {
      if (!animate() || scrollY > innerHeight) return;
      mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; kick();
    });
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); kick(); }, 150); });
    redrawers.push(() => { build(); kick(); });
    ecoHooks.push(() => { mx = my = 0; build(); kick(); });
    build(); kick();
  })();

  /* ---------------- lab: ULA beam pattern ---------------- */
  (function beam() {
    const cv = $("#beamCanvas"), ctx = cv.getContext("2d");
    const nIn = $("#nIn"), aIn = $("#aIn");
    const W = cv.width, H = cv.height, cx = W / 2, cy = H - 20, R = Math.min(W / 2 - 20, H - 40);
    const FLOOR = -40; // dB
    function draw() {
      const N = +nIn.value, th0 = (+aIn.value * Math.PI) / 180, rgb = accentRGB(cv);
      $("#nOut").textContent = N; $("#aOut").textContent = aIn.value + "°";
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "11px JetBrains Mono, monospace"; ctx.textAlign = "center";
      for (let db = 0; db >= FLOOR; db -= 10) { // range rings
        const r = R * (1 - db / FLOOR);
        ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI); ctx.stroke();
        if (db > FLOOR) ctx.fillText(db + " dB", cx + r - 16, cy + 14);
      }
      for (let a = -90; a <= 90; a += 30) { // spokes
        const t = (a * Math.PI) / 180;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.sin(t), cy - R * Math.cos(t)); ctx.stroke();
        ctx.fillText(a + "°", cx + (R + 12) * Math.sin(t), cy - (R + 8) * Math.cos(t) + 4);
      }
      // array factor, d = λ/2  →  ψ = π (sinθ − sinθ0)
      ctx.beginPath();
      for (let i = 0; i <= 720; i++) {
        const th = -Math.PI / 2 + (i / 720) * Math.PI;
        const psi = Math.PI * (Math.sin(th) - Math.sin(th0));
        const s = Math.abs(Math.sin(N * psi / 2)), d = Math.abs(N * Math.sin(psi / 2));
        const af = d < 1e-9 ? 1 : s / d;
        const db = Math.max(FLOOR, 20 * Math.log10(af + 1e-12));
        const r = R * (1 - db / FLOOR);
        const x = cx + r * Math.sin(th), y = cy - r * Math.cos(th);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, `rgba(${rgb}, 0.05)`); g.addColorStop(1, `rgba(${rgb}, 0.35)`);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = 1.6; ctx.stroke(); ctx.lineWidth = 1;
      for (let k = 0; k < N; k++) { // array elements
        const x = cx + (k - (N - 1) / 2) * Math.min(10, 300 / N);
        ctx.fillStyle = `rgb(${rgb})`; ctx.fillRect(x - 1.5, cy + 2, 3, 6);
      }
    }
    nIn.addEventListener("input", draw); aIn.addEventListener("input", draw);
    redrawers.push(draw); draw();
  })();

  /* ---------------- lab: 16-QAM constellation over AWGN ---------------- */
  (function qam() {
    const cv = $("#qamCanvas"), ctx = cv.getContext("2d"), sIn = $("#sIn");
    const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, sc = H / 10;
    const lv = [-3, -1, 1, 3], ES = 10; // average symbol energy of 16-QAM
    const pts = []; let tot = 0, err = 0, running = false, visible = false;
    const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
    const dec = (v) => Math.max(-3, Math.min(3, 2 * Math.round((v - 1) / 2) + 1));
    const reset = () => { pts.length = 0; tot = err = 0; $("#sOut").textContent = sIn.value + " dB"; };
    function step() {
      const snr = 10 ** (+sIn.value / 10), sig = Math.sqrt(ES / (2 * snr)), rgb = accentRGB(cv);
      // animated: trickle 40 symbols per frame; static (eco): one full batch
      for (let k = 0, n = running ? 40 : 2500; k < n; k++) {
        const i = lv[(Math.random() * 4) | 0], q = lv[(Math.random() * 4) | 0];
        const ri = i + sig * gauss(), rq = q + sig * gauss();
        const bad = dec(ri) !== i || dec(rq) !== q;
        tot++; if (bad) err++;
        pts.push([ri, rq, bad]); if (pts.length > 2500) pts.shift();
      }
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      for (const b of [-2, 0, 2]) { // decision boundaries
        ctx.beginPath(); ctx.moveTo(cx + b * sc, 0); ctx.lineTo(cx + b * sc, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, cy - b * sc); ctx.lineTo(W, cy - b * sc); ctx.stroke();
      }
      for (const [x, y, bad] of pts) {
        ctx.fillStyle = bad ? "rgba(255,90,110,0.85)" : `rgba(${rgb}, 0.45)`;
        ctx.fillRect(cx + x * sc - 1, cy - y * sc - 1, 2, 2);
      }
      ctx.fillStyle = "#fff";
      for (const i of lv) for (const q of lv) { ctx.beginPath(); ctx.arc(cx + i * sc, cy - q * sc, 3, 0, 7); ctx.fill(); }
      $("#serOut").textContent = tot > 400 ? (err / tot).toExponential(2) : "…";
      if (running) requestAnimationFrame(step);
    }
    const sync = () => {
      const was = running; running = visible && animate();
      if (running && !was) requestAnimationFrame(step);
      if (!running) { reset(); step(); }
    };
    sIn.addEventListener("input", () => { reset(); if (!running) step(); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(cv);
    ecoHooks.push(sync);
    redrawers.push(() => { if (!running) { reset(); step(); } });
    reset(); step();
  })();
})();
