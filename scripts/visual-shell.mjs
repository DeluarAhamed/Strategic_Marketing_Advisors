const editorial='/assets/images/custom/editorial/';
const photos={
  'about.html':'/assets/images/david-and-mary-life.webp',
  'about/founders.html':'/assets/images/david-and-mary-life.webp',
  'about/veteran-owned.html':editorial+'veteran-leadership.jpg',
  'services/ai-voice-agents.html':editorial+'ai-automation.jpg',
  'services/vedakosa.html':editorial+'strategy-planning.jpg',
  'services/ai-visibility.html':editorial+'seo-local.jpg',
  'demo.html':editorial+'ai-automation.jpg',
  'resources.html':editorial+'about-workshop.jpg',
  'resources/marketing-resources.html':editorial+'strategy-planning.jpg',
  'resources/skool-community.html':editorial+'about-workshop.jpg',
  'blog.html':editorial+'strategy-planning.jpg',
  'contact.html':editorial+'executive-consulting.jpg',
};
const counters=[['23','Years of Air Force service','David brings disciplined planning and follow-through.'],['3','Entrepreneur Press books','Practical marketing knowledge, shared in print.'],['2','Businesses founded by Mary','Advice informed by hands-on ownership.'],['2','Founders working with you','Direct guidance from Mary and David.']];
const band=()=>`<section class="section career-band" data-career-band><div class="container"><div class="career-band__heading"><p class="eyebrow">Experience you can put to work</p><h2 class="h2">Real careers. Practical perspective.</h2><p>Our background informs how we plan, build and help your team take ownership.</p></div><div class="career-grid">${counters.map(([n,label,text])=>`<article><strong data-career-count="${n}">${n}</strong><h3>${label}</h3><p>${text}</p></article>`).join('')}</div></div></section>`;
export function applyVisualShell($,relative){
  $('img').each((i,e)=>{if(/(?:^|\/)david-mary\.png$/.test($(e).attr('src')||''))$(e).attr({src:'/assets/images/david-and-mary-life.webp',alt:'David and Mary Scarborough in the mountains of western North Carolina'}).removeAttr('style');});
  // Replace the old clipped image treatment with a clear, natural photograph.
  $('main .media:has(img[src="/assets/images/david-and-mary-life.webp"])').addClass('founder-photo');
  const hero=$('main .phero,main .page-hero').first();
  if(hero.length){
    let image=photos[relative];
    if(relative.startsWith('articles/'))image=$('.article-hero').attr('src')?.replace(/^\.\.\//,'/');
    image=image||editorial+(relative.startsWith('about/')?'executive-consulting.jpg':'services-overview.jpg');
    hero.addClass('photo-hero').attr('style',`--hero-photo:url("${image}")`);
    hero.find('.page-hero__bg').remove();
  }
  if(['index.html','services.html'].includes(relative)){
    $('.focus-grid--two > .focus-card').each((i,e)=>{
      const card=$(e);if(i>1)return;
      card.addClass('signature-card');card.find('.signature-card__visual').remove();
      card.prepend(`<div class="signature-card__visual"><img src="${editorial+(i===0?'ai-automation.jpg':'strategy-planning.jpg')}" alt="${i===0?'AI tools supporting a responsive business front desk':'Business planning and connected workflows'}"><span>${i===0?'Answer • Book • Follow up':'Knowledge • Workflows • Team'}</span></div>`);
      card.find('h3').text(i===0?'A front desk that keeps up with your customers.':'An AI system your team can actually use.');
      card.find('p').not('.focus-card__label').first().text(i===0?'When you are on a job, helping a customer or closed for the day, your next caller still needs an answer. Give routine calls a clear path to an appointment or a person.':'Too many tools and scattered information slow everyone down. VedaKosa brings your business knowledge and agreed workflows into one practical way of working.');
    });
  }
  if(['index.html','about.html','about/founders.html','about/veteran-owned.html','about/testimonials.html','services.html','services/ai-voice-agents.html','services/vedakosa.html','about/philosophy.html'].includes(relative)){
    $('[data-career-band]').remove();
    $('.bigstats').closest('section').remove();
    if(relative==='index.html')$('.focus-split:has(img[src="/assets/images/david-and-mary-founders.webp"])').closest('section').after(band());
    else {const cta=$('main .focus-cta').last().closest('section');if(cta.length)cta.before(band());else $('main').append(band());}
  }
  if(relative==='demo.html'){
    const intro=$('[data-voice-host]').closest('.focus-split');
    intro.addClass('voice-demo-layout').html(`<div><p class="eyebrow">Try a conversation</p><h2 class="h2">One click.<br>A real voice conversation.</h2><p class="lead-xl">Hear how an AI front desk greets a visitor and answers questions. Kate is SMA’s AI assistant; this demo introduces our services.</p><ol class="demo-steps"><li><span>01</span><div><h3>Open Kate</h3><p>Use the button here or the phone button in the bottom-right corner.</p></div></li><li><span>02</span><div><h3>Choose to speak</h3><p>Enable the voice service, then tap its microphone control. Allow microphone access when your browser asks.</p></div></li><li><span>03</span><div><h3>Try a useful question</h3><p>Ask “What can an AI front desk do?” or “How is VedaKosa different?” Use example contact details while testing.</p></div></li></ol><p class="focus-note">A business-specific agent needs your services, booking rules and escalation plan. We map those with you in a walkthrough.</p></div><div class="demo-console"><div class="demo-console__top"><span class="status-dot"></span> Interactive voice demo</div><img class="kate-avatar" src="/assets/images/kate-ai-avatar.webp" alt="Illustrated identity for Kate, an AI assistant"><span class="ai-label">AI assistant</span><h3>Meet Kate.</h3><p>Your first look at a more responsive front desk.</p><button class="btn btn-primary" type="button" data-open-voice>Talk to Kate <span aria-hidden="true">↗</span></button><p class="demo-console__note">You choose when the microphone starts.<br>No phone number needed to try the web demo.</p><p class="widget-fallback" data-voice-status>Open the panel to enable the voice demo.</p><a class="text-link" href="tel:+18773558745">Prefer a regular call? 877-355-8745 →</a></div>`);
  }
}
