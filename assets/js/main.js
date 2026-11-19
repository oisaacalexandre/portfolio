/* ISAAC ALEXANDRE — interações leves */
(function () {
  "use strict";
  var doc = document.documentElement;
  var body = document.body;
  var lessMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- faixa animada: loop contínuo de verdade ----------
     Cada faixa tem um grupo de palavras repetido. Aqui completamos cópias até cobrir
     a largura da tela + 1 grupo e mandamos a faixa andar exatamente a largura de UM grupo:
     quando o ciclo recomeça, a posição é idêntica (sem salto, sem vazio). */
  function fitMarquees() {
    document.querySelectorAll(".marquee-track").forEach(function (t) {
      if (!t.offsetParent) return;                       // faixa do outro idioma (oculta)
      var groups = t.querySelectorAll(".marquee-group");
      if (!groups.length) return;
      var gw = groups[0].getBoundingClientRect().width;
      if (!gw) return;
      var need = Math.ceil(t.parentElement.clientWidth / gw) + 1;
      for (var i = groups.length; i < need; i++) t.appendChild(groups[0].cloneNode(true));
      t.style.setProperty("--shift", gw + "px");
      t.style.setProperty("--dur", (gw / 26).toFixed(2) + "s");   // ~26 px/s, suave
    });
  }

  /* ---------- idioma (PT / EN) ---------- */
  function getLang() {
    try { return localStorage.getItem("ia-lang") || "pt"; } catch (e) { return "pt"; }
  }
  function setLang(l) {
    doc.setAttribute("data-lang", l);
    doc.setAttribute("lang", l === "en" ? "en" : "pt-BR");
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === l ? "true" : "false");
    });
    try { localStorage.setItem("ia-lang", l); } catch (e) {}
    fitMarquees();   // a faixa do idioma que acabou de aparecer também precisa das cópias
  }
  setLang(getLang());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMarquees);
  var mqTimer;
  window.addEventListener("resize", function () { clearTimeout(mqTimer); mqTimer = setTimeout(fitMarquees, 150); });
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang")); });
  });

  /* ---------- menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  function toggleMenu(open) {
    var isOpen = typeof open === "boolean" ? open : !body.classList.contains("menu-open");
    body.classList.toggle("menu-open", isOpen);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (menu) menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    if (isOpen && header) header.classList.remove("is-hidden");
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { toggleMenu(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("menu-open")) toggleMenu(false);
  });
  if (menu) {
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { toggleMenu(false); });
    });
    // prévia de imagem ao passar o mouse
    var preview = menu.querySelector(".menu-preview");
    if (preview) {
      menu.querySelectorAll("[data-preview]").forEach(function (a) {
        var img = new Image();
        img.alt = "";
        img.loading = "lazy";
        img.src = a.getAttribute("data-preview");
        preview.appendChild(img);
        a.addEventListener("mouseenter", function () {
          preview.querySelectorAll("img").forEach(function (i) { i.classList.remove("on"); });
          img.classList.add("on");
        });
      });
      var first = preview.querySelector("img");
      if (first) first.classList.add("on");
    }
  }

  /* ---------- header: some ao rolar pra baixo, volta ao subir ---------- */
  var header = document.querySelector(".site-header");
  var lastY = window.scrollY;
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (header) {
        header.classList.toggle("is-scrolled", y > 8);
        if (!body.classList.contains("menu-open")) {
          header.classList.toggle("is-hidden", y > lastY && y > 320);
        }
      }
      lastY = y;
      ticking = false;
    });
  }, { passive: true });

  /* ---------- revelar ao entrar na tela ---------- */
  var rvEls = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rvEls.forEach(function (el) { io.observe(el); });
  } else {
    rvEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- vídeos do YouTube (carregam só no clique) ---------- */
  document.querySelectorAll(".yt[data-yt]").forEach(function (el) {
    var id = el.getAttribute("data-yt");
    var img = el.querySelector("img");
    if (img) {
      img.addEventListener("load", function () {
        // maxresdefault inexistente volta como 120x90 cinza
        if (img.naturalWidth < 200 && img.src.indexOf("maxres") > -1) {
          img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
        }
      });
      img.addEventListener("error", function () {
        img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
      });
    }
    el.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.title = el.getAttribute("aria-label") || "Vídeo";
      el.innerHTML = "";
      el.appendChild(f);
      el.style.cursor = "default";
    }, { once: true });
  });

  /* ---------- carrossel ---------- */
  document.querySelectorAll(".carousel").forEach(function (c) {
    var track = c.querySelector(".carousel-track");
    var slides = track ? Array.prototype.slice.call(track.children) : [];
    if (slides.length < 2) return;
    var dotsWrap = c.querySelector(".carousel-dots");
    var dots = [];
    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.type = "button";
      d.setAttribute("aria-label", "Imagem " + (i + 1));
      d.addEventListener("click", function () { go(i); });
      if (dotsWrap) dotsWrap.appendChild(d);
      dots.push(d);
    });
    function current() { return Math.round(track.scrollLeft / track.clientWidth); }
    function go(i) {
      var n = (i + slides.length) % slides.length;
      track.scrollTo({ left: n * track.clientWidth, behavior: "smooth" });
    }
    function sync() {
      var i = current();
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
    }
    track.addEventListener("scroll", function () { requestAnimationFrame(sync); }, { passive: true });
    var prev = c.querySelector("[data-prev]");
    var next = c.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { go(current() - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(current() + 1); restart(); });
    dots.forEach(function (d) { d.addEventListener("click", restart); });
    sync();

    /* troca automática (data-autoplay="ms"): pausa com mouse/teclado em cima,
       recomeça a contagem após interação manual e volta da última para a primeira */
    var every = parseInt(c.getAttribute("data-autoplay"), 10);
    var timer = null, hold = false;
    var narrow = window.matchMedia ? window.matchMedia("(max-width: 760px)") : { matches: false };   // no celular, só manual
    function tick() { if (!hold && !document.hidden && !narrow.matches) go(current() + 1); }
    function restart() {
      if (!every) return;
      clearInterval(timer);
      timer = setInterval(tick, every);
    }
    if (every) {
      c.addEventListener("mouseenter", function () { hold = true; });
      c.addEventListener("mouseleave", function () { hold = false; restart(); });
      c.addEventListener("focusin", function () { hold = true; });
      c.addEventListener("focusout", function (e) { if (!c.contains(e.relatedTarget)) { hold = false; restart(); } });
      track.addEventListener("pointerdown", restart, { passive: true });   // arrastar no celular
      restart();
    }
  });

  /* ---------- abas de subprojetos (com #hash) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab[aria-controls]"));
  function showTab(id, scroll) {
    var found = false;
    tabs.forEach(function (t) {
      var on = t.getAttribute("aria-controls") === id;
      if (on) found = true;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
    if (!found) return false;
    // revela elementos do painel recém-aberto
    var panel = document.getElementById(id);
    if (panel) panel.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
    if (scroll) {
      var bar = document.querySelector(".tabs");
      if (bar) {
        var y = bar.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0);
        if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
    return true;
  }
  if (tabs.length) {
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        var id = t.getAttribute("aria-controls");
        showTab(id, true);
        if (history.replaceState) history.replaceState(null, "", "#" + id);
      });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        n.focus(); n.click();
      });
    });
    var h = location.hash.replace("#", "");
    if (!h || !showTab(h, false)) showTab(tabs[0].getAttribute("aria-controls"), false);
    window.addEventListener("hashchange", function () {
      showTab(location.hash.replace("#", ""), true);
    });
  }

  /* ---------- lightbox ---------- */
  var zooms = Array.prototype.slice.call(document.querySelectorAll(".zoom"));
  if (zooms.length) {
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Imagem ampliada");
    lb.innerHTML =
      '<span class="lb-count label"></span>' +
      '<img alt="">' +
      '<button class="lb-close" type="button" aria-label="Fechar">&#x2715;</button>' +
      '<button class="lb-prev" type="button" aria-label="Anterior">&larr;</button>' +
      '<button class="lb-next" type="button" aria-label="Próxima">&rarr;</button>';
    body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lb-count");
    var list = [];
    var idx = 0;
    var lastFocus = null;

    function visibleZooms() {
      return zooms.filter(function (z) { return z.offsetParent !== null || z.closest(".carousel-track"); })
        .filter(function (z) { var p = z.closest(".tab-panel"); return !p || !p.hidden; });
    }
    function render() {
      var z = list[idx];
      var im = z.querySelector("img");
      lbImg.src = z.getAttribute("href") || im.currentSrc || im.src;
      lbImg.alt = im.alt || "";
      lbCount.textContent = (idx + 1) + " / " + list.length;
    }
    function open(z) {
      list = visibleZooms();
      idx = Math.max(0, list.indexOf(z));
      lastFocus = document.activeElement;
      render();
      lb.classList.add("open");
      body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    }
    function close() {
      lb.classList.remove("open");
      body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    function step(d) { idx = (idx + d + list.length) % list.length; render(); }

    zooms.forEach(function (z) {
      z.addEventListener("click", function (e) { e.preventDefault(); open(z); });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
    // swipe no celular
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      sx = null;
    });
  }

  /* ---------- GIFs das capas: se falhar ou se o sistema pedir menos movimento, fica a capa estática ---------- */
  document.querySelectorAll(".card-media .anim").forEach(function (g) {
    if (lessMotion) { g.remove(); return; }
    g.addEventListener("error", function () { g.remove(); });
    if (g.complete && g.currentSrc && g.naturalWidth === 0) g.remove();
  });

  /* ---------- Letterboxd: atividade recente (4 últimos filmes de data/letterboxd.js) ---------- */
  var LB = window.LETTERBOXD;
  var films = ((LB && LB.films) || []).slice(0, 4);
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function T(pt, en) { return '<span data-l="pt">' + pt + '</span><span data-l="en">' + en + "</span>"; }
  // estrelas no formato do Letterboxd (★★★½); só aparece se houver nota
  function stars(r) {
    if (r == null) return "";
    var s = "";
    for (var k = 1; k <= Math.floor(r); k++) s += "★";
    if (r % 1) s += "½";
    return s;
  }
  var MES_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var MES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function when(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return "";
    var d = String(+m[3]).padStart(2, "0"), mi = +m[2] - 1;
    return T(d + " " + MES_PT[mi], MES_EN[mi] + " " + d);
  }

  var lbxList = document.getElementById("lbx-list");
  if (lbxList) {
    if (!films.length) {
      lbxList.innerHTML = '<li class="lbx-empty">' + T("Os filmes aparecem aqui assim que o Letterboxd responder.", "Films show up here as soon as Letterboxd responds.") + "</li>";
    } else {
      lbxList.innerHTML = films.map(function (f) {
        var rate = "";
        if (f.rating != null) rate += '<span class="lbx-stars" aria-hidden="true">' + stars(f.rating) + '</span><span class="sr">' + T("nota " + f.rating + " de 5", "rated " + f.rating + " of 5") + "</span>";
        if (f.liked) rate += '<span class="lbx-like" aria-hidden="true">♥</span><span class="sr">' + T("curtido", "liked") + "</span>";
        if (f.rewatch) rate += '<span class="lbx-re" aria-hidden="true">↻</span><span class="sr">' + T("revisto", "rewatched") + "</span>";
        return '<li><a href="' + esc(f.link || (LB && LB.profile) || "https://letterboxd.com/isaacalexandre/") + '" target="_blank" rel="noopener">' +
          '<span class="lbx-poster">' + (f.poster ? '<img src="' + esc(f.poster) + '" alt="" width="600" height="900" loading="lazy" referrerpolicy="no-referrer">' : "") + "</span>" +
          '<span class="lbx-rate">' + rate + "</span>" +
          '<span class="lbx-name">' + esc(f.title) + (f.year ? ' <span class="sr">(' + esc(f.year) + ")</span>" : "") + "</span>" +
          '<span class="lbx-date">' + when(f.watched) + "</span>" +
          "</a></li>";
      }).join("");
    }
  }

/* ---------- ano no rodapé ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
