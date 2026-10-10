import Home from "../components/Home";
import {getContent} from "../lib/content";
export const dynamic="force-dynamic";
export default async function Page(){const content=await getContent();return <Home content={content}/>;}
