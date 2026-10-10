import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {getAdmin,requireSameOrigin,serviceDb} from '../../../../lib/supabase';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!await getAdmin())return NextResponse.json({error:'Please sign in first'},{status:401});
 if(!requireSameOrigin(request))return NextResponse.json({error:'Invalid upload origin'},{status:403});
 let form:FormData;try{form=await request.formData()}catch{return NextResponse.json({error:'Invalid upload'},{status:400})}
 const file=form.get('image');if(!(file instanceof File))return NextResponse.json({error:'Choose an image'},{status:400});
 if(!file.size||file.size>5*1024*1024)return NextResponse.json({error:'Image must be 5 MB or smaller'},{status:400});
 const formats:Record<string,{ext:string;valid:(b:Uint8Array)=>boolean}>={
 'image/jpeg':{ext:'jpg',valid:b=>b[0]===255&&b[1]===216&&b[2]===255},
 'image/png':{ext:'png',valid:b=>b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71},
 'image/webp':{ext:'webp',valid:b=>String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP'}
 };
 const format=formats[file.type];if(!format)return NextResponse.json({error:'Only JPG, PNG or WebP images are allowed'},{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer());if(!format.valid(bytes))return NextResponse.json({error:'Image data does not match type'},{status:400});
 const path=`uploads/${randomUUID()}.${format.ext}`;const db=serviceDb();
 const {error}=await db.storage.from('portfolio-media').upload(path,bytes,{contentType:file.type,upsert:false});
 if(error)return NextResponse.json({error:'Upload failed: '+error.message},{status:500});
 const {data}=db.storage.from('portfolio-media').getPublicUrl(path);
 return NextResponse.json({url:data.publicUrl});
}
