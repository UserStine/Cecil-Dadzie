import {NextResponse} from 'next/server';
import {getAdmin,requireSameOrigin} from '../../../../lib/supabase';
import {getContent,saveContent} from '../../../../lib/content';
import type {PortfolioContent} from '../../../../lib/content-types';
export const runtime='nodejs';
export async function GET(){if(!await getAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json(await getContent(),{headers:{'Cache-Control':'no-store'}});}
export async function PUT(req:Request){if(!await getAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});if(!requireSameOrigin(req))return NextResponse.json({error:'Invalid request origin'},{status:403});let next:PortfolioContent;try{next=await req.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
const sections=['areas','projects','education','volunteering','affiliations','publications','certifications'] as const;
if(!next||typeof next!=='object'||!next.site||typeof next.site.name!=='string'||typeof next.site.linkedin!=='string'||!sections.every(key=>Array.isArray(next[key])&&next[key].length<=100))return NextResponse.json({error:'Invalid content structure'},{status:400});
const safe=(value:unknown):boolean=>typeof value==='string'&&value.length<=3000;
if(!Object.values(next.site).every(safe)||!sections.every(key=>next[key].every(row=>row&&typeof row==='object'&&Object.values(row).every(safe))))return NextResponse.json({error:'Invalid field values'},{status:400});
try{await saveContent(next)}catch{return NextResponse.json({error:'Cannot write content storage; check CONTENT_FILE and disk permissions.'},{status:500})}return NextResponse.json({ok:true});}
