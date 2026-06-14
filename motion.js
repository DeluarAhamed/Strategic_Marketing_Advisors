/* Strategic Marketing Advisors — motion & scroll behavior */
(function () {
  "use strict";

  /* ---------- Scroll reveal (skipped when GSAP owns it) ---------- */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal"));
  if (window.gsap) {
    // gsap-init.js handles reveals
  } else if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Count-up for stats (per-element, universal) ---------- */
  function runCount(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var dec = (el.getAttribute("data-dec") | 0);
    var dur = 1600, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(tick);
  }
  var countEls = [].slice.call(document.querySelectorAll("[data-count]"));
  if (countEls.length) {
    if ("IntersectionObserver" in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
      }, { threshold: 0.4 });
      countEls.forEach(function (el) { co.observe(el); });
    } else { countEls.forEach(runCount); }
  }

  /* ---------- Testimonial wall: cursor-following glow ---------- */
  var wall = document.querySelector("[data-twall]");
  if (wall) {
    var glowWrap = wall.querySelector("[data-twall-glow]");
    if (glowWrap) {
      glowWrap.addEventListener("pointermove", function (e) {
        var card = e.target.closest(".tcard2");
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    }
    if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      var focus = document.createElement("div");
      focus.className = "testimonial-focus";
      focus.setAttribute("aria-hidden", "true");
      document.body.appendChild(focus);
      wall.addEventListener("pointerover", function (event) {
        var card = event.target.closest(".tcard2");
        if (!card || event.relatedTarget && card.contains(event.relatedTarget)) return;
        wall.classList.add("paused");
        focus.innerHTML = card.innerHTML;
        focus.classList.add("is-visible");
      });
      wall.addEventListener("pointerout", function (event) {
        var card = event.target.closest(".tcard2");
        if (!card || event.relatedTarget && card.contains(event.relatedTarget)) return;
        focus.classList.remove("is-visible");
        wall.classList.remove("paused");
      });
    }
  }
})();
