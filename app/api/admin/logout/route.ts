import {NextResponse} from 'next/server';
import {userClient,requireSameOrigin} from '../../../../lib/supabase';
export async function POST(request:Request){if(!requireSameOrigin(request))return NextResponse.json({error:'Invalid request origin'},{status:403});const client=await userClient();await client.auth.signOut();return NextResponse.json({ok:true});}
