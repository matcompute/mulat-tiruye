/* Shared page chrome: theme · accent · eco dock, toast, scroll reveal.
   Used by the home page and blog pages. Exposes window.UI for page scripts. */
(() => {
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };
  const pick = (a) => a[(Math.random() * a.length) | 0];

  const UI = window.UI = {
    redrawers: [],
    ecoHooks: [],
    eco: () => root.dataset.eco === "on",
    animate: () => !reduceMotion && root.dataset.eco !== "on",
    accentRGB: (el = root) => getComputedStyle(el).getPropertyValue("--accent-rgb").trim() || "57, 213, 255"
  };
  const redraw = () => UI.redrawers.forEach((f) => f());

  /* ---------------- toast ---------------- */
  const toast = UI.toast = (() => {
    const el = $("#toast"); let t;
    return (text, action) => {
      if (!el) return;
      el.textContent = text;
      if (action) {
        const b = document.createElement("button");
        b.textContent = action.label;
        b.onclick = () => { el.classList.remove("show"); action.run(); };
        el.append(b);
      }
      el.classList.add("show"); clearTimeout(t);
      t = setTimeout(() => el.classList.remove("show"), action ? 7000 : 2600);
    };
  })();

  /* ---------------- theme ---------------- */
  const lightMQ = matchMedia("(prefers-color-scheme: light)");
  const MODES = {
    system: "System theme 🖥️ Following your device.",
    light: "Light mode ☀️ Hello, daylight.",
    dark: "Dark mode 🌙 OLED pixels get to nap."
  };
  function applyMode(mode, say) {
    root.dataset.mode = mode;
    root.dataset.theme = mode === "system" ? (lightMQ.matches ? "light" : "dark") : mode;
    $("#modeBtn").dataset.tip = "Theme: " + mode;
    store("mode", mode); redraw();
    if (say) toast(MODES[mode]);
  }
  lightMQ.addEventListener("change", () => { if (root.dataset.mode === "system") applyMode("system"); });
  $("#modeBtn").addEventListener("click", () => {
    const order = ["system", "light", "dark"];
    applyMode(order[(order.indexOf(root.dataset.mode) + 1) % 3], true);
  });

  /* ---------------- accent ---------------- */
  const ACCENTS = { cyan: "Cyan Nova", violet: "Violet Pulse", mono: "Mono White" };
  const ACCENT_TOAST = {
    cyan: "Cyan Nova 💠 Cool as a clean channel.",
    violet: "Violet Pulse 💜 Same physics, new vibe.",
    mono: "Mono White 🤍 Clean, classic, zero distractions."
  };
  function applyAccent(a, say) {
    root.dataset.accent = a;
    $("#accentBtn").dataset.tip = "Colour: " + ACCENTS[a];
    store("accent", a); redraw();
    if (say) toast(ACCENT_TOAST[a]);
  }
  $("#accentBtn").addEventListener("click", () => {
    const order = Object.keys(ACCENTS);
    applyAccent(order[(order.indexOf(root.dataset.accent) + 1) % order.length], true);
  });

  /* ---------------- eco ---------------- */
  const ECO_ON = [
    "Eco mode on 🌱 Antennas switched to sleep state.",
    "Eco mode on 🌱 Fewer frames, happier planet.",
    "Eco mode on 🌱 Even 6G base stations take naps.",
    "Eco mode on 🌱 Your battery just sent a thank-you note."
  ];
  const ECO_OFF = ["Eco mode off ⚡ Beams back on air.", "Eco mode off ⚡ The packets are flying again."];
  function applyEco(on, say) {
    root.dataset.eco = on ? "on" : "off";
    $("#ecoBtn").dataset.tip = "Eco mode: " + (on ? "on" : "off");
    $("#ecoBtn").setAttribute("aria-pressed", String(on));
    store("eco", root.dataset.eco); UI.ecoHooks.forEach((f) => f());
    if (say) toast(pick(on ? ECO_ON : ECO_OFF));
  }
  $("#ecoBtn").addEventListener("click", () => applyEco(!UI.eco(), true));

  applyMode(root.dataset.mode || "system");
  applyAccent(ACCENTS[root.dataset.accent] ? root.dataset.accent : "cyan");
  applyEco(UI.eco());

  // low battery? offer eco mode politely, once per visit
  if (navigator.getBattery) navigator.getBattery().then((b) => {
    let asked = false;
    const check = () => {
      if (asked || UI.eco() || b.charging || b.level > 0.2) return;
      asked = true;
      toast(`🔋 Battery at ${Math.round(b.level * 100)}%. Save some juice?`, { label: "Go eco", run: () => applyEco(true, true) });
    };
    check(); b.addEventListener("levelchange", check); b.addEventListener("chargingchange", check);
  }).catch(() => {});

  /* ---------------- nav over a dark hero ---------------- */
  const hero = document.querySelector(".hero, .post-hero");
  if (hero) new IntersectionObserver(([e]) => $("#nav").classList.toggle("force-dark", e.isIntersecting),
    { rootMargin: "-60px 0px 0px 0px" }).observe(hero);

  /* ---------------- nav: glass on scroll, mobile menu, active link ---------------- */
  const nav = $("#nav"), menuBtn = $("#menuBtn");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); }
  };
  if (menuBtn) {
    menuBtn.addEventListener("click", (e) => { e.stopPropagation(); setMenu(!nav.classList.contains("open")); });
    document.querySelectorAll("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("click", (e) => { if (!nav.contains(e.target)) setMenu(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  // highlight the section currently on screen (same-page links only)
  const navMap = new Map();
  document.querySelectorAll('#navLinks a[href^="#"]').forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (sec) navMap.set(sec, a);
  });
  if (navMap.size) {
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove("active"));
      navMap.get(e.target).classList.add("active");
    }), { rootMargin: "-45% 0px -50% 0px" });
    navMap.forEach((_, sec) => spy.observe(sec));
  }

  /* ---------------- blog: coffee menu + share buttons ---------------- */
  const support = $("#support"), SUP = window.SUPPORT;
  if (support && SUP) {
    const live = !!SUP.url;
    support.querySelector(".coffee-menu").innerHTML = SUP.menu.map((c) => `
      <a class="coffee" ${live ? `href="${SUP.url}" target="_blank" rel="noopener"` : 'aria-disabled="true"'}>
        <span class="cup" aria-hidden="true">${c.icon}<i></i><i></i><i></i></span>
        <b>${c.name}</b><span class="note">${c.note}</span><span class="price">${c.price}</span>
      </a>`).join("");
    support.querySelector(".coffee-status").textContent = live
      ? "Opens Buy Me a Coffee in a new tab. Any amount is welcome. Amesegenalehu! 🙏"
      : "The coffee shop is opening soon ☕";
  }
  const share = $("#share");
  if (share) {
    const url = encodeURIComponent(location.href.split("#")[0]), title = encodeURIComponent(document.title);
    share.querySelector('[data-share="linkedin"]').href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    share.querySelector('[data-share="x"]').href = `https://x.com/intent/post?url=${url}&text=${title}`;
    share.querySelector('[data-share="copy"]').addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(location.href.split("#")[0]); toast("Link copied 🔗 Ready for LinkedIn."); }
      catch (_) { toast("Couldn't copy. Use the address bar ✋"); }
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  UI.reveal = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
  };

  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
