import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { writeText } from './write-text.mjs';
import { applySiteShell, retired } from './site-shell.mjs';
import {serviceNames,audience,writeDiscovery} from './discovery.mjs';

export const seo = JSON.parse(fs.readFileSync(new URL('../content/seo.json', import.meta.url), 'utf8'));
export const siteUrl = seo.siteUrl.replace(/\/$/, '');
const imageDimensions = JSON.parse(fs.readFileSync(new URL('../content/image-dimensions.json', import.meta.url), 'utf8'));
export const canonicalPath = file => file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
const absolute = value => new URL(value, `${siteUrl}/`).href;
const plain = value => cheerio.load(value || '').text().replace(/\s+/g, ' ').trim();

export function applySeo(files, articles) {
  const root = process.cwd();
  for (const file of files) {
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    const article = articles.find(a => relative === `articles/${a.slug}.html`);
    const utility = ['404.html', 'success.html','retired-account.html'].includes(relative) || !!retired[relative];
    const [title, description] = retired[relative] ? ['Our Current AI Services | Strategic Marketing Advisors', 'Explore SMA’s current services: AI Voice Agents, VedaKosa private AI assistants and independent AI Visibility assessment and implementation programs.'] : seo.pages[relative] || [article ? `${article.title} | SMA` : $('title').text(), article?.description || $('meta[name="description"]').attr('content') || $('h1').text()];
    const url = absolute(canonicalPath(relative));
    const image = absolute(article?.cardImage || 'assets/images/david-and-mary-life.webp');
    $('title').text(title);
    $('meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"], meta[property^="article:"], meta[name^="twitter:"], script[type="application/ld+json"]').remove();
    const meta = (name, content, property=false) => $('<meta>').attr({[property ? 'property' : 'name']: name, content}).appendTo('head');
    meta('description', description);
    meta('robots', utility ? 'noindex, follow' : 'index, follow, max-image-preview:large');
    if (!utility) $('<link>').attr({rel:'canonical',href:url}).appendTo('head');
    for(const [key,value] of Object.entries({type:article?'article':'website',site_name:'Strategic Marketing Advisors',title,description,url,image,locale:'en_US','image:alt':article?.title || 'Mary and David Scarborough, Strategic Marketing Advisors'})) meta(`og:${key}`,value,true);
    for(const [key,value] of Object.entries({card:'summary_large_image',title,description,image,'image:alt':article?.title || 'Mary and David Scarborough, Strategic Marketing Advisors'})) meta(`twitter:${key}`,value);
    $('html').attr('lang','en-US');
    applySiteShell($, relative);
    if (!$('link[href$="seo-content.css"]').length) $('head').append('<link rel="stylesheet" href="/seo-content.css">');
    if (!$('script[src$="form-handoff.js"]').length && $('form[data-netlify],form[data-email-handoff]').length) $('body').append('<script src="/form-handoff.js" defer></script>');
    if (!$('main').length && $('body > section').length) $('body > section').wrapAll('<main id="main-content"></main>');
    $('main').first().attr({id:'main-content',tabindex:'-1'});
    if ($('main').length && !$('.skip-link').length) $('body').prepend('<a class="skip-link" href="#main-content">Skip to content</a>');
    // Use one public URL shape throughout the site, including in breadcrumbs.
    $('a[href]').each((i,e)=>{
      const value=$(e).attr('href');
      if (!value || /^(#|mailto:|tel:|javascript:)/i.test(value)) return;
      if (/^https?:/i.test(value) && !value.startsWith(`${siteUrl}/`) && !/^https:\/\/strategicmarketingadvisors\.com\//.test(value)) return;
      const target = new URL(value.replace(/^https:\/\/strategicmarketingadvisors\.com/,siteUrl),url);
      if (target.origin !== siteUrl) return;
      target.pathname=target.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'');
      $(e).attr('href',target.pathname+target.search+target.hash);
    });
    $('.article__byline .semibold').each((i,e)=>{
      if (!$(e).find('a').length) $(e).html($('<a>').attr('href',article?.authorType==='Organization'?'/about':'/about/founders').text($(e).text()));
    });
    $('img').each((i,e)=>{
      const src=$(e).attr('src')||'';
      if(!/^(https?:|data:)/.test(src)){
        const resolved=src.startsWith('/')?path.resolve(root,src.slice(1)):path.resolve(path.dirname(file),src);
        const dimensions=imageDimensions[path.relative(root,resolved).replaceAll(path.sep,'/')];
        if(dimensions)$(e).attr({width:String(dimensions[0]),height:String(dimensions[1])});
      }
      const hero=$(e).closest('.hero2,.phero').length || $(e).hasClass('article-hero');
      if(hero) $(e).attr({loading:'eager',fetchpriority:'high'});
      else if(!$(e).closest('header').length) $(e).attr({loading:'lazy',decoding:'async'});
    });
    $('.post-card').each((i,e)=>{
      const href=$(e).attr('href')||$(e).find('a').first().attr('href')||'';
      const item=articles.find(a=>href.includes(`/articles/${a.slug}`));
      if(item)$(e).find('.post-card__meta .t-small').text(item.readTime);
    });
    if(relative==='resources.html'){
      const featured=articles.find(a=>a.slug==='perception');
      if(featured){$('.feat-post__meta .t-small').text(`Featured · ${featured.readTime}`);$('.feat-post .t-small').filter((i,e)=>$(e).text().includes('June 2, 2026')).text('June 1, 2026');}
    }
    $('form[data-netlify],form[data-email-handoff]').each((i,e)=>{
      $(e).attr({action:'mailto:hello@strategicmarketingadvisors.com',method:'post',enctype:'text/plain','data-email-handoff':''}).removeAttr('data-netlify netlify-honeypot');
      $(e).find('[name="form-name"],.form-honeypot').remove();
      const newsletter=$(e).attr('name')==='newsletter';
      $(e).find('button[type="submit"]').text(newsletter?'Request updates by email':'Prepare my inquiry email');
      $(e).find('.form__note').text('Opens your email app. Review and send the message there to complete your request, or email hello@strategicmarketingadvisors.com directly.');
      if (!$(e).find('.form-handoff').length) $(e).append('<p class="form-handoff" role="status" aria-live="polite"></p>');
      if(newsletter){
        $(e).closest('.newsletter').find('.lead-xl').text('Ask about practical marketing updates from our team. This prepares an email request; it does not automatically subscribe you.');
        $(e).next('.form__note').text('Opens your email app. Review and send the request there.');
      }
    });
    const organization = {
      '@type':'Organization','@id':`${siteUrl}/#organization`,name:'Strategic Marketing Advisors',legalName:'Strategic Marketing Advisors, LLC',alternateName:'SMA',foundingDate:'2004',url:`${siteUrl}/`,
      description:'Founder-led AI Voice Agent and VedaKosa business system consulting from Cashiers, North Carolina, with independent AI Visibility assessment and implementation services.',
      logo:{'@type':'ImageObject',url:absolute('assets/logo.png'),width:1200,height:360},image:absolute('assets/images/david-and-mary-life.webp'),telephone:'+1-877-355-8745',email:'hello@strategicmarketingadvisors.com',
      address:{'@type':'PostalAddress',postOfficeBoxNumber:'2534',addressLocality:'Cashiers',addressRegion:'NC',postalCode:'28717',addressCountry:'US'},
      areaServed:{'@type':'Country',name:'United States'},
      sameAs:['https://www.facebook.com/strategicmarketingadvisors'],
      contactPoint:[{'@type':'ContactPoint',contactType:'sales',telephone:'+1-877-355-8745',email:'hello@strategicmarketingadvisors.com',areaServed:'US',availableLanguage:'English',hoursAvailable:{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'09:00',closes:'17:00'}}],
      founder:[{'@type':'Person',name:'Mary Eule Scarborough',url:absolute('/about/founders')},{'@type':'Person',name:'David A. Scarborough',url:absolute('/about/founders')}]
    };
    const pageType=relative==='contact.html'?'ContactPage':relative==='about.html'?'AboutPage':relative==='about/faq.html'?'FAQPage':'WebPage';
    const graph=[organization,{'@type':'WebSite','@id':`${siteUrl}/#website`,url:`${siteUrl}/`,name:'Strategic Marketing Advisors',publisher:{'@id':organization['@id']},inLanguage:'en-US'},
      {'@type':pageType,'@id':`${url}#webpage`,url,name:title,description,isPartOf:{'@id':`${siteUrl}/#website`},about:{'@id':organization['@id']},inLanguage:'en-US'}];
    if(relative==='about/faq.html')graph[2].mainEntity=$('.faq-group details').map((i,e)=>({'@type':'Question',name:$(e).find('summary').text(),acceptedAnswer:{'@type':'Answer',text:$(e).find('p').text()}})).get();
    if(relative!=='index.html'&&!utility){
      const crumbs=[{name:'Home',item:`${siteUrl}/`}];
      if(relative.includes('/')) {const parent=relative.split('/')[0];crumbs.push({name:parent==='services'?'Services':parent==='about'?'About':parent==='resources'?'Resources':'Blog',item:absolute(parent==='articles'?'/blog':`/${parent}`)});}
      crumbs.push({name:plain($('h1').first().html()),item:url});
      graph.push({'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))});
    }
    if(relative.startsWith('services/')) graph.push({'@type':'Service','@id':`${url}#service`,name:serviceNames[relative]||$('h1').text(),description,url,provider:{'@id':organization['@id']},areaServed:{'@type':'Country',name:'United States'},audience:{'@type':'BusinessAudience',audienceType:audience}});
    if(article){
      graph.push({'@type':'BlogPosting',headline:article.title,description:article.description,image,url,mainEntityOfPage:{'@id':`${url}#webpage`},datePublished:article.date,dateModified:article.modified||article.date,
        author:article.authorType==='Organization'?{'@id':organization['@id']}:{'@type':'Person',name:article.author,url:absolute('/about/founders')},publisher:{'@id':organization['@id']}});
      meta('article:published_time',article.date,true);meta('article:modified_time',article.modified||article.date,true);
    }
    if(!utility)$('head').append(`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`);
    writeText(file,$.html());
  }
  writeDiscovery(siteUrl);
  const admin='admin/index.html';
  if(fs.existsSync(admin)){
    const $=cheerio.load(fs.readFileSync(admin,'utf8'));
    $('meta[name="robots"]').remove();$('head').append('<meta name="robots" content="noindex, nofollow">');writeText(admin,$.html());
  }
}
