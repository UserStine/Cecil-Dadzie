import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = () => { const v=process.env.NEXT_PUBLIC_SUPABASE_URL; if(!v) throw Error('Missing NEXT_PUBLIC_SUPABASE_URL'); return v; };
const anon = () => { const v=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if(!v) throw Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY'); return v; };
export function serviceDb(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY; if(!key)throw Error('Missing SUPABASE_SERVICE_ROLE_KEY');return createClient(url(),key,{auth:{autoRefreshToken:false,persistSession:false}});}
export async function userClient(){const store=await cookies();return createServerClient(url(),anon(),{cookies:{getAll(){return store.getAll()},setAll(entries){try{entries.forEach(({name,value,options})=>store.set(name,value,options))}catch{/* Server Component is read-only; routes refresh cookies. */}}}});}
export async function getAdmin(){const client=await userClient(); const {data:{user},error}=await client.auth.getUser();if(error||!user||!user.email)return null;const allowed=(process.env.ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);return allowed.includes(user.email.toLowerCase())?user:null;}
export function requireSameOrigin(request:Request){const origin=request.headers.get('origin');const host=request.headers.get('host');return Boolean(origin&&host&&new URL(origin).host===host);}
