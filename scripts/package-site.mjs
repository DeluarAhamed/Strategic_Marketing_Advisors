import fs from 'node:fs';
import path from 'node:path';

// Publish the public website and Studio, without repository content or build tools.
const root=process.cwd();
const output=path.resolve(root,'dist');
if(path.dirname(output)!==root)throw new Error('Output must be inside the project.');
fs.mkdirSync(output,{recursive:true});
for(const entry of fs.readdirSync(output))fs.rmSync(path.join(output,entry),{recursive:true,force:true});
for(const name of fs.readdirSync(root)){
  if(/\.(html|css|js|xml|txt)$/.test(name)&&!name.startsWith('sanity.'))fs.copyFileSync(path.join(root,name),path.join(output,name));
}
for(const name of ['assets','about','articles','services','admin','studio','static']){
  const source=path.join(root,name);
  if(fs.existsSync(source))fs.cpSync(source,path.join(output,name),{recursive:true});
}
if(!fs.existsSync(path.join(output,'studio/index.html')))throw new Error('Studio must be built before packaging.');
console.log('Packaged the public website and Studio in dist/');
