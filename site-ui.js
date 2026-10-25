(function () {
  'use strict';
  var key = 'sma-consent-v1';
  var prefs = { voice: false, booking: false, analytics: false };
  var recorded = false;
  try {
    var stored = JSON.parse(localStorage.getItem(key) || 'null');
    if (stored && (stored.version === 1 || stored.version === 2) && Date.now() - stored.saved < 15552000000) {
      prefs.voice = stored.voice === true; prefs.booking = stored.booking === true; prefs.analytics = stored.version === 2 && stored.analytics === true; recorded = stored.version === 2;
    }
  } catch (_) { /* Continue with optional services disabled. */ }
  var root = document.getElementById('sma-consent-root');
  var voiceLoaded = false;
  var bookingDialog = document.getElementById('booking-dialog');
  var bookingOpener = null;

  function persist(next) {
    var revoked = (prefs.voice && !next.voice) || (prefs.booking && !next.booking) || (prefs.analytics && !next.analytics);
    prefs = { voice: !!next.voice, booking: !!next.booking, analytics: !!next.analytics };
    recorded = true;
    try { localStorage.setItem(key, JSON.stringify({ version: 2, saved: Date.now(), voice: prefs.voice, booking: prefs.booking, analytics: prefs.analytics })); } catch (_) {}
    if (root) root.replaceChildren();
    window.dispatchEvent(new CustomEvent('sma:consent',{detail:{analytics:prefs.analytics}}));
    if (revoked) { window.location.reload(); return; }
    applyPreferences();
  }
  function notice(showControls, focus) {
    if (!root) return;
    root.innerHTML = '<section class="consent-banner" role="dialog" aria-modal="false" aria-labelledby="consent-title"><h2 id="consent-title">Your privacy choices</h2><p>We use necessary browser storage to remember your choices. With your permission, we load our AI voice widget and booking calendar, and measure page views and selected clicks to improve the website. Optional services stay off until you choose. <a href="/privacy">Read our privacy &amp; cookie notice</a>.</p><div class="consent-controls" ' + (showControls ? '' : 'hidden') + '><label><input type="checkbox" id="consent-voice"> AI voice widget</label><label><input type="checkbox" id="consent-booking"> Booking calendar</label><label><input type="checkbox" id="consent-analytics"> Website analytics</label><p>Necessary preference storage is always on. Analytics excludes contact fields and call transcripts. No advertising trackers are installed.</p></div><div class="consent-actions"><button type="button" data-reject>Reject optional</button><button type="button" data-preferences>' + (showControls ? 'Save choices' : 'Choose settings') + '</button><button type="button" data-accept>Accept optional</button></div></section>';
    root.querySelector('#consent-voice').checked = prefs.voice;
    root.querySelector('#consent-booking').checked = prefs.booking;
    root.querySelector('#consent-analytics').checked = prefs.analytics;
    root.querySelector('[data-reject]').addEventListener('click', function () { persist({ voice: false, booking: false, analytics: false }); });
    root.querySelector('[data-accept]').addEventListener('click', function () { persist({ voice: true, booking: true, analytics: true }); });
    root.querySelector('[data-preferences]').addEventListener('click', function () {
      if (!showControls) { notice(true, true); return; }
      persist({ voice: root.querySelector('#consent-voice').checked, booking: root.querySelector('#consent-booking').checked, analytics: root.querySelector('#consent-analytics').checked });
    });
    if (focus) root.querySelector(showControls ? '#consent-voice' : '[data-reject]').focus();
  }
  function createVoiceDock() {
    if (document.querySelector('.voice-dock')) return;
    var dock = document.createElement('details');
    dock.className = 'voice-dock';
    dock.innerHTML = '<summary aria-label="Talk to Kate, AI assistant"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a13 13 0 0 1-7-7l2-2-2-5Z"/></svg><span class="voice-launch-label">Questions? Talk to Kate</span></summary><div class="voice-panel"><div class="voice-panel__head"><div><strong>Meet your AI front desk</strong><small>Kate · SMA AI assistant</small></div><button type="button" class="voice-panel__close" aria-label="Close Kate panel">×</button></div><div class="voice-panel__profile"><img class="kate-avatar" src="/assets/images/kate-ai-avatar.webp" alt="AI-generated portrait representing Kate" width="112" height="112"><span class="ai-label">AI assistant</span><h2>Hi, I’m Kate.</h2><p>Ask about AI Voice Agents, VedaKosa or your next step with David.</p></div><button type="button" class="voice-panel__enable" data-enable-voice>Enable voice demo</button><p class="voice-panel__privacy">Enabling voice loads our third-party voice service. <a href="/privacy">Privacy details</a>. Your microphone starts only when you choose.</p><div id="sma-voice-widget"></div><p class="voice-panel__status" role="status" data-voice-status>Enable the demo, then use the microphone control to speak.</p><button type="button" class="voice-dock__book">Book a call with David</button></div>';
    document.body.appendChild(dock);
    dock.querySelector('.voice-panel__close').addEventListener('click',function(){dock.open=false;dock.querySelector('summary').focus();});
    dock.querySelector('.voice-dock__book').addEventListener('click',function(){var link=document.querySelector('a[data-booking-open]');if(link)link.click();});
    dock.addEventListener('keydown',function(event){if(event.key==='Escape'){dock.open=false;dock.querySelector('summary').focus();}});
  }
  function loadVoice() {
    if (!prefs.voice || voiceLoaded) return;
    voiceLoaded = true;
    createVoiceDock();
    var mount = document.getElementById('sma-voice-widget');
    mount.setAttribute('data-widget-key', 'a65d79bf-6874-4063-9498-931cddc5e158');
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
      if (prefs.booking && (!frame.closest('dialog') || frame.closest('dialog').open)) {
        if (!frame.getAttribute('src')) {
          var loading = document.createElement('p'); loading.className = 'calendar-loading'; loading.setAttribute('role','status'); loading.textContent = 'Loading the booking calendar…'; frame.before(loading);
          frame.addEventListener('load',function(){loading.hidden=true;},{once:true});
          frame.setAttribute('src', frame.dataset.bookingSrc);
        }
        frame.hidden = false;
        var placeholder = frame.parentElement.querySelector('[data-booking-placeholder]');
        if (placeholder) placeholder.hidden = true;
      }
    });
  }
  createVoiceDock();
  document.querySelectorAll('[data-open-voice]').forEach(function(button){button.addEventListener('click',function(){var dock=document.querySelector('.voice-dock');dock.open=true;dock.querySelector('.voice-panel__close').focus();});});
  document.querySelectorAll('[data-cookie-settings]').forEach(function (button) { button.addEventListener('click', function () { notice(true, true); }); });
  document.querySelectorAll('[data-enable-voice]').forEach(function (button) { button.addEventListener('click', function () { persist({ voice: true, booking: prefs.booking, analytics: prefs.analytics }); var dock=document.querySelector('.voice-dock'); if(dock)dock.open=true; }); });
  document.querySelectorAll('[data-enable-booking]').forEach(function (button) { button.addEventListener('click', function () { persist({ voice: prefs.voice, booking: true, analytics: prefs.analytics }); }); });
  document.querySelectorAll('[data-booking-open]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (!bookingDialog || typeof bookingDialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); bookingOpener = link;
      document.querySelectorAll('.nav__item.is-expanded').forEach(function (item) { item.classList.remove('is-expanded'); item.querySelector('[data-mega-trigger]').setAttribute('aria-expanded', 'false'); });
      var nav = document.getElementById('nav');
      if (nav) { nav.classList.remove('is-open'); var toggle = document.getElementById('navToggle'); if(toggle)toggle.setAttribute('aria-expanded','false'); }
      if (!bookingDialog.open) bookingDialog.showModal();
      document.body.classList.add('booking-is-open');
      applyPreferences();
      document.getElementById('booking-title').focus();
    });
  });
  if (bookingDialog) {
    bookingDialog.querySelector('[data-booking-close]').addEventListener('click', function () { bookingDialog.close(); });
    bookingDialog.addEventListener('close', function () { document.body.classList.remove('booking-is-open'); if(bookingOpener&&bookingOpener.getClientRects().length)bookingOpener.focus();else {var toggle=document.getElementById('navToggle');if(toggle)toggle.focus();} });
    bookingDialog.addEventListener('click', function (event) { if(event.target===bookingDialog){var rect=bookingDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)bookingDialog.close();} });
  }
  document.querySelectorAll('[data-mega-trigger]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.nav__item'); var open = true;
      document.querySelectorAll('[data-mega-trigger]').forEach(function (other) { other.setAttribute('aria-expanded','false');other.closest('.nav__item').classList.remove('is-expanded'); });
      item.classList.toggle('is-expanded',open);trigger.setAttribute('aria-expanded',String(open));
    });
    trigger.closest('.nav__item').addEventListener('pointerenter',function(event){if(event.pointerType==='touch')return;trigger.click();});
    trigger.closest('.nav__item').addEventListener('pointerleave',function(event){if(!event.currentTarget.contains(document.activeElement)){event.currentTarget.classList.remove('is-expanded');trigger.setAttribute('aria-expanded','false');}});
    trigger.closest('.nav__item').addEventListener('focusout',function(event){if(!event.currentTarget.contains(event.relatedTarget)){event.currentTarget.classList.remove('is-expanded');trigger.setAttribute('aria-expanded','false');}});
  });
  document.addEventListener('click', function(event){if(!event.target.closest('.nav__item'))document.querySelectorAll('[data-mega-trigger]').forEach(function(trigger){trigger.setAttribute('aria-expanded','false');trigger.closest('.nav__item').classList.remove('is-expanded');});});
  document.querySelectorAll('.nav-drop').forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) document.querySelectorAll('.nav-drop').forEach(function (other) { if (other !== item) other.open = false; });
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      document.querySelectorAll('.nav-drop,.mobile-menu').forEach(function (item) { item.open = false; });
      document.querySelectorAll('[data-mega-trigger]').forEach(function(trigger){trigger.closest('.nav__item').classList.remove('is-expanded');trigger.setAttribute('aria-expanded','false');});
    }
  });
  document.querySelectorAll('.faq-group details').forEach(function(item){
    var hoverOpened=false, pinned=false;
    item.addEventListener('pointerenter',function(event){if(event.pointerType==='mouse'&&window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!item.open){item.open=true;hoverOpened=true;}});
    item.querySelector('summary').addEventListener('click',function(event){if(event.detail>0&&hoverOpened){event.preventDefault();hoverOpened=false;pinned=true;}else{pinned=!item.open;hoverOpened=false;}});
    item.addEventListener('pointerleave',function(event){if(event.pointerType==='mouse'&&!pinned&&!item.contains(document.activeElement)){item.open=false;hoverOpened=false;}});
  });
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    var counterObserver = new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;var el=entry.target,end=Number(el.dataset.careerCount),began=performance.now();counterObserver.unobserve(el);function tick(now){var p=Math.min((now-began)/800,1);el.textContent=String(Math.round(end*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(tick);}requestAnimationFrame(tick);});},{threshold:.5});
    document.querySelectorAll('[data-career-count]').forEach(function(el){counterObserver.observe(el);});
  }
  applyPreferences();
  if (!recorded) notice(false, false);
})();
