import {createHmac,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
const secret=()=>process.env.ADMIN_SESSION_SECRET||'';
export function configured(){return Boolean(process.env.ADMIN_PASSWORD&&secret());}
export function validPassword(input:string){const a=Buffer.from(input),b=Buffer.from(process.env.ADMIN_PASSWORD||'');return configured() && a.length===b.length && timingSafeEqual(a,b);}
export function makeToken(){const expiry=String(Date.now()+12*60*60*1000);return expiry+'.'+createHmac('sha256',secret()).update(expiry).digest('hex');}
export async function authenticated(){if(!configured())return false;const c=(await cookies()).get('cecil_admin')?.value; if(!c)return false;const [expiry,sig]=c.split('.');if(!expiry||!sig||Number(expiry)<Date.now())return false;const expected=createHmac('sha256',secret()).update(expiry).digest('hex');const a=Buffer.from(sig),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);}
