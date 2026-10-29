import fs from 'node:fs';
import path from 'node:path';
import {publishedContent,siteUrl} from '../lib/public-content.mjs';
import {renderContent} from '../lib/render-content.mjs';
const root=path.join(process.cwd(),'runtime-templates');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const escape=value=>String(value).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export default async function handler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');
 if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');res.end();return;}
 const url=new URL(req.url,'https://local.invalid');const route=(url.searchParams.get('route')||'/').replace(/\/$/,'')||'/';
 if(!/^\/[a-z0-9/.-]*$/.test(route)||route.includes('..')){res.statusCode=404;res.end('Not found');return;}
 if(route==='/retired-customer'){
  res.statusCode=410;res.setHeader('Cache-Control','public, max-age=300');res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Content-Type','text/html; charset=utf-8');res.end(req.method==='HEAD'?'':read('retired-account.html'));return;
 }
 try{
  const all=await publishedContent();
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=30, stale-while-revalidate=15');
  if(route==='/sitemap.xml'){
   const original=read('sitemap.xml');const extra=all.filter(r=>!original.includes('<loc>'+siteUrl+r.path+'</loc>')).map(r=>`<url><loc>${escape(siteUrl+r.path)}</loc><lastmod>${escape(r.published_at.slice(0,10))}</lastmod></url>`).join('');
   res.setHeader('Content-Type','application/xml; charset=utf-8');res.end(req.method==='HEAD'?'':original.replace('</urlset>',extra+'</urlset>'));return;
  }
  const manifest=JSON.parse(read('manifest.json'));const row=all.find(r=>r.path===route);
  res.setHeader('X-SMA-Content-Revision',row?String(row.revision):'original');
  const file=manifest[route]||(row?.kind==='article'&&/^\/articles\/[a-z0-9-]+$/.test(route)?'articles/perception.html':null);
  if(!file){res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(req.method==='HEAD'?'':read('404.html'));return;}
  res.setHeader('Content-Type','text/html; charset=utf-8');res.end(req.method==='HEAD'?'':renderContent(read(file),row,route,all));
 }catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','text/plain; charset=utf-8');res.end('This page is temporarily unavailable. Please try again shortly.');}
}
