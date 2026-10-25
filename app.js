/* Strategic Marketing Advisors — interactivity */
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  if (nav) {
    var lastScrollY = window.scrollY;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var current = window.scrollY;
        var mobileOpen = nav.classList.contains("is-open");
        nav.classList.toggle("nav--hidden", !mobileOpen && current > lastScrollY && current > 140);
        nav.classList.toggle("nav--scrolled", current > 16);
        lastScrollY = Math.max(current, 0);
        ticking = false;
      });
    }, { passive: true });
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) {
        // collapse any expanded accordions when menu closes
        nav.querySelectorAll(".m-row__toggle[aria-expanded='true']").forEach(function (b) {
          b.setAttribute("aria-expanded", "false");
          var sub = b.closest(".m-row").nextElementSibling;
          if (sub && sub.classList.contains("m-sub")) { sub.style.maxHeight = ""; sub.inert = true; sub.setAttribute("aria-hidden", "true"); }
        });
      }
    });
    // accordion expand/collapse for sub-pages
    nav.querySelectorAll(".m-sub").forEach(function (sub) { sub.inert = true; sub.setAttribute("aria-hidden", "true"); });
    nav.querySelectorAll(".m-row__toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var sub = btn.closest(".m-row").nextElementSibling;
        if (!sub || !sub.classList.contains("m-sub")) return;
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
        sub.inert = isOpen;
        sub.setAttribute("aria-hidden", isOpen ? "true" : "false");
        sub.style.maxHeight = isOpen ? "" : sub.scrollHeight + "px";
      });
    });
    // close the whole menu when a real link is tapped
    nav.querySelectorAll(".nav__mobile a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Trust tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var triggers = root.querySelectorAll(".tab-trigger");
    var panels = root.querySelectorAll(".tab-panel");
    triggers.forEach(function (t) {
      t.addEventListener("click", function () {
        var i = t.getAttribute("data-tab");
        triggers.forEach(function (x) { x.classList.toggle("is-active", x === t); });
        panels.forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-panel") === i);
        });
      });
    });
  });

  /* ---------- Sticky-scroll image swap (layout-348) ---------- */
  var sticky = document.querySelector("[data-sticky]");
  if (sticky && "IntersectionObserver" in window) {
    var steps = sticky.querySelectorAll(".sticky-step");
    var imgs = sticky.querySelectorAll(".sticky-media img");
    var setActive = function (idx) {
      imgs.forEach(function (im) {
        im.classList.toggle("is-active", im.getAttribute("data-img") === String(idx));
      });
    };
    var obs = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (e) {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
      });
      if (best) {
        var idx = best.target.getAttribute("data-step");
        if (idx != null) setActive(idx);
      }
    }, { threshold: [0.5, 0.75, 1], rootMargin: "-10% 0px -10% 0px" });
    steps.forEach(function (s) { obs.observe(s); });
  }
})();
