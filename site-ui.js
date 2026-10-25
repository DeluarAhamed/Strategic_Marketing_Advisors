(function () {
  'use strict';
  var key = 'sma-consent-v1';
  var prefs = { voice: false, booking: false };
  var recorded = false;
  try {
    var stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (stored && stored.version === 1 && Date.now() - stored.saved < 15552000000) {
      prefs.voice = stored.voice === true; prefs.booking = stored.booking === true; recorded = true;
    }
  } catch (_) { /* Continue with optional services disabled. */ }
  var root = document.getElementById('sma-consent-root');
  var voiceLoaded = false;

  function persist(next) {
    var revoked = (prefs.voice && !next.voice) || (prefs.booking && !next.booking);
    prefs = { voice: !!next.voice, booking: !!next.booking };
    recorded = true;
    try { localStorage.setItem(key, JSON.stringify({ version: 1, saved: Date.now(), voice: prefs.voice, booking: prefs.booking })); } catch (_) {}
    if (root) root.replaceChildren();
    if (revoked) { window.location.reload(); return; }
    applyPreferences();
  }
  function notice(showControls, focus) {
    if (!root) return;
    root.innerHTML = '<section class="consent-banner" role="dialog" aria-modal="false" aria-labelledby="consent-title"><h2 id="consent-title">Your privacy choices</h2><p>We use necessary browser storage to remember your choices. With your permission, we load our third-party AI voice widget and booking calendar, which may use cookies or similar technologies and process the information you share. They stay off until you choose. <a href="/privacy">Read our privacy &amp; cookie notice</a>.</p><div class="consent-controls" ' + (showControls ? '' : 'hidden') + '><label><input type="checkbox" id="consent-voice"> AI voice widget</label><label><input type="checkbox" id="consent-booking"> Booking calendar</label><p>Necessary preference storage is always on. No advertising or analytics tools are currently installed.</p></div><div class="consent-actions"><button type="button" data-reject>Reject optional</button><button type="button" data-preferences>' + (showControls ? 'Save choices' : 'Choose settings') + '</button><button type="button" data-accept>Accept optional</button></div></section>';
    root.querySelector('#consent-voice').checked = prefs.voice;
    root.querySelector('#consent-booking').checked = prefs.booking;
    root.querySelector('[data-reject]').addEventListener('click', function () { persist({ voice: false, booking: false }); });
    root.querySelector('[data-accept]').addEventListener('click', function () { persist({ voice: true, booking: true }); });
    root.querySelector('[data-preferences]').addEventListener('click', function () {
      if (!showControls) { notice(true, true); return; }
      persist({ voice: root.querySelector('#consent-voice').checked, booking: root.querySelector('#consent-booking').checked });
    });
    if (focus) root.querySelector(showControls ? '#consent-voice' : '[data-reject]').focus();
  }
  function loadVoice() {
    if (!prefs.voice || voiceLoaded) return;
    voiceLoaded = true;
    var mount = document.createElement('div');
    mount.setAttribute('data-widget-key', 'a65d79bf-6874-4063-9498-931cddc5e158');
    mount.id = 'sma-voice-widget';
    var host = document.querySelector('[data-voice-host]');
    if (host) host.appendChild(mount);
    else {
      var dock = document.createElement('details');
      dock.className = 'voice-dock';
      var summary = document.createElement('summary');
      summary.textContent = 'Talk to the AI Front Desk';
      dock.appendChild(summary); dock.appendChild(mount); document.body.appendChild(dock);
    }
    document.querySelectorAll('[data-voice-status]').forEach(function (el) { el.textContent = 'Loading the voice demo… If it is unavailable, you can still book a live walkthrough below.'; });
    var script = document.createElement('script');
    script.src = 'https://d2cqc7yqzf8c8f.cloudfront.net/web-widget.js';
    script.async = true;
    script.onerror = function () {
      document.querySelectorAll('[data-voice-status]').forEach(function (el) { el.textContent = 'The voice demo could not load. Please book a live walkthrough using the link below.'; });
    };
    script.onload = function () {
      // The vendor exposes this rescan hook for widgets mounted after page load.
      if (window.widgetLib && typeof window.widgetLib.scanWidgets === 'function') window.widgetLib.scanWidgets();
      var observer = new MutationObserver(function () {
        if (!mount.querySelector('.wcw-widget-container')) return;
        document.querySelectorAll('[data-voice-status]').forEach(function (el) { el.textContent = 'The voice widget is ready. Use its on-screen control to start. Microphone access is only needed if you choose to speak.'; });
        observer.disconnect();
      });
      observer.observe(mount, { childList: true, subtree: true });
      setTimeout(function () {
        if (!mount.querySelector('.wcw-widget-container')) {
          observer.disconnect();
          document.querySelectorAll('[data-voice-status]').forEach(function (el) { el.textContent = 'The voice demo is unavailable on this page right now. Please book a live walkthrough, or try again on the production website.'; });
        }
      }, 15000);
    };
    document.body.appendChild(script);
  }
  function applyPreferences() {
    if (prefs.voice) loadVoice();
    document.querySelectorAll('[data-enable-voice]').forEach(function (button) { button.hidden = prefs.voice; });
    document.querySelectorAll('iframe[data-booking-src]').forEach(function (frame) {
      if (prefs.booking) {
        if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.bookingSrc);
        frame.hidden = false;
        var placeholder = frame.parentElement.querySelector('[data-booking-placeholder]');
        if (placeholder) placeholder.hidden = true;
      }
    });
  }
  document.querySelectorAll('[data-cookie-settings]').forEach(function (button) { button.addEventListener('click', function () { notice(true, true); }); });
  document.querySelectorAll('[data-enable-voice]').forEach(function (button) { button.addEventListener('click', function () { persist({ voice: true, booking: prefs.booking }); }); });
  document.querySelectorAll('[data-enable-booking]').forEach(function (button) { button.addEventListener('click', function () { persist({ voice: prefs.voice, booking: true }); }); });
  document.querySelectorAll('.nav-drop').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) document.querySelectorAll('.nav-drop').forEach(function (other) { if (other !== item) other.open = false; });
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') document.querySelectorAll('.nav-drop,.mobile-menu').forEach(function (item) { item.open = false; });
  });
  applyPreferences();
  if (!recorded) notice(false, false);
})();
