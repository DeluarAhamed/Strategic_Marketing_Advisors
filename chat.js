/* Strategic Marketing Advisors — live chat widget */
(function () {
  "use strict";
  var launch = document.getElementById("chatLaunch");
  var panel = document.getElementById("chatPanel");
  if (!launch || !panel) return;

  var body = document.getElementById("chatBody");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");
  var closeBtn = document.getElementById("chatClose");
  var base = window.__SMA_BASE || "";
  var started = false;

  /* reveal launcher shortly after load */
  setTimeout(function () { launch.classList.add("show"); }, 900);

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addMsg(text, who) {
    var el = document.createElement("div");
    el.className = "chat-msg " + (who || "bot");
    if (who === "user") el.textContent = text;
    else el.innerHTML = text;
    body.appendChild(el);
    scrollDown();
    return el;
  }

  function typing(then) {
    var el = document.createElement("div");
    el.className = "chat-msg bot";
    el.textContent = "…";
    body.appendChild(el);
    scrollDown();
    setTimeout(function () { el.remove(); then(); }, 650);
  }

  var QUICK = [
    { q: "Book a free consultation", a: 'Great choice! Our 30-minute strategy calls are free — no pitch, no pressure. You can request a call through our <a href="' + base + 'contact">contact page</a>, or call <a href="tel:+18773558745">877-355-8745</a>.' },
    { q: "What services do you offer?", a: 'We offer executive consulting, Google Ads, SEO &amp; local search, AI automation, reputation management, brand &amp; logo design, and web design. See them all on our <a href="' + base + 'services">services page</a>.' },
    { q: "Where are you located?", a: 'We\'re based in Cashiers, North Carolina, and work with clients across the country — in person and remotely. Map &amp; details are on the <a href="' + base + 'contact#map">contact page</a>.' },
    { q: "Talk to a human", a: 'Of course! The fastest way is to call <a href="tel:+18773558745">877-355-8745</a> or email <a href="mailto:hello@strategicmarketingadvisors.com">hello@strategicmarketingadvisors.com</a>. A founder reads every message.' }
  ];

  function renderQuick() {
    var wrap = document.createElement("div");
    wrap.className = "chat-quick";
    QUICK.forEach(function (item) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chat-chip";
      chip.innerHTML = item.q;
      chip.addEventListener("click", function () {
        addMsg(item.q, "user");
        wrap.remove();
        typing(function () {
          addMsg(item.a, "bot");
          setTimeout(renderQuick, 400);
        });
      });
      wrap.appendChild(chip);
    });
    body.appendChild(wrap);
    scrollDown();
  }

  function start() {
    if (started) return;
    started = true;
    typing(function () {
      addMsg("Welcome! I’m an automated website guide. Messages here are not sent to our team. Choose a topic below, or call or email us to discuss your business.", "bot");
      setTimeout(renderQuick, 350);
    });
  }

  function open() {
    panel.classList.add("is-open");
    launch.classList.add("is-open");
    launch.setAttribute("aria-expanded", "true");
    start();
    setTimeout(function () { input && input.focus(); }, 300);
  }
  function close() {
    panel.classList.remove("is-open");
    launch.classList.remove("is-open");
    launch.setAttribute("aria-expanded", "false");
  }

  launch.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = (input.value || "").trim();
    if (!val) return;
    addMsg(val, "user");
    input.value = "";
    typing(function () {
      addMsg('This website guide cannot send your message to the team. Please call <a href="tel:+18773558745">877-355-8745</a>, email <a href="mailto:hello@strategicmarketingadvisors.com">hello@strategicmarketingadvisors.com</a> or <a href="/contact">prepare an inquiry email</a>.', "bot");
    });
  });
})();
