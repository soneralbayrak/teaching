/* soneralbayrak.com/teaching — main.js
   Everything here is progressive enhancement: the page is complete without it.
   1. The running head hides while the title block is in view (a title page
      carries no running head) and shows the current section otherwise.
   2. The contents list marks the current section.
   3. Links to files open in a new tab.
   4. Collapsed archives are expanded before printing. */
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
})();
