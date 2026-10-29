import fs from 'node:fs';
import path from 'node:path';

// Publish the public website and Studio, without repository content or build tools.
const root=process.cwd();
const output=path.resolve(root,'dist');
if(path.dirname(output)!==root)throw new Error('Output must be inside the project.');
fs.mkdirSync(output,{recursive:true});
for(const entry of fs.readdirSync(output))fs.rmSync(path.join(output,entry),{recursive:true,force:true});
const templates=path.join(root,'runtime-templates');
fs.mkdirSync(templates,{recursive:true});
const manifest={};
for(const dir of ['.','about','articles','services','resources']){
 for(const name of fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.html'))){
  const relative=dir==='.'?name:dir+'/'+name;
  fs.mkdirSync(path.dirname(path.join(templates,relative)),{recursive:true});
  fs.copyFileSync(path.join(root,relative),path.join(templates,relative));
  if(!['404.html','success.html','retired-account.html'].includes(relative))manifest[relative==='index.html'?'/':'/'+relative.replace(/\.html$/,'')]=relative;
 }
}
fs.writeFileSync(path.join(templates,'manifest.json'),JSON.stringify(manifest));
fs.copyFileSync('sitemap.xml',path.join(templates,'sitemap.xml'));
for(const name of fs.readdirSync(root)){
  if((/\.(css|js|xml|txt)$/.test(name)&&name!=='sitemap.xml'&&!name.startsWith('sanity.'))||['404.html','success.html'].includes(name))fs.copyFileSync(path.join(root,name),path.join(output,name));
}
fs.copyFileSync('backend-config.json',path.join(output,'backend-config.json'));
for(const name of ['assets','dashboard','studio','static']){
  const source=path.join(root,name);
  if(fs.existsSync(source))fs.cpSync(source,path.join(output,name),{recursive:true});
}
if(!fs.existsSync(path.join(output,'studio/index.html')))throw new Error('Studio must be built before packaging.');
console.log('Packaged the public website and Studio in dist/');
