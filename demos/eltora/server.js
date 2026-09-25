'use strict';
// Zero-dependency server for local use or any Node host: static site + POST /api/enquiry
const http=require('http'),fs=require('fs'),path=require('path');
try{for(const l of fs.readFileSync(path.join(__dirname,'.env'),'utf8').split(/\r?\n/)){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in process.env))process.env[m[1]]=m[2].replace(/^["']|["']$/g,'')}}catch(_){}
const {handleEnquiry}=require('./lib/enquiry');
const PUB=path.join(__dirname,'public'),PORT=process.env.PORT||3000;
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const OLD=['services','work','about','contact'];
const send=(res,s,o)=>{res.writeHead(s,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(o))};
http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  if(u.pathname==='/api/enquiry'){
    if(req.method!=='POST'){res.setHeader('Allow','POST');return send(res,405,{ok:false,error:'Method not allowed'})}
    let raw='',big=false;
    req.on('data',c=>{raw+=c;if(raw.length>20000){big=true;req.destroy()}});
    req.on('end',async()=>{if(big)return;let b=null;try{b=JSON.parse(raw)}catch(_){}
      const ip=String(req.headers['x-forwarded-for']||'').split(',')[0].trim()||req.socket.remoteAddress;
      const r=await handleEnquiry(b,ip,req.headers);send(res,r.status,r.json)});
    return;
  }
  const p=decodeURIComponent(u.pathname).replace(/\/+$/,'').slice(1);
  if(OLD.includes(p)){res.writeHead(302,{Location:'/#'+p});return res.end()}
  let f=path.normalize(path.join(PUB,p||'index.html'));
  if(!f.startsWith(PUB)){res.writeHead(403);return res.end()}
  fs.readFile(f,(err,data)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain'});return res.end('Not found')}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(data)});
}).listen(PORT,()=>console.log('ELTORA site running on http://localhost:'+PORT));
