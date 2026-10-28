import {providerState,syncGoogle,syncSemrush,auditSite} from './reporting.ts';
// No credentials are bundled into the website. Supabase injects server keys here.
const base=Deno.env.get('SUPABASE_URL')!;
const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anon=Deno.env.get('SUPABASE_ANON_KEY')!;
const origins=new Set(['https://strategic-marketing-advisors.vercel.app','http://localhost:3000','http://localhost:3100']);
const jsonHeaders={'Content-Type':'application/json','Cache-Control':'no-store'};
const events=new Set(['page_view','booking_opened','voice_panel_opened','resource_clicked','phone_clicked','lead_submitted']);
const interests=['AI Voice Agents','VedaKosa','AI Visibility','Existing client support','Not sure yet'];
const stages=['new','contacted','qualified','booked','won','closed'];
class RequestError extends Error { status:number; constructor(message:string,status=400){super(message);this.status=status;} }
function text(value:unknown,max:number,required=false){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw new RequestError('Please check the supplied fields.');return value.trim();}
function path(value:unknown){const p=text(value,200,true);if(!/^\/[a-z0-9/-]*$/.test(p)||p.includes('//')||p.startsWith('/dashboard')||p.startsWith('/api'))throw new RequestError('Invalid page path.');return p;}
async function db(route:string,method='GET',body?:unknown){const r=await fetch(base+'/rest/v1/'+route,{method,headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json',Prefer:'return=representation'+(route.startsWith('sma_report_snapshots?on_conflict=')?',resolution=merge-duplicates':'')},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw new RequestError('The database operation could not complete. Please reload and try again.',503);return r.status===204?null:await r.json();}
async function rate(bucket:string,key:string,limit:number,seconds:number){const ok=await db('rpc/sma_rate_allowed','POST',{p_bucket:bucket,p_key:key,p_limit:limit,p_seconds:seconds});if(!ok)throw new RequestError('Please wait a moment before trying again.',429);}
async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');}
function validateContent(value:any,kind:string){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new RequestError('Invalid content.');
 const result:any={title:text(value.title,100,true),description:text(value.description,300,true),heading:text(value.heading||'',180),intro:text(value.intro||'',1400),heroImage:imageUrl(value.heroImage||''),heroAlt:text(value.heroAlt||'',200)};
 const sections=value.sections||[];if(!Array.isArray(sections)||sections.length>16)throw new RequestError('Use no more than 16 content sections.');
 result.sections=sections.map((s:any)=>({heading:text(s.heading||'',180),body:text(s.body||'',12000,true),image:imageUrl(s.image||''),alt:text(s.alt||'',200)}));
 if(result.sections.some((s:any)=>s.image&&!s.alt))throw new RequestError('Add alt text for each section image.');
 if(result.heroImage&&!result.heroAlt)throw new RequestError('Add alt text for the main image.');
 if(kind==='article'){result.body=text(value.body||'',50000,true);result.author=text(value.author||'Strategic Marketing Advisors',100);result.category=['mindset','strategies','tactics'].includes(value.category)?value.category:'strategies';result.date=/^\d{4}-\d{2}-\d{2}$/.test(value.date||'')?value.date:new Date().toISOString().slice(0,10);result.readTime=text(value.readTime||'5 min read',30);}
 return result;
}
function validateDeal(body:any){
 const value=body.deal_value,probability=body.win_probability;
 if(value!==null&&(typeof value!=='number'||!Number.isFinite(value)||value<0||value>999999999999.99)||!Number.isInteger(probability)||probability<0||probability>100)throw new RequestError('Enter a valid USD amount and likelihood between 0 and 100.');
 const close=body.expected_close||null;
 if(close){const parsed=new Date(close);if(typeof close!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(close)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==close)throw new RequestError('Choose a valid expected close date.');}
 return {deal_value:value===null?null:Math.round(value*100)/100,win_probability:probability,expected_close:close};
}
function imageUrl(value:unknown){const s=text(value,1200);if(!s)return '';if(/^\/assets\/[a-zA-Z0-9/_.,-]+\.(webp|png|jpe?g)$/.test(s))return s;try{const u=new URL(s);if(u.origin===base&&u.pathname.startsWith('/storage/v1/object/public/sma-media/')&&!u.search&&!u.hash)return u.href;}catch{}throw new RequestError('Choose an image from the SMA media library.');}
async function actor(req:Request){
 const token=req.headers.get('Authorization')||'';
 const r=await fetch(base+'/auth/v1/user',{headers:{apikey:anon,Authorization:token}});
 if(!r.ok)throw new RequestError('Sign in to continue.',401);
 const u=await r.json();if(!u.email_confirmed_at||!u.email)throw new RequestError('Confirm your email before continuing.',403);
 const email=u.email.toLowerCase();const members=await db('sma_members?email=eq.'+encodeURIComponent(email)+'&select=email,role');
 if(!members.length)throw new RequestError('This account has not been granted SMA dashboard access.',403);
 return members[0];
}
async function audit(email:string,action:string,target=''){await db('sma_audit','POST',{actor:email,action,target});}
async function publicAction(action:string,req:Request,body:any,ipKey:string){
 if(req.method!=='POST')throw new RequestError('Method not allowed.',405);
 if(action==='event'){
  await rate('events',ipKey,120,60);
  if(body.consent!==true||!events.has(body.event))throw new RequestError('Invalid analytics event.');
  if(!/^[0-9a-f-]{36}$/.test(body.id||'')||!/^[0-9a-f-]{36}$/.test(body.session_id||''))throw new RequestError('Invalid event identifier.');
  const host=typeof body.referrer_host==='string'&&/^[a-z0-9.-]{0,150}$/i.test(body.referrer_host)?body.referrer_host:'';
  const target=text(body.target||'',200);if(target&& !/^\/[a-z0-9/-]*$/.test(target)&&!['localpromovault.com','www.skool.com','agentskillsvault.com','phone'].includes(target))throw new RequestError('Invalid event target.');
  await db('sma_events?on_conflict=id','POST',{id:body.id,event:body.event,path:path(body.path),session_id:body.session_id,referrer_host:host,device:['mobile','tablet'].includes(body.device)?body.device:'desktop',target,is_test:(req.headers.get('Origin')||'').startsWith('http://localhost:')});
  return {ok:true};
 }
 if(action==='lead'){
  await rate('leads',ipKey,5,3600);
  if(body.website)return {ok:true}; // Honeypot; no record is created.
  if(body.consent!==true)throw new RequestError('Please agree to be contacted about your inquiry.');
  const email=text(body.email,254,true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new RequestError('Enter a valid email address.');
  if(!interests.includes(body.interest))throw new RequestError('Choose a service interest.');
  await db('sma_leads','POST',{name:text(body.name,120,true),email,phone:text(body.phone||'',40),business:text(body.business||'',180),interest:body.interest,message:text(body.message||'',4000),source:'website',is_test:(req.headers.get('Origin')||'').startsWith('http://localhost:')});
  return {ok:true,message:'Your inquiry has been saved for the SMA team. For a confirmed appointment, choose a time in the calendar.'};
 }
 throw new RequestError('Not found.',404);
}
async function adminAction(action:string,req:Request,body:any,who:any){
 if(who.role==='viewer'&&!['profile','overview','insights','revenue','reports'].includes(action))throw new RequestError('This account can view reports only.',403);
 const writable=['owner','editor'].includes(who.role);
 if(req.method==='POST'&&!writable)throw new RequestError('This account has read-only access.',403);
 const url=new URL(req.url);
 if(action==='create-lead'&&req.method==='POST'){
  const email=text(body.email||'',254).toLowerCase(),phone=text(body.phone||'',40);if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!email&&phone.replace(/\D/g,'').length<7||!interests.includes(body.interest)||!['phone','referral','event','other'].includes(body.source)||body.consent!==true)throw new RequestError('Check the email, service, source and contact permission.');
  const rows=await db('sma_leads','POST',{name:text(body.name,120,true),email,business:text(body.business||'',180),phone:text(body.phone||'',40),interest:body.interest,source:body.source,message:text(body.message||'',4000)});await audit(who.email,'create_lead',rows[0].id);return {id:rows[0].id};
 }
 if(action==='revenue'&&req.method==='GET')return await db('rpc/sma_revenue','POST',{p_days:[7,30,90].includes(Number(url.searchParams.get('days')))?Number(url.searchParams.get('days')):30});
 if(action==='reports'&&req.method==='GET'){
  const [reports,configs]=await Promise.all([db('sma_report_snapshots?select=source,period_days,data,synced_at&order=synced_at.desc'),db('sma_reporting_config?id=eq.true')]);const c=configs[0]||{};
  return reports.filter((r:any)=>r.source==='site-audit'||r.source==='ga4'&&c.ga4_property&&r.data.property===c.ga4_property||r.source==='search-console'&&c.search_property&&r.data.property===c.search_property||r.source==='semrush'&&c.semrush_domain&&r.data.domain===c.semrush_domain);
 }
 if(['reporting-status','save-reporting-config','sync-report'].includes(action)){
  if(who.role!=='owner')throw new RequestError('Only an owner can configure or sync reporting providers.',403);
  const config=(await db('sma_reporting_config?id=eq.true'))[0]||{};
  if(action==='reporting-status'&&req.method==='GET')return providerState(config,n=>Deno.env.get(n));
  if(action==='save-reporting-config'&&req.method==='POST'){
   const ga4=text(body.ga4_property||'',30),search=text(body.search_property||'',300),domain=text(body.semrush_domain||'',200).toLowerCase();
   if(ga4&&!/^\d+$/.test(ga4)||search&&!/^(sc-domain:[a-z0-9.-]+|https:\/\/[a-z0-9.-]+\/)$/.test(search)||domain&&!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain))throw new RequestError('Check your numeric GA4 ID, Search Console property and domain.');
   await db('sma_reporting_config?id=eq.true','PATCH',{ga4_property:ga4,search_property:search,semrush_domain:domain,updated_at:new Date().toISOString()});
   await audit(who.email,'reporting_config','SMA reporting');return {ok:true};
  }
  if(action==='sync-report'&&req.method==='POST'){
   const source=body.source,days=[7,30,90].includes(body.days)?body.days:30;
   if(!['ga4','search-console','semrush','site-audit'].includes(source))throw new RequestError('Choose a supported report.');
   if(source==='semrush'&&body.approve_units!==true)throw new RequestError('Approve the stated Semrush API-unit usage before syncing.');
   await rate('report-sync-'+source,who.email,1,source==='site-audit'?300:60);
   let data;try{data=source==='site-audit'?await auditSite():source==='semrush'?await syncSemrush(config,n=>Deno.env.get(n)):await syncGoogle(source,days,config,n=>Deno.env.get(n));}catch(e){throw new RequestError(e instanceof Error?e.message:'Report sync failed.',503);}
   await db('sma_report_snapshots?on_conflict=source,period_days','POST',{source,period_days:['semrush','site-audit'].includes(source)?0:days,data,synced_at:new Date().toISOString()});
   await audit(who.email,'sync_report',source);return {ok:true};
  }
 }
 if(action==='insights'&&req.method==='GET'){
  const days=[7,30,90].includes(Number(url.searchParams.get('days')))?Number(url.searchParams.get('days')):30;
  const device=url.searchParams.get('device')||'';if(!['','mobile','tablet','desktop'].includes(device))throw new RequestError('Invalid device filter.');
  return await db('rpc/sma_insights','POST',{p_days:days,p_device:device});
 }
 if(action==='lead-search'&&req.method==='GET'){
  const stage=url.searchParams.get('stage')||'',interest=url.searchParams.get('interest')||'';
  if(stage&&!stages.includes(stage)||interest&&!interests.includes(interest))throw new RequestError('Invalid lead filter.');
  return await db('rpc/sma_lead_search','POST',{p_query:text(url.searchParams.get('q')||'',120),p_stage:stage,p_interest:interest,p_offset:Math.max(0,Math.min(Number(url.searchParams.get('offset'))||0,100000))});
 }
 if(action==='work-queue'&&req.method==='GET')return await db('rpc/sma_work_queue','POST',{});
 if(action==='lead-detail'&&req.method==='GET'){
  const id=text(url.searchParams.get('id'),36,true);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new RequestError('Invalid lead identifier.');
  const rows=await db('sma_leads?id=eq.'+id+'&is_test=eq.false');if(!rows.length)throw new RequestError('Lead not found.',404);
  const [tasks,activity]=await Promise.all([db('sma_followups?lead_id=eq.'+id+'&order=created_at.desc&limit=100'),db('sma_lead_activity?lead_id=eq.'+id+'&order=created_at.desc,id.desc&limit=100')]);
  return {lead:rows[0],tasks,activity};
 }
 if(['add-task','complete-task','add-activity','lead-update'].includes(action)&&req.method==='POST'){
  const id=text(body.id,36,true);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new RequestError('Invalid identifier.');
  const data:any={id};
  if(action==='lead-update'){if(!stages.includes(body.stage)||!['normal','high'].includes(body.priority||'normal'))throw new RequestError('Invalid lead update.');Object.assign(data,{stage:body.stage,notes:text(body.notes||'',8000),priority:body.priority||'normal'});if(Object.hasOwn(body,'deal_value'))Object.assign(data,validateDeal(body));}
  if(action==='add-task'){
   const due=Date.parse(body.due_at);if(!Number.isFinite(due)||due<Date.now()-366*86400000||due>Date.now()+5*366*86400000)throw new RequestError('Choose a valid follow-up date within five years.');
   Object.assign(data,{title:text(body.title,180,true),due_at:new Date(due).toISOString()});
  }
  if(action==='add-activity'){if(!['note','call','email','meeting'].includes(body.kind))throw new RequestError('Choose a valid activity type.');Object.assign(data,{kind:body.kind,body:text(body.body,4000,true)});}
  const result=await db('rpc/sma_crm_write','POST',{p_action:action,p_data:data,p_actor:who.email});if(result.error)throw new RequestError(result.error,409);
  return result;
 }
 if(action==='profile'&&req.method==='GET')return {email:who.email,role:who.role};
 if(action==='overview'&&req.method==='GET'){const days=[7,30,90].includes(Number(url.searchParams.get('days')))?Number(url.searchParams.get('days')):30;return await db('rpc/sma_overview','POST',{p_days:days});}
 if(action==='leads'&&req.method==='GET'){const offset=Math.max(0,Math.min(Number(url.searchParams.get('offset'))||0,100000));return await db('sma_leads?is_test=eq.false&select=id,created_at,name,email,phone,business,interest,message,stage,notes,source,updated_at&order=created_at.desc&limit=50&offset='+offset);}
 if(action==='content'&&req.method==='GET')return await db('sma_content_drafts?select=path,kind,revision,updated_at,updated_by,content&order=path');
 if(action==='published'&&req.method==='GET')return await db('sma_published_content?select=path,revision,published_at&order=path');
 if(action==='save-content'&&req.method==='POST'){
  const p=path(body.path),kind=body.kind==='article'?'article':'page';const content=validateContent(body.content,kind);
  const old=await db('sma_content_drafts?path=eq.'+encodeURIComponent(p));
  if(old.length){if(old[0].revision!==body.revision)throw new RequestError('Someone else edited this content. Reload before saving.',409);const rows=await db('sma_content_drafts?path=eq.'+encodeURIComponent(p)+'&revision=eq.'+body.revision,'PATCH',{content,revision:body.revision+1,updated_by:who.email,updated_at:new Date().toISOString()});if(!rows.length)throw new RequestError('The draft changed. Reload before saving.',409);await audit(who.email,'save_draft',p);return rows[0];}
  if(kind!=='article'||!/^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p))throw new RequestError('New content must use a unique /articles/article-name path.');
  const rows=await db('sma_content_drafts','POST',{path:p,kind,content,updated_by:who.email});await audit(who.email,'create_article',p);return rows[0];
 }
 if(action==='publish'&&req.method==='POST'){
  if(who.role!=='owner')throw new RequestError('Only an owner can publish to the live site.',403);
  const p=path(body.path);const draft=await db('sma_content_drafts?path=eq.'+encodeURIComponent(p));if(!draft.length)throw new RequestError('Draft not found.',404);validateContent(draft[0].content,draft[0].kind);
  const result=await db('rpc/sma_publish','POST',{p_path:p,p_revision:body.revision,p_actor:who.email});return {...result,message:'Published. The live site can take up to 60 seconds to refresh.'};
 }
 if(action==='media'&&req.method==='GET')return await db('sma_media?select=id,url,filename,alt,created_at&order=created_at.desc&limit=100');
 if(action==='upload'&&req.method==='POST'){
  const name=text(body.filename,150,true),alt=text(body.alt,200,true);if(typeof body.data!=='string'||body.data.length>2800000)throw new RequestError('Choose an image smaller than 2 MB.');
  let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(body.data),c=>c.charCodeAt(0));}catch{throw new RequestError('Invalid image data.');}
  const png=bytes.length>8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n);
  const jpeg=bytes.length>3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  const webp=bytes.length>12&&new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
  if(!png&&!jpeg&&!webp||bytes.length>2097152)throw new RequestError('Use a JPEG, PNG or WebP image under 2 MB.');
  const file=crypto.randomUUID()+'.'+(png?'png':jpeg?'jpg':'webp');const r=await fetch(base+'/storage/v1/object/sma-media/'+file,{method:'POST',headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':png?'image/png':jpeg?'image/jpeg':'image/webp'},body:bytes});if(!r.ok)throw new RequestError('The upload failed. Please retry.',503);
  const rows=await db('sma_media','POST',{url:base+'/storage/v1/object/public/sma-media/'+file,filename:name,alt,created_by:who.email});await audit(who.email,'upload_image',file);return rows[0];
 }
 if(action==='audit'&&req.method==='GET')return await db('sma_audit?select=actor,action,target,created_at&order=created_at.desc&limit=50');
 if(action==='members'&&req.method==='GET'&&who.role==='owner')return await db('sma_members?select=email,role,created_at&order=email');
 if(action==='add-member'&&req.method==='POST'&&who.role==='owner'){
  const email=text(body.email,254,true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['owner','editor','viewer'].includes(body.role))throw new RequestError('Check the email and role.');
  const rows=await db('sma_members','POST',{email,role:body.role});await audit(who.email,'add_member',email);return rows[0];
 }
 throw new RequestError('Not found.',404);
}
export async function handleRequest(req:Request){
 const origin=req.headers.get('Origin');const headers={...jsonHeaders,...(origin&&origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin'}:{})};
 if(origin&&!origins.has(origin))return new Response(JSON.stringify({error:'Origin not allowed.'}),{status:403,headers});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 try{
  if(!['GET','POST'].includes(req.method))throw new RequestError('Method not allowed.',405);
  if(Number(req.headers.get('content-length')||0)>3000000)throw new RequestError('Request too large.',413);
  const raw=req.method==='POST'?await req.text():'';if(raw.length>3000000)throw new RequestError('Request too large.',413);
  let body:any={};try{if(raw)body=JSON.parse(raw);}catch{throw new RequestError('Invalid JSON.');}
  const action=new URL(req.url).searchParams.get('action')||'';
  const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  const ipKey=await digest(service+':'+new Date().toISOString().slice(0,10)+':'+ip);
  let result;
  if(['event','lead'].includes(action))result=await publicAction(action,req,body,ipKey);
  else {const who=await actor(req);await rate('admin',who.email,90,60);result=await adminAction(action,req,body,who);}
  return new Response(JSON.stringify(result),{status:200,headers});
 }catch(e){const err=e instanceof RequestError?e:new RequestError('Something went wrong. Please try again.',500);return new Response(JSON.stringify({error:err.message}),{status:err.status,headers});}
}
Deno.serve(handleRequest);
