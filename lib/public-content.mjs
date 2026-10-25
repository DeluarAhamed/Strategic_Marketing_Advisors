import config from '../backend-config.json' with {type:'json'};
let cache={at:0,rows:[]};
export async function publishedContent(){
  if(Date.now()-cache.at<15000)return cache.rows;
  try{
    const response=await fetch(config.url+'/rest/v1/sma_published_content?select=path,kind,content,revision,published_at&order=published_at.desc&limit=1000',{headers:{apikey:config.publishableKey},signal:AbortSignal.timeout(3000)});
    if(!response.ok)throw new Error('Published content unavailable');
    const rows=await response.json();cache={at:Date.now(),rows};return rows;
  }catch{return cache.rows;}
}
export const siteUrl=config.siteUrl;
export function safeImage(value){return typeof value==='string'&&(/^\/assets\/[a-zA-Z0-9/_.,-]+\.(webp|png|jpe?g)$/.test(value)||value.startsWith(config.url+'/storage/v1/object/public/sma-media/'))?value:'';}
