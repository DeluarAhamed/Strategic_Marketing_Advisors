/* Strategic Marketing Advisors — GSAP motion layer
   Loads after gsap + ScrollTrigger. Enhances scroll reveals,
   the hero entrance, and adds subtle parallax. Falls back
   gracefully (motion.js handles reveals if GSAP is absent). */
(function () {
  "use strict";
  if (!window.gsap) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tell motion.js that GSAP owns the reveals
  window.__gsapReveals = true;

  if (reduce) {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    return;
  }

  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Global page entrance ---------- */
  gsap.from(".nav__inner", { opacity: 0, y: -18, duration: 0.7, ease: "power3.out" });

  /* ---------- Scroll reveals (batched, staggered) ---------- */
  var reveals = gsap.utils.toArray(".reveal");
  gsap.set(reveals, { opacity: 0, y: 30 });
  if (window.ScrollTrigger) {
    ScrollTrigger.batch(reveals, {
      start: "top 88%",
      once: true,
      onEnter: function (els) {
        gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, overwrite: true });
      }
    });
  } else {
    gsap.to(reveals, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 });
  }

  /* ---------- Hero entrance ---------- */
  var hero = document.querySelector(".hero2__card");
  if (hero) {
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero2__eyebrow", { opacity: 0, y: 18, duration: 0.55 })
      .from(".hero2 h1", { opacity: 0, y: 32, duration: 0.85 }, "-=0.25")
      .from(".hero2__sub", { opacity: 0, y: 20, duration: 0.6 }, "-=0.5")
      .from(".hero2__cta", { opacity: 0, y: 18, duration: 0.55 }, "-=0.4")
      .from(".hero2__stat", { opacity: 0, y: 18, scale: 0.96, duration: 0.6 }, "-=0.35")
      .from(".hero2__photo", { opacity: 0, xPercent: 12, duration: 1.1, ease: "power2.out" }, "-=1.05");

    if (window.ScrollTrigger) {
      gsap.to(".hero2__photo", {
        yPercent: -7, ease: "none",
        scrollTrigger: { trigger: ".hero2", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* ---------- Sub-page hero choreography ---------- */
  var subHero = document.querySelector(".phero, .page-hero");
  if (subHero) {
    var heroContent = subHero.querySelector(".phero__inner > div, .page-hero__inner > div");
    var crumbs = subHero.querySelector(".breadcrumb");
    var kicker = subHero.querySelector(".kicker, .tagrow");
    var heading = subHero.querySelector("h1");
    var lead = subHero.querySelector(".lead-xl, .t-medium");
    var actions = subHero.querySelector(".phero__actions, .article__byline");
    var stl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (crumbs) stl.from(crumbs, { opacity: 0, y: 12, duration: .45 });
    if (kicker) stl.from(kicker, { opacity: 0, y: 14, duration: .45 }, "-=.2");
    if (heading) stl.from(heading, { opacity: 0, y: 38, duration: .85 }, "-=.25");
    if (lead) stl.from(lead, { opacity: 0, y: 22, duration: .65 }, "-=.5");
    if (actions) stl.from(actions, { opacity: 0, y: 18, duration: .55 }, "-=.4");
    if (heroContent && window.ScrollTrigger) {
      gsap.to(heroContent, { yPercent: 7, ease: "none", scrollTrigger: { trigger: subHero, start: "top top", end: "bottom top", scrub: true } });
    }
  }

  /* ---------- Image reveals and parallax ---------- */
  gsap.utils.toArray(".rounded-img, .article-hero, .media > img").forEach(function (img) {
    if (!window.ScrollTrigger) return;
    gsap.fromTo(img, { clipPath: "inset(0 0 100% 0)", scale: 1.08 }, {
      clipPath: "inset(0 0 0% 0)", scale: 1, duration: 1.15, ease: "power3.out",
      scrollTrigger: { trigger: img, start: "top 86%", once: true }
    });
  });

  /* ---------- Card groups enter as a composed sequence ---------- */
  gsap.utils.toArray(".service-grid, .tst-grid, .bcards, .team-grid, .footer__cols, .keypoints").forEach(function (group) {
    if (!window.ScrollTrigger) return;
    var cards = group.children;
    if (!cards.length) return;
    gsap.from(cards, {
      opacity: 0, y: 34, scale: .975, duration: .75, ease: "power3.out", stagger: .08,
      scrollTrigger: { trigger: group, start: "top 84%", once: true }
    });
  });

  /* ---------- Gentle section depth ---------- */
  if (window.ScrollTrigger) {
    gsap.utils.toArray(".section .shead, .section .head-center").forEach(function (head) {
      gsap.from(head, { opacity: 0, y: 28, duration: .8, ease: "power3.out", scrollTrigger: { trigger: head, start: "top 87%", once: true } });
    });
  }

  /* ---------- Pointer depth for cards, desktop only ---------- */
  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".card, .bcard, .svc-card, .team-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var box = card.getBoundingClientRect();
        var rx = ((event.clientY - box.top) / box.height - .5) * -4;
        var ry = ((event.clientX - box.left) / box.width - .5) * 5;
        gsap.to(card, { rotationX: rx, rotationY: ry, transformPerspective: 800, duration: .35, ease: "power2.out" });
      });
      card.addEventListener("pointerleave", function () { gsap.to(card, { rotationX: 0, rotationY: 0, duration: .55, ease: "power3.out" }); });
    });
  }

  /* ---------- Section heading underline-style emphasis ---------- */
  // Sub-page headings are handled by the hero timeline above.

  /* ---------- Numbered timeline orbs pop ---------- */
  gsap.utils.toArray(".steps").forEach(function (steps) {
    var orbs = steps.querySelectorAll(".step__no");
    if (!orbs.length || !window.ScrollTrigger) return;
    gsap.from(orbs, {
      scale: 0.3, opacity: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.12,
      scrollTrigger: { trigger: steps, start: "top 75%", once: true }
    });
  });

  window.addEventListener("load", function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
})();
