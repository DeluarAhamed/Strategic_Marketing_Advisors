import * as cheerio from 'cheerio';
import {siteUrl,safeImage} from './public-content.mjs';
const normalized=s=>(s||'').replace(/\s+/g,' ').trim();
function paragraphs($,parent,body){String(body||'').split(/\n\s*\n/).filter(Boolean).forEach(text=>parent.append($('<p>').text(text)));}
export function renderContent(html,row,route,all=[]){
 const $=cheerio.load(html);const c=row?.content;
 if(c){
  $('title').text(c.title);$('meta[name="description"]').attr('content',c.description);
  for(const key of ['og:title','twitter:title'])$(`meta[property="${key}"],meta[name="${key}"]`).attr('content',c.title);
  for(const key of ['og:description','twitter:description'])$(`meta[property="${key}"],meta[name="${key}"]`).attr('content',c.description);
  const url=siteUrl+route;
  $('link[rel="canonical"]').attr('href',url);$('meta[property="og:url"]').attr('content',url);
  const heading=c.heading||(row.kind==='article'?c.title:'');
  if(heading&&normalized($('h1').first().text())!==normalized(heading))$('h1').first().text(heading);
  const intro=c.intro||(row.kind==='article'?c.description:'');
  if(intro)$('main .phero .lead-xl,main .page-hero .t-medium,main .hero2__sub').first().text(intro);
  const heroImage=safeImage(c.heroImage)||(row.kind==='article'?'/assets/images/custom/editorial/strategy-planning.jpg':'');
  if(heroImage){$('main .photo-hero').first().attr('style',`--hero-photo:url("${heroImage}")`);$('.hero2__bg img,.article-hero').first().attr({src:heroImage,alt:c.heroAlt||''}).removeAttr('width height');$('meta[property="og:image"],meta[name="twitter:image"]').attr('content',heroImage.startsWith('/')?siteUrl+heroImage:heroImage);}
  $('[data-cms-sections]').remove();
  if(c.sections?.length){
   const container=$('<div data-cms-sections>');
   for(const block of c.sections){const section=$('<section class="section scheme-3 restored-section">'),inner=$('<div class="container cms-section">');if(block.heading)inner.append($('<h2 class="h2">').text(block.heading));const body=$('<div class="prose">');paragraphs($,body,block.body);inner.append(body);if(safeImage(block.image))inner.append($('<img loading="lazy" decoding="async">').attr({src:safeImage(block.image),alt:block.alt||''}));section.append(inner);container.append(section);}
   const cta=$('main .focus-cta').last().closest('section');if(cta.length)cta.before(container);else $('main').append(container);
  }
  if(row.kind==='article'){
    if(c.body&&normalized($('.prose').first().text())!==normalized(c.body)){const prose=$('.prose').first().empty();paragraphs($,prose,c.body);}
    $('.article__byline .semibold').first().text(c.author||'Strategic Marketing Advisors');
    const authorImage=/Mary/i.test(c.author||'')?'/assets/images/mary-eule-scarborough-2026.png':/David/i.test(c.author||'')?'/assets/images/david-cutout.png':'/assets/logo.svg';
    $('.article__byline img').first().attr({src:authorImage,alt:c.author||'Strategic Marketing Advisors'});
    $('.article__byline .t-small').first().text(c.date||'');
    $('.breadcrumb .current').last().text(c.heading||c.title);
    $('meta[property="article:published_time"]').attr('content',c.date||row.published_at);
    $('meta[property="article:modified_time"]').attr('content',row.published_at);
    $('meta[property="og:image:alt"],meta[name="twitter:image:alt"]').attr('content',c.heroAlt||heading);
  }
  $('script[type="application/ld+json"]').each((i,e)=>{
   try{const data=JSON.parse($(e).text());for(const node of data['@graph']||[]){if(['WebPage','AboutPage','ContactPage','FAQPage'].includes(node['@type']))Object.assign(node,{'@id':url+'#webpage',url,name:c.title,description:c.description});if(node['@type']==='BreadcrumbList'){const last=node.itemListElement.at(-1);Object.assign(last,{name:c.heading||c.title,item:url});}if(node['@type']==='BlogPosting')Object.assign(node,{headline:c.heading||c.title,description:c.description,url,author:/Mary|David/i.test(c.author||'')?{'@type':'Person',name:c.author,url:siteUrl+'/about/founders'}:{'@type':'Organization',name:c.author||'Strategic Marketing Advisors',url:siteUrl},datePublished:c.date||node.datePublished,dateModified:row.published_at,mainEntityOfPage:{'@id':url+'#webpage'},...(heroImage?{image:heroImage.startsWith('/')?siteUrl+heroImage:heroImage}:{})});}$(e).text(JSON.stringify(data).replace(/</g,'\\u003c'));}catch{}
  });
 }
 if(route==='/blog'||route==='/'){
  const grid=route==='/'?$('[data-home-blog]'):$('.tst-grid').first();
  for(const article of all.filter(r=>r.kind==='article').reverse()){
   const c=article.content;const existing=grid.find('a').filter((i,e)=>$(e).attr('href')===article.path).closest('article,.post-card').first();existing.remove();
   const card=$('<article class="card post-card">'),a=$('<a>').attr('href',article.path);const src=safeImage(c.heroImage)||'/assets/images/custom/editorial/strategy-planning.jpg';a.append($('<img loading="lazy" decoding="async">').attr({src,alt:c.heroAlt||''}));card.append(a);const body=$('<div class="post-card__body">');body.append($('<p class="t-small">').text((c.category||'strategies')+' · '+(c.readTime||'5 min read')));body.append($('<a>').attr('href',article.path).append($('<h3 class="h5">').text(c.heading||c.title)));body.append($('<p>').text(c.description));body.append($('<a class="text-link">').attr('href',article.path).text('Read article →'));card.append(body);grid.prepend(card);
  }
  if(route==='/')grid.children().slice(3).remove();
 }
 // Keep service metadata aligned when an approved CMS publication changes copy.
 if(c)$('script[type="application/ld+json"]').each((i,e)=>{try{const graph=JSON.parse($(e).text());for(const node of graph['@graph']||[])if(node['@type']==='Service')Object.assign(node,{description:c.description,url:siteUrl+route,'@id':siteUrl+route+'#service'});$(e).text(JSON.stringify(graph).replace(/</g,'\\u003c'));}catch{}});
 return $.html();
}
