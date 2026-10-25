import {load} from 'cheerio';
const site='https://strategic-marketing-advisors.vercel.app';
const scopes='https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly';
let googleToken={value:'',expires:0};
const encode=(v:Uint8Array|string)=>btoa(typeof v==='string'?v:String.fromCharCode(...v)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
export function providerState(config:any,env:(name:string)=>string|undefined){
 let account='';try{account=JSON.parse(env('SMA_GOOGLE_SERVICE_ACCOUNT_JSON')||'{}').client_email||'';}catch{}
 return {googleCredentials:!!account,serviceAccountEmail:account,ga4Configured:!!account&&!!config.ga4_property,searchConfigured:!!account&&!!config.search_property,semrushConfigured:!!env('SMA_SEMRUSH_API_KEY')&&!!config.semrush_domain,config:{ga4_property:config.ga4_property||'',search_property:config.search_property||'',semrush_domain:config.semrush_domain||''}};
}
async function accessToken(env:(name:string)=>string|undefined){
 if(googleToken.expires>Date.now()+60000)return googleToken.value;
 let account;try{account=JSON.parse(env('SMA_GOOGLE_SERVICE_ACCOUNT_JSON')||'{}');}catch{throw new Error('The Google service-account secret is not valid JSON.');}
 if(!account.client_email||!account.private_key)throw new Error('Add the Google service-account secret in Supabase before syncing.');
 const now=Math.floor(Date.now()/1000),header=encode(JSON.stringify({alg:'RS256',typ:'JWT'})),payload=encode(JSON.stringify({iss:account.client_email,scope:scopes,aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600}));
 const pem=account.private_key.replace(/-----[^-]+-----/g,'').replace(/\s/g,'');
 const key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(pem),c=>c.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(header+'.'+payload));
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:header+'.'+payload+'.'+encode(new Uint8Array(signature))}),signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw new Error('Google authentication failed. Check the service account and enabled APIs.');const data=await r.json();googleToken={value:data.access_token,expires:Date.now()+Number(data.expires_in)*1000};return googleToken.value;
}
async function googleReport(url:string,body:any,token:string){
 const r=await fetch(url,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw new Error(r.status===403?'Google denied access. Grant this service account access to the selected property and enable its API.':'Google could not return this report (HTTP '+r.status+'). Check the property and retry.');return await r.json();
}
export async function syncGoogle(source:string,days:number,config:any,env:(name:string)=>string|undefined){
 const token=await accessToken(env);
 if(source==='ga4'){
  if(!/^\d+$/.test(config.ga4_property||''))throw new Error('Set your numeric GA4 property ID first.');
  const url='https://analyticsdata.googleapis.com/v1beta/properties/'+config.ga4_property+':runReport';
  const dateRanges=[{startDate:days+'daysAgo',endDate:'yesterday'}];
  const report=(dimensions:string[],metrics:string[])=>googleReport(url,{dateRanges,dimensions:dimensions.map(name=>({name})),metrics:metrics.map(name=>({name})),limit:dimensions[0]==='date'?100:50,...(dimensions.length?{orderBys:[dimensions[0]==='date'?{dimension:{dimensionName:'date'}}:{metric:{metricName:metrics[0]},desc:true}]}:{})},token);
  const [summary,daily,pages,channels]=await Promise.all([report([],['activeUsers','sessions','screenPageViews','engagementRate','keyEvents']),report(['date'],['sessions','screenPageViews']),report(['pagePath'],['screenPageViews','sessions']),report(['sessionDefaultChannelGroup'],['sessions','keyEvents'])]);
  const rows=(data:any)=>data.rows?.map((r:any)=>({dimensions:r.dimensionValues?.map((x:any)=>x.value)||[],metrics:r.metricValues?.map((x:any)=>Number(x.value))||[]}))||[];
  return {property:config.ga4_property,summary:rows(summary)[0]?.metrics||[0,0,0,0,0],daily:rows(daily).sort((a:any,b:any)=>a.dimensions[0].localeCompare(b.dimensions[0])),pages:rows(pages),channels:rows(channels),dateRange:dateRanges[0],timezone:summary.metadata?.timeZone||'GA4 property timezone'};
 }
 if(!config.search_property)throw new Error('Set your verified Search Console property first.');
 const end=new Date(Date.now()-3*86400000),start=new Date(end.getTime()-(days-1)*86400000),startDate=start.toISOString().slice(0,10),endDate=end.toISOString().slice(0,10);
 const url='https://www.googleapis.com/webmasters/v3/sites/'+encodeURIComponent(config.search_property)+'/searchAnalytics/query';
 const report=(dimensions:string[])=>googleReport(url,{startDate,endDate,dimensions,rowLimit:50,type:'web',dataState:'final'},token);
 const [summary,queries,pages,daily]=await Promise.all([report([]),report(['query']),report(['page']),report(['date'])]);
 return {summary:summary.rows?.[0]||{clicks:0,impressions:0,ctr:0,position:0},queries:queries.rows||[],pages:pages.rows||[],daily:daily.rows||[],startDate,endDate,property:config.search_property};
}
export function parseSemrush(text:string){
 if(text.startsWith('ERROR'))throw new Error('Semrush did not return data. Check the API plan, remaining units and domain.');
 const lines=text.trim().split(/\r?\n/);return {headers:lines.shift()?.split(';')||[],rows:lines.slice(0,20).map(line=>line.split(';'))};
}
export async function syncSemrush(config:any,env:(name:string)=>string|undefined){
 const key=env('SMA_SEMRUSH_API_KEY');if(!key||!config.semrush_domain)throw new Error('Add the Semrush API secret and domain first.');
 const q=new URLSearchParams({type:'domain_organic',key,domain:config.semrush_domain,database:'us',display_limit:'20',export_columns:'Ph,Po,Nq,Ur,Tr',display_sort:'tr_desc'});
 const r=await fetch('https://api.semrush.com/?'+q,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('Semrush request failed. Retry later.');
 return {...parseSemrush(await r.text()),domain:config.semrush_domain,database:'us',note:'Top 20 organic keywords. Semrush estimates; not verified website visits.'};
}
export function auditHtml(html:string,path:string,status:number){
 const $=load(html),title=$('title').first().text().trim(),description=$('meta[name="description"]').attr('content')?.trim()||'',canonical=$('link[rel="canonical"]').attr('href')||'',h1=$('h1').length,issues=[] as string[];
 if(status!==200)issues.push('Page returned HTTP '+status);
 if(!title)issues.push('Missing title');else if(title.length>65)issues.push('Review long title ('+title.length+' characters)');
 if(!description)issues.push('Missing meta description');else if(description.length>170)issues.push('Review long description ('+description.length+' characters)');
 if(h1!==1)issues.push('Expected one H1; found '+h1);
 if(canonical!==site+path)issues.push('Review canonical URL');
 if(/noindex/i.test($('meta[name="robots"]').attr('content')||''))issues.push('Page marked noindex');
 const missingAlt=$('img:not([alt])').length;if(missingAlt)issues.push(missingAlt+' images lack an alt attribute');
 if(!$('script[type="application/ld+json"]').length)issues.push('No structured data found');
 return {path,status,title,description,h1,missingAlt,issues};
}
export async function auditSite(){
 const response=await fetch(site+'/sitemap.xml',{signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('The sitemap could not be loaded.');
 const xml=await response.text();const paths=[...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].flatMap(m=>{try{const u=new URL(m[1]);return u.origin===site&&/^\/[a-z0-9/-]*$/.test(u.pathname)&&!u.search?[u.pathname]:[];}catch{return [];}}))].slice(0,60);
 if(!paths.length)throw new Error('No public SMA pages were found in the sitemap.');
 const results:any[]=[];let cursor=0;await Promise.all(Array.from({length:4},async()=>{while(cursor<paths.length){const path=paths[cursor++];try{const r=await fetch(site+path,{signal:AbortSignal.timeout(8000),redirect:'manual'});results.push(auditHtml(await r.text(),path,r.status));}catch{results.push({path,status:0,title:'',issues:['Page request timed out or failed']});}}}));
 const titleCounts=new Map<string,number>();for(const r of results)if(r.title)titleCounts.set(r.title,(titleCounts.get(r.title)||0)+1);for(const r of results)if((titleCounts.get(r.title)||0)>1)r.issues.push('Duplicate title within this audit');
 return {pages:results.sort((a,b)=>a.path.localeCompare(b.path)),checked:results.length,issuePages:results.filter(r=>r.issues.length).length,note:'On-page checks of up to 60 sitemap URLs. This does not measure rankings, backlinks, Core Web Vitals or legal accessibility compliance.'};
}
