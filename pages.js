/* Strategic Marketing Advisors — sub-page interactivity */
(function () {
  "use strict";

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll("[data-faq]").forEach(function (root) {
    var items = root.querySelectorAll(".faq__item");
    items.forEach(function (item) {
      var q = item.querySelector(".faq__q");
      if (!q) return;
      q.addEventListener("click", function () {
        var open = item.classList.contains("is-open");
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var oq = other.querySelector(".faq__q");
          if (oq) oq.setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add("is-open");
          q.setAttribute("aria-expanded", "true");
        }
      });
    });
  });

  /* ---------- Category filter (Resources) ---------- */
  document.querySelectorAll("[data-chips]").forEach(function (root) {
    var chips = root.querySelectorAll(".chip");
    var cards = document.querySelectorAll(".post-card[data-category]");
    function apply(cat) {
      cards.forEach(function (c) {
        var show = cat === "all" || c.getAttribute("data-category") === cat;
        c.style.display = show ? "" : "none";
      });
      chips.forEach(function (c) {
        c.classList.toggle("is-active", (c.getAttribute("data-filter") || "all") === cat);
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        apply(chip.getAttribute("data-filter") || "all");
      });
    });
    function fromHash() {
      var h = (location.hash || "").replace("#", "");
      if (["mindset", "strategies", "tactics"].indexOf(h) !== -1) apply(h);
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
  });
})();
