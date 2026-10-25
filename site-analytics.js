(function(){
 'use strict';
 var configPromise=fetch('/backend-config.json').then(function(r){if(!r.ok)throw new Error('Configuration unavailable');return r.json();});
 var enabled=false,sessionId=null,viewSent=false;
 function pathOnly(value){try{return new URL(value,location.origin).pathname.replace(/\/$/,'')||'/';}catch{return '/';}}
 function emit(event,target){
  if(!enabled||!sessionId||location.pathname.startsWith('/dashboard'))return;
  var referrer='';try{referrer=document.referrer?new URL(document.referrer).hostname:'';}catch(_){}
  configPromise.then(function(c){if(!enabled)return;return fetch(c.url+'/functions/v1/sma-api?action=event',{method:'POST',headers:{apikey:c.publishableKey,Authorization:'Bearer '+c.functionToken,'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),event:event,path:pathOnly(location.href),session_id:sessionId,referrer_host:referrer,device:innerWidth<768?'mobile':innerWidth<1024?'tablet':'desktop',target:target||'',consent:true}),keepalive:true});}).catch(function(){/* Analytics must not interrupt a visitor's task. */});
 }
 function consent(allowed){
  enabled=allowed===true;
  if(!enabled){sessionId=null;viewSent=false;try{sessionStorage.removeItem('sma-analytics-session');}catch(_){}return;}
  if(!sessionId){try{sessionId=sessionStorage.getItem('sma-analytics-session');if(!sessionId){sessionId=crypto.randomUUID();sessionStorage.setItem('sma-analytics-session',sessionId);}}catch(_){sessionId=crypto.randomUUID();}}
  if(!viewSent){viewSent=true;emit('page_view');}
 }
 window.addEventListener('sma:consent',function(event){consent(event.detail.analytics);});
 try{var p=JSON.parse(localStorage.getItem('sma-consent-v1')||'null');if(p&&p.version===2&&Date.now()-p.saved<15552000000)consent(p.analytics);}catch(_){}
 document.addEventListener('click',function(event){
  var booking=event.target.closest('[data-booking-open]');if(booking){emit('booking_opened');return;}
  var anchor=event.target.closest('a[href]');if(!anchor)return;
  var href=anchor.getAttribute('href');if(href.startsWith('tel:')){emit('phone_clicked','phone');return;}
  try{var u=new URL(href,location.origin);if(['localpromovault.com','www.skool.com','agentskillsvault.com'].includes(u.hostname))emit('resource_clicked',u.hostname);}catch(_){}
 });
 var dock=document.querySelector('.voice-dock');if(dock)dock.addEventListener('toggle',function(){if(dock.open)emit('voice_panel_opened');});
 document.querySelectorAll('[data-sma-lead-form]').forEach(function(form){
  form.addEventListener('submit',async function(event){
   event.preventDefault();if(!form.reportValidity())return;
   var status=form.querySelector('[role="status"]'),button=form.querySelector('button[type="submit"]');button.disabled=true;status.textContent='Sending your inquiry…';
   try{var c=await configPromise,fields=new FormData(form),body={};for(var pair of fields.entries())body[pair[0]]=pair[1];body.consent=fields.get('consent')==='yes';
    var response=await fetch(c.url+'/functions/v1/sma-api?action=lead',{method:'POST',headers:{apikey:c.publishableKey,Authorization:'Bearer '+c.functionToken,'Content-Type':'application/json'},body:JSON.stringify(body)});
    var result=await response.json();if(!response.ok)throw new Error(result.error||'Your inquiry could not be saved. Please email hello@strategicmarketingadvisors.com.');
    status.textContent=result.message;form.reset();emit('lead_submitted');
   }catch(error){status.textContent=error.message||'Your inquiry could not be saved. Please email hello@strategicmarketingadvisors.com.';}finally{button.disabled=false;}
  });
 });
})();
