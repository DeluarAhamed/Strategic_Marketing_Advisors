// These values only establish a client-side recovery flow. Supabase verifies
// the access token again for get-user and password-update requests.
export function recoveryFromHash(hash,now=Date.now()){
 const fields=new URLSearchParams(String(hash||'').replace(/^#/,''));
 if(fields.get('type')!=='recovery')return null;
 const access=fields.get('access_token')||'',refresh=fields.get('refresh_token')||'',seconds=Number(fields.get('expires_in'));
 if(!access||access.length>16000||!refresh||refresh.length>2048||!Number.isFinite(seconds)||seconds<=0||seconds>86400)return null;
 return {access_token:access,refresh_token:refresh,expires_at:Math.floor(now/1000)+seconds,recovery:true};
}
