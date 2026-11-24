'use strict';
// Vercel serverless function: POST /api/enquiry
const {handleEnquiry}=require('../lib/enquiry');
module.exports=async(req,res)=>{
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'Method not allowed'})}
  let body=req.body;if(typeof body==='string'){try{body=JSON.parse(body)}catch(_){body=null}}
  const ip=String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||(req.socket&&req.socket.remoteAddress)||'';
  const r=await handleEnquiry(body,ip,req.headers);
  res.setHeader('Cache-Control','no-store');res.status(r.status).json(r.json);
};
