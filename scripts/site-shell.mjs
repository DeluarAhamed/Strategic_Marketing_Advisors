export const calendar = 'https://atlas.strategicmarketingadvisors.com/widget/bookings/smaic-calendar';
export const retired = {
  'services/google-ads.html':'/services',
  'services/logo-brand-kit.html':'/services',
  'services/web-design.html':'/services',
  'services/reputation-management.html':'/services/ai-visibility',
  'services/gbp-audit.html':'/services/ai-visibility',
  'services/seo-local.html':'/services/ai-visibility',
  'services/ai-automation.html':'/services/vedakosa',
  'services/executive-consulting.html':'/services/vedakosa'
};
const about = [['Our story','/about'],['Mary & David','/about/founders'],['Our approach','/about/philosophy'],['Testimonials','/about/testimonials'],['Veteran-owned','/about/veteran-owned'],['Frequently asked questions','/about/faq']];
const services = [['AI Voice Agents','/services/ai-voice-agents'],['VedaKosa AI Business System','/services/vedakosa'],['AI Visibility · for our clients','/services/ai-visibility']];
const resources = [['Blog','/blog'],['Free Marketing Resources','https://localpromovault.com/'],['Free Skool Community','https://www.skool.com/thenextlevel/about']];
const links = items => items.map(([name,url])=>`<a href="${url}">${name}</a>`).join('');
const feature = `<a class="menu-feature" href="/demo"><span>Featured · AI Voice Agents</span><strong>Your AI Front Desk employee</strong><p>Never misses a call, books appointments, and follows up with every lead. 24/7.</p><span class="text-link">See How It Works →</span></a>`;
const dropdown = (label,items,extra='')=>`<details class="nav-drop"><summary>${label}</summary><div class="nav-drop__panel"><div><p class="nav-group-label">${label==='Services'?'Consulting & Growth':label}</p>${links(items)}</div>${extra}</div></details>`;
export const header = `<header class="site-header"><div class="site-header__inner"><a class="site-brand" href="/" aria-label="Strategic Marketing Advisors home"><img src="/assets/logo.svg" width="1200" height="360" alt="Strategic Marketing Advisors"></a><nav class="desktop-nav" aria-label="Main navigation">${dropdown('About Us',about)}${dropdown('Services',services,feature)}${dropdown('Resources',resources)}<a href="/contact">Contact</a></nav><a class="btn btn-primary header-book" href="${calendar}">Book a free call</a><details class="mobile-menu"><summary aria-label="Open navigation">Menu <span aria-hidden="true">☰</span></summary><nav aria-label="Mobile navigation"><a href="/">Home</a><p>About Us</p>${links(about)}<p>Consulting & Growth</p>${links(services)}<a href="/demo">Try the AI Voice Demo</a><p>Resources</p>${links(resources)}<a href="/contact">Contact</a><a class="btn btn-primary" href="${calendar}">Book a free call</a></nav></details></div></header>`;
export const footer = `<footer class="site-footer"><div class="container"><div class="site-footer__top"><div><a class="site-brand" href="/"><img src="/assets/logo.svg" width="1200" height="360" alt="Strategic Marketing Advisors"></a><p>AI Voice Agents and VedaKosa systems for business owners who want better follow-through and a practical way to adopt AI. Founder-led in Cashiers, North Carolina. Working remotely nationwide.</p></div><a class="btn btn-primary" href="${calendar}">Book a free call</a></div><div class="site-footer__columns"><div><h2>About SMA</h2>${links(about)}</div><div><h2>Consulting & Growth</h2>${links(services)}<a href="/demo">See the AI Voice Demo</a></div><div><h2>Resources</h2>${links(resources)}</div><div><h2>Contact</h2><a href="tel:+18773558745">877-355-8745</a><a href="tel:+18287438733">828-743-8733</a><a href="mailto:hello@strategicmarketingadvisors.com">Email our team</a><p>Cashiers, North Carolina<br>Mail: PO Box 2534, NC 28717<br>Monday–Friday, 9am–5pm ET<br>Closed Saturday & Sunday</p><a href="https://www.facebook.com/strategicmarketingadvisors">Facebook</a><a href="https://www.linkedin.com/in/davidascarborough/">LinkedIn</a></div></div><div class="site-footer__bottom"><p>© 2026 Strategic Marketing Advisors, LLC</p><div><a href="/privacy">Privacy & cookies</a><a href="/terms">Terms</a><button type="button" data-cookie-settings>Cookie settings</button></div></div></div></footer>`;

export function applySiteShell($, relative) {
  $('link[rel="stylesheet"],link[rel="icon"],script[src]').each((i,e)=>{
    const attr=$(e).is('script')?'src':'href';
    const value=$(e).attr(attr)||'';
    if(value&&!/^(https?:|\/|data:)/.test(value))$(e).attr(attr,'/'+value.replace(/^(\.\.\/)+/,''));
  });
  $('body > header').remove();
  $('main').first().before(header);
  $('body > footer').remove();
  $('main').first().after(footer);
  $('#chatLaunch,#chatPanel,.chat-launch,.chat-panel,script[src$="chat.js"],script[src*="cdnjs.cloudflare.com"],script[src$="gsap-init.js"],script[src$="hero-scene.js"],script[src$="site-ui.js"],#sma-consent-root').remove();
  $('script').filter((i,e)=>!$(e).attr('src')&&$(e).text().includes('__SMA_BASE')).remove();
  $('script[src="https://d2cqc7yqzf8c8f.cloudfront.net/web-widget.js"],[data-widget-key]').remove();
  $('head link[href$="site-refresh.css"]').remove();
  $('head').append('<link rel="stylesheet" href="/site-refresh.css">');
  $('body').append('<div id="sma-consent-root"></div><script src="/site-ui.js" defer></script>');
  $('a[href]').each((i,e)=>{
    const href=$(e).attr('href')||'';
    const text=$(e).text().trim();
    if(/^book\b|\b(book|schedule|request).*(call|consultation|appointment|conversation)/i.test(text))$(e).attr('href',calendar);
    const legacy=Object.entries(retired).find(([file])=>href.split(/[?#]/)[0]===`/${file.replace(/\.html$/,'')}`||href.endsWith(file));
    if(legacy)$(e).attr('href',legacy[1]);
    if(/^\/resources#/.test(href))$(e).attr('href',href.replace('/resources#','/blog#'));
    if(relative.startsWith('articles/')&&href==='/resources')$(e).attr('href','/blog');
    if(/^https?:\/\/(www\.)?(twitter\.com|x\.com|instagram\.com|youtube\.com)/.test(href))$(e).remove();
  });
  if(relative.startsWith('articles/'))$('.breadcrumb a').filter((i,e)=>$(e).attr('href')==='/blog').text('Blog');
  $('p').each((i,e)=>{
    const text=$(e).text();
    if(text.includes('split their time between summer and winter homes'))$(e).text(text.replace('split their time between summer and winter homes','live full time'));
  });
  // No legacy offer panels beside article content.
  $('.promo-card').each((i,e)=>{
    $(e).find('h2,h3').first().text('Put practical AI to work');
    $(e).find('p').first().text('Explore AI Voice Agents and VedaKosa with a founder-led strategy call.');
  });
}
