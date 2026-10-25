import fs from "node:fs";
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
export const header = fs.readFileSync(new URL("../partials/site-header.html", import.meta.url), "utf8");
export const footer = fs.readFileSync(new URL("../partials/site-footer.html", import.meta.url), "utf8");

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
  $('#chatLaunch,#chatPanel,.chat-launch,.chat-panel,script[src$="chat.js"],script[src*="cdnjs.cloudflare.com"],script[src$="gsap-init.js"],script[src$="hero-scene.js"],script[src$="site-ui.js"],#sma-consent-root,#booking-dialog').remove();
  $('script').filter((i,e)=>!$(e).attr('src')&&$(e).text().includes('__SMA_BASE')).remove();
  $('script[src="https://d2cqc7yqzf8c8f.cloudfront.net/web-widget.js"],[data-widget-key]').remove();
  $('head link[href$="site-refresh.css"]').remove();
  $('head').append('<link rel="stylesheet" href="/site-refresh.css">');
  $('body').append(`<dialog id="booking-dialog" class="booking-modal" aria-labelledby="booking-title"><div class="booking-modal__head"><div><p class="eyebrow">Free 30-minute strategy call</p><h2 id="booking-title" tabindex="-1">Choose a time with David</h2></div><button class="booking-modal__close" type="button" data-booking-close aria-label="Close booking calendar">×</button></div><div class="booking-modal__body"><div class="embed-placeholder" data-booking-placeholder><p>Load the calendar here to book your appointment. This enables the third-party booking service and its cookies or similar technologies.</p><button class="btn btn-primary" type="button" data-enable-booking>Load the booking calendar</button></div><iframe data-booking-src="${calendar}" title="Book your free strategy call" hidden referrerpolicy="strict-origin-when-cross-origin"></iframe><p class="booking-modal__fallback">If the calendar does not display, <a href="${calendar}" data-booking-external>open the booking page directly</a>.</p></div></dialog><div id="sma-consent-root"></div><script src="/site-ui.js" defer></script>`);
  $('a[href]').each((i,e)=>{
    const href=$(e).attr('href')||'';
    const text=$(e).text().trim();
    if(/^book\b|^(schedule|request)\b.*(call|consultation|appointment|conversation)/i.test(text))$(e).attr('href',calendar);
    if($(e).attr('href')===calendar&&!$(e).is('[data-booking-external]')&&!/open calendar directly/i.test(text)&&!$(e).closest('noscript').length)$(e).attr({'data-booking-open':'','aria-haspopup':'dialog','aria-controls':'booking-dialog'});
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
