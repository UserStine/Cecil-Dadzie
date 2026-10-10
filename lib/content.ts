import type {PortfolioContent} from './content-types';
import {serviceDb} from './supabase';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
export async function getContent():Promise<PortfolioContent>{
 const {data,error}=await serviceDb().from('portfolio_content').select('content').eq('id',1).single();
 if(error||!data)throw Error('Portfolio content missing. Run the migration script after applying schema.sql.');
 return data.content as PortfolioContent;
}
export async function saveContent(content:PortfolioContent){
 const {data,error}=await serviceDb().from('portfolio_content').update({content,updated_at:new Date().toISOString()}).eq('id',1).select('id').single();
 if(error||!data)throw Error(error?.message||'Content is not seeded.');
}
