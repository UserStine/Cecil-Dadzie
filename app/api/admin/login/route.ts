import {NextResponse} from 'next/server';
import {userClient,requireSameOrigin} from '../../../../lib/supabase';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!requireSameOrigin(request))return NextResponse.json({error:'Invalid request origin'},{status:403});
 let input;try{input=await request.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 const email=String(input.email||'').trim().toLowerCase();const password=String(input.password||'');
 if(!email||!password)return NextResponse.json({error:'Enter your email and password'},{status:400});
 const client=await userClient();const {data,error}=await client.auth.signInWithPassword({email,password});
 if(error||!data.user)return NextResponse.json({error:'Invalid sign-in credentials'},{status:401});
 const allowed=(process.env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase());
 if(!allowed.includes(data.user.email?.toLowerCase()||'')){await client.auth.signOut();return NextResponse.json({error:'This account does not have CMS access'},{status:403})}
 return NextResponse.json({ok:true});
}
