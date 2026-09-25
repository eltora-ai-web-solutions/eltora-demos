'use strict';
// Shared enquiry logic (used by api/enquiry.js on Vercel and by server.js on any Node host).
// All secrets come from environment variables – nothing sensitive is ever sent to the browser.
const SERVICES=['Web Development','AI Solutions','Automation','Data & Analytics','Custom Software','Mobile Apps','E-Commerce','UI/UX & Branding','3D Invitations','Maintenance'];
const LIMITS={name:100,email:254,phone:30,company:120,service:60,details:4000};
const hits=new Map(); // best-effort per-instance rate limit
const WINDOW=10*60*1000, MAX_HITS=5;
const clean=(v,max)=>String(v==null?'':v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim().slice(0,max);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function sameOrigin(h){const o=h&&h.origin;if(!o)return true;try{return new URL(o).host===(h['x-forwarded-host']||h.host)}catch(_){return false}}
function limited(ip){const now=Date.now(),a=(hits.get(ip)||[]).filter(t=>now-t<WINDOW);a.push(now);hits.set(ip,a);if(hits.size>5000)hits.clear();return a.length>MAX_HITS}
function validate(b){
  const d={};for(const k of Object.keys(LIMITS))d[k]=clean(b[k],LIMITS[k]);
  const e=[];
  if(d.name.length<2)e.push('Please enter your name.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email))e.push('Please enter a valid email address.');
  if(!/^[0-9+()\-.\s]{7,20}$/.test(d.phone))e.push('Please enter a valid phone / WhatsApp number.');
  if(!SERVICES.includes(d.service))e.push('Please select a service.');
  if(d.details.length<10)e.push('Please describe your project (at least 10 characters).');
  return {d,e};
}
function build(d,when){
  const one=s=>s.replace(/[\r\n]+/g,' ');
  const subject=`New ELTORA Project Enquiry – ${one(d.name)}`;
  const text=['NEW PROJECT ENQUIRY','',`Name: ${d.name}`,`Email: ${d.email}`,`Phone / WhatsApp: ${d.phone}`,`Company: ${d.company||'-'}`,`Service Required: ${d.service}`,'Project Details:',d.details,'',`Submission Date/Time: ${when}`,'','Website:','ELTORA AI & Web Solutions'].join('\n');
  const row=(k,v)=>`<tr><td style="padding:6px 14px 6px 0;color:#7a5a1f;font-weight:600;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0">${v}</td></tr>`;
  const html=`<div style="font-family:Arial,sans-serif;font-size:15px;color:#1a1006;max-width:640px"><h2 style="margin:0 0 14px;color:#b57d14">NEW PROJECT ENQUIRY</h2><table style="border-collapse:collapse">${row('Name:',esc(d.name))}${row('Email:',`<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>`)}${row('Phone / WhatsApp:',esc(d.phone))}${row('Company:',esc(d.company||'-'))}${row('Service Required:',esc(d.service))}${row('Project Details:',`<div style="white-space:pre-wrap">${esc(d.details)}</div>`)}${row('Submission Date/Time:',esc(when))}</table><p style="margin-top:18px;color:#555">Website:<br><strong>ELTORA AI &amp; Web Solutions</strong></p></div>`;
  return {subject,text,html};
}
async function handleEnquiry(body,ip,headers,env=process.env){
  if(!sameOrigin(headers))return {status:403,json:{ok:false,error:'Request not allowed.'}};
  if(!body||typeof body!=='object')return {status:400,json:{ok:false,error:'Invalid request.'}};
  if(body.website)return {status:200,json:{ok:true}}; // honeypot: bots get a silent "success", nothing is sent
  if(limited(ip||'unknown'))return {status:429,json:{ok:false,error:'Too many enquiries from this connection. Please try again later or contact us on WhatsApp.'}};
  const {d,e}=validate(body);
  if(e.length)return {status:400,json:{ok:false,error:e[0],errors:e}};
  const key=env.RESEND_API_KEY,to=env.TO_EMAIL||'eltora2026@gmail.com',from=env.FROM_EMAIL||'ELTORA Website <onboarding@resend.dev>';
  if(!key){console.error('[enquiry] RESEND_API_KEY is not set');return {status:500,json:{ok:false,error:'Email service is not configured.'}}}
  const when=new Intl.DateTimeFormat('en-IN',{dateStyle:'long',timeStyle:'medium',timeZone:'Asia/Kolkata'}).format(new Date())+' (IST)';
  const m=build(d,when),ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),12000);
  try{
    const r=await fetch(env.RESEND_API_URL||'https://api.resend.com/emails',{method:'POST',signal:ctl.signal,headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:d.email,subject:m.subject,text:m.text,html:m.html})});
    if(!r.ok){console.error('[enquiry] provider error',r.status,(await r.text()).slice(0,300));return {status:502,json:{ok:false,error:'We could not deliver your enquiry right now.'}}}
    return {status:200,json:{ok:true}};
  }catch(err){console.error('[enquiry] send failed',err&&err.message);return {status:502,json:{ok:false,error:'We could not deliver your enquiry right now.'}}}
  finally{clearTimeout(t)}
}
module.exports={handleEnquiry,SERVICES};
