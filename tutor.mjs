export async function tutor(request, publicOrigin) {
 const path = new URL(request.url).pathname;
 if (request.method !== 'POST' || path !== '/tutor') return new Response('Not found',{status:404});
 if (request.headers.get('origin') !== publicOrigin) return new Response('Forbidden',{status:403});
 try {
  const raw = await request.text();
  if(raw.length>24000) return Response.json({error:'Start a shorter lesson.'},{status:400});
  const messages = JSON.parse(raw);
  if(!Array.isArray(messages) || messages.length>15 || messages.some(m=>!['user','assistant'].includes(m?.role)||typeof m.content!=='string'||m.content.length>2000)) return Response.json({error:'Please shorten the lesson.'},{status:400});
  const keyName = Object.keys(process.env).find(name => name.trim().toUpperCase() === 'OPENAI_API_KEY' && process.env[name]?.trim());
  const apiKey = process.env.OPENAI_API_KEY?.trim() || (keyName && process.env[keyName].trim());
  if (!apiKey) {
   return Response.json({error:'The site is missing its OpenAI API key.'},{status:503});
  }
  const result = await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini',store:false,max_output_tokens:350,instructions:'You are Ms. Smartson, a patient AI tutor for seventh-grade math and science. Use plain spoken language. Teach one step at a time with an example and ask one short question. Wait for the student to try. On errors, give a targeted hint before revealing the answer. Redirect unrelated topics to the lesson. Do not request personal information. Format your reply as plain text.',input:messages})});
  if (!result.ok) {
   const body = await result.json().catch(() => null);
   const code = body?.error?.code;
   const message = code === 'insufficient_quota' || code === 'billing_hard_limit_reached'
    ? 'The OpenAI project has no available API quota. Check its billing and credits.'
    : result.status === 401 ? 'OpenAI rejected the API key saved in Study Spark.'
    : result.status === 403 || code === 'model_not_found' ? 'The OpenAI project does not have access to the tutor model.'
    : result.status === 429 ? 'The tutor is busy. Please try again shortly.'
    : 'The tutor is temporarily unavailable.';
   return Response.json({error:message},{status:502});
  }
  const data=await result.json();
  const reply=data.output.flatMap(item=>item.content??[]).filter(part=>part.type==='output_text').map(part=>part.text).join(' ').slice(0,2000);
  return Response.json(reply?{reply}:{error:'Try asking the question another way.'});
 } catch {return Response.json({error:'The tutor could not respond. Try again.'},{status:502});}
}
