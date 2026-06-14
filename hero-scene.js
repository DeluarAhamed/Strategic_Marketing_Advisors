/* Content-aware animated hero scenes for Strategic Marketing Advisors. */
(function () {
  "use strict";

  var hero = document.querySelector(".hero2__card, .page-hero, .phero");
  if (!hero) return;
  // The homepage intentionally keeps its founder-led static hero treatment.
  if (hero.classList.contains("hero2__card")) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var path = location.pathname.toLowerCase();
  var title = (document.querySelector("h1") || {}).textContent || "";
  var signal = (path + " " + title).toLowerCase();
  var theme = "strategy";

  if (/founder|veteran|executive|leadership|about\.html/.test(signal)) theme = "leadership";
  else if (/automation|web-design|seo|google-ads|gbp|digital|direct-mail/.test(signal)) theme = "digital";
  else if (/reputation|testimonial|brand|mascot|phone|repeat-business|contact/.test(signal)) theme = "brand";

  var base = window.__SMA_BASE || "";
  var shell = document.createElement("div");
  shell.className = "motion-hero";
  shell.setAttribute("aria-hidden", "true");
  shell.innerHTML =
    '<img class="motion-hero__art" src="' + base + 'assets/images/generated/hero-' + theme + '.jpg" alt="">' +
    '<canvas class="motion-hero__canvas"></canvas>' +
    '<div class="motion-hero__glow"></div>' +
    '<div class="motion-hero__orbit motion-hero__orbit--a"></div>' +
    '<div class="motion-hero__orbit motion-hero__orbit--b"></div>' +
    '<div class="motion-hero__beam"></div>';
  hero.insertBefore(shell, hero.firstChild);
  hero.classList.add("has-motion-hero", "motion-theme-" + theme);

  var canvas = shell.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  var width = 0;
  var height = 0;
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var state = { time: 0, energy: 0.2 };

  function resize() {
    var box = hero.getBoundingClientRect();
    width = Math.max(1, Math.round(box.width));
    height = Math.max(1, Math.round(box.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function line(x1, y1, x2, y2, alpha, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color || "rgba(222,236,255," + alpha + ")";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function dot(x, y, radius, alpha, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color || "rgba(241,216,205," + alpha + ")";
    ctx.fill();
  }

  function drawStrategy(t) {
    var originX = width * 0.52;
    var originY = height * 0.82;
    for (var i = 0; i < 7; i++) {
      var phase = t * (0.1 + i * 0.006) + i * 0.9;
      ctx.beginPath();
      ctx.moveTo(originX, originY + i * 5);
      ctx.bezierCurveTo(width * 0.62, height * (0.7 - i * 0.025), width * 0.74, height * (0.55 + Math.sin(phase) * 0.04), width * (0.9 + i * 0.012), height * (0.18 + i * 0.045));
      ctx.strokeStyle = i % 3 === 1 ? "rgba(173,42,50,.32)" : "rgba(214,232,250,.18)";
      ctx.lineWidth = 1 + (i % 2);
      ctx.stroke();
      var p = (t * 0.035 + i * 0.14) % 1;
      dot(originX + (width * 0.39) * p, originY - height * 0.62 * p + Math.sin(phase + p * 4) * 18, 1.5 + i % 2, 0.45);
    }
  }

  function drawDigital(t) {
    var cols = Math.max(7, Math.floor(width / 150));
    var rows = Math.max(4, Math.floor(height / 120));
    var points = [];
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var px = width * 0.48 + x * (width * 0.5 / cols) + Math.sin(t * 0.17 + y + x) * 6;
        var py = 35 + y * ((height - 70) / rows) + Math.cos(t * 0.13 + x) * 5;
        points.push({ x: px, y: py });
        dot(px, py, (x + y) % 4 === 0 ? 2.4 : 1.2, 0.26 + ((x + y) % 3) * 0.08, (x + y) % 5 === 0 ? "rgba(186,55,62,.55)" : null);
      }
    }
    for (var i = 0; i < points.length; i++) {
      if (i + 1 < points.length && (i + 1) % cols) line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 0.09);
      if (i + cols < points.length) line(points[i].x, points[i].y, points[i + cols].x, points[i + cols].y, 0.07);
    }
  }

  function drawBrand(t) {
    var cx = width * 0.78 + pointer.x * 18;
    var cy = height * 0.58 + pointer.y * 12;
    for (var i = 0; i < 8; i++) {
      var radius = 35 + i * Math.min(width, height) * 0.055 + Math.sin(t * 0.22 + i) * 6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = i % 3 === 0 ? "rgba(180,52,61,.25)" : "rgba(239,220,207,.13)";
      ctx.lineWidth = i % 2 ? 1 : 1.5;
      ctx.stroke();
      var angle = t * (0.12 + i * 0.008) + i;
      dot(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 2 + i % 3, 0.5, i % 2 ? null : "rgba(181,54,62,.65)");
    }
  }

  function drawLeadership(t) {
    var horizon = height * 0.72;
    for (var i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(width * 0.72, horizon, width * (0.18 + i * 0.06), height * (0.04 + i * 0.018), -0.08, Math.PI, Math.PI * 2);
      ctx.strokeStyle = i === 2 ? "rgba(177,44,52,.28)" : "rgba(223,236,248,.12)";
      ctx.stroke();
    }
    var sweep = (t * 0.09) % 1;
    line(width * 0.55, horizon, width * (0.55 + sweep * 0.44), horizon - Math.sin(sweep * Math.PI) * height * 0.34, 0.24, "rgba(240,222,205,.32)");
    dot(width * (0.55 + sweep * 0.44), horizon - Math.sin(sweep * Math.PI) * height * 0.34, 2.6, 0.65);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    ctx.save();
    ctx.translate(pointer.x * 10, pointer.y * 8);
    if (theme === "digital") drawDigital(state.time);
    else if (theme === "brand") drawBrand(state.time);
    else if (theme === "leadership") drawLeadership(state.time);
    else drawStrategy(state.time);
    ctx.restore();
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  hero.addEventListener("pointermove", function (event) {
    var box = hero.getBoundingClientRect();
    pointer.tx = ((event.clientX - box.left) / box.width - 0.5) * 2;
    pointer.ty = ((event.clientY - box.top) / box.height - 0.5) * 2;
  });
  hero.addEventListener("pointerleave", function () { pointer.tx = pointer.ty = 0; });

  if (reduce) {
    state.time = 4;
    draw();
    return;
  }

  if (window.gsap) {
    gsap.to(state, { time: 100, duration: 120, ease: "none", repeat: -1, onUpdate: draw });
    gsap.to(shell.querySelector(".motion-hero__art"), { scale: 1.055, duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(shell.querySelectorAll(".motion-hero__orbit"), { rotation: 360, duration: 28, ease: "none", repeat: -1, stagger: 5, transformOrigin: "50% 50%" });
    gsap.to(shell.querySelector(".motion-hero__beam"), { xPercent: 180, opacity: 0.5, duration: 7, ease: "power1.inOut", repeat: -1, repeatDelay: 2 });
  } else {
    (function tick() { state.time += 0.016; draw(); requestAnimationFrame(tick); })();
  }
})();
