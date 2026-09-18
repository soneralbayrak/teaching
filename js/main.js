/* soneralbayrak.com/teaching — main.js
   Everything here is progressive enhancement: the page is complete without it.
   1. The running head hides while the title block is in view (a title page
      carries no running head) and shows the current section otherwise.
   2. The contents list marks the current section.
   3. Links to files open in a new tab.
   4. Collapsed archives are expanded before printing.
   5. A theme toggle lets the reader choose light or dark instead of following
      the system setting. */
(function () {
  "use strict";

  var head  = document.querySelector(".running-head");
  var mark  = document.getElementById("mark");
  var title = document.querySelector(".titleblock");
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));

  /* Sections and articles that carry an id and a heading, in document order. */
  var targets = Array.prototype.slice.call(
    document.querySelectorAll("main section[id], main article[id]")
  ).map(function (el) {
    var h = el.querySelector("h2, h3");
    var num = h ? h.querySelector(".num") : null;
    var text = h ? h.textContent.trim() : (el.getAttribute("aria-label") || "");
    return {
      el: el,
      id: el.id,
      label: h && num ? (num.textContent.trim() + "\u2003" + text.replace(num.textContent, "").trim()) : text
    };
  });

  /* 1. Running head visibility. */
  if (head && title && "IntersectionObserver" in window) {
    head.classList.add("is-hidden");
    new IntersectionObserver(function (entries) {
      head.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { rootMargin: "-48px 0px 0px 0px" }).observe(title);
  }

  /* 1 & 2. Current section, computed from scroll position. */
  var ticking = false;
  function currentTarget() {
    var line = 0.3 * window.innerHeight;  /* the reading line */
    var current = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].el.getBoundingClientRect().top <= line) current = targets[i];
    }
    return current;
  }
  function update() {
    ticking = false;
    var cur = currentTarget();
    if (mark) mark.textContent = cur ? cur.label : "Teaching";
    tocLinks.forEach(function (a) {
      a.classList.toggle("active", !!cur && a.getAttribute("href") === "#" + cur.id);
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  /* 3. Files open in a new tab; the page stays where the reader left it. */
  Array.prototype.forEach.call(
    document.querySelectorAll("a[href$='.pdf'], a[href$='.zip'], a[href$='.png'], a[href$='.jpg']"),
    function (a) { a.target = "_blank"; a.rel = "noopener"; }
  );

  /* 4. Print the whole document, archives included. */
  window.addEventListener("beforeprint", function () {
    Array.prototype.forEach.call(document.querySelectorAll("details"), function (d) { d.open = true; });
  });

  /* 5. Theme toggle.
     The page follows the system setting until the reader picks a theme. A pick
     sets data-theme on <html> (the stylesheet keys its palette on it) and is
     kept in localStorage under "theme", where the inline script in <head>
     reads it before the first paint. Picking the theme the system already
     shows removes the stored choice, so the page goes back to following the
     system rather than being pinned to one theme for good. */
  var root   = document.documentElement;
  var system = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function systemTheme()  { return system && system.matches ? "dark" : "light"; }
  function currentTheme() { return root.getAttribute("data-theme") || systemTheme(); }
  function storedTheme()  {
    try { var t = localStorage.getItem("theme"); return t === "light" || t === "dark" ? t : null; }
    catch (e) { return null; }
  }
  function storeTheme(t)  {
    try { if (t) localStorage.setItem("theme", t); else localStorage.removeItem("theme"); } catch (e) {}
  }
  function applyTheme(t) {            /* t: "light", "dark", or null to follow the system */
    if (t) root.setAttribute("data-theme", t); else root.removeAttribute("data-theme");
    var next = currentTheme() === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " theme");
    toggle.title = "Switch to " + next + " theme";
  }

  var bar = document.createElement("div");
  bar.className = "theme-bar";
  bar.innerHTML =
    '<div class="inner"><button type="button" class="theme-toggle">' +
      '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
        '<circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M10 2.75A7.25 7.25 0 0 0 10 17.25Z" fill="currentColor"/>' +
      '</svg>' +
    '</button></div>';
  var toggle = bar.querySelector(".theme-toggle");
  /* After the running head in the document, so it follows the running head's link in the tab order. */
  if (head) head.parentNode.insertBefore(bar, head.nextSibling);
  else document.body.insertBefore(bar, document.body.firstChild);

  toggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    var choice = next === systemTheme() ? null : next;
    storeTheme(choice);
    applyTheme(choice);
  });
  /* The system setting changed: the palette follows by itself when no theme
     is chosen; the button's label needs updating either way. */
  if (system) {
    if (system.addEventListener) system.addEventListener("change", function () { applyTheme(storedTheme()); });
    else if (system.addListener) system.addListener(function () { applyTheme(storedTheme()); });
  }
  /* Chosen in another tab: follow it here too. */
  window.addEventListener("storage", function (e) {
    if (e.key === "theme" || e.key === null) applyTheme(storedTheme());
  });
  applyTheme(storedTheme());
})();
