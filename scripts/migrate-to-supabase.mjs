import 'dotenv/config';
import {createClient} from '@supabase/supabase-js';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const required=['NEXT_PUBLIC_SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];
for(const key of required)if(!process.env[key])throw Error(`Missing ${key}. Load .env.local securely before running.`);
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const {data:existing,error:lookupError}=await db.from('portfolio_content').select('id').eq('id',1).maybeSingle();
if(lookupError)throw Error('Check schema installation: '+lookupError.message);
if(existing && process.env.CONFIRM_OVERWRITE !== 'YES')throw Error('Portfolio content already exists. Refusing to overwrite CMS changes. Set CONFIRM_OVERWRITE=YES only after taking a backup.');
const content=JSON.parse(await readFile(path.join(root,'data/content.json'),'utf8'));
const mediaDir=path.join(root,'public/media');const files=await readdir(mediaDir);
const urls=new Map();
const mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'};
for(const filename of files){
 const ext=path.extname(filename).toLowerCase();if(!mime[ext])continue;
 const body=await readFile(path.join(mediaDir,filename));
 const storagePath=`initial/${filename}`;
 const {error}=await db.storage.from('portfolio-media').upload(storagePath,body,{contentType:mime[ext],upsert:true});
 if(error)throw Error(`Upload ${filename}: ${error.message}`);
 urls.set(`/media/${filename}`,db.storage.from('portfolio-media').getPublicUrl(storagePath).data.publicUrl);
 console.log(`Uploaded ${filename}`);
}
function swap(value){if(typeof value==='string')return urls.get(value)||value;if(Array.isArray(value))return value.map(swap);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,swap(v)]));return value;}
const {error}=await db.from('portfolio_content').upsert({id:1,content:swap(content),updated_at:new Date().toISOString()},{onConflict:'id'});
if(error)throw Error(`Database seed failed: ${error.message}`);
console.log(`Imported content and ${urls.size} media files. IMPORTANT: rerunning seed overwrites CMS edits.`);
