/* Flowing silk fabric in raw WebGL (no library, works from file://). k shifts the fold scale per section. */
function fabric(c,k){
const g=c.getContext('webgl');if(!g){c.remove();return}
const V='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const F=`precision mediump float;uniform vec2 r,m;uniform float t,k;
float f(vec2 p){vec2 q=p*2.;float h=0.;for(int i=0;i<4;i++){q+=vec2(sin(q.y*1.3+t*.3+float(i)),cos(q.x*1.1-t*.25));h+=sin(q.x*2.+q.y)/(1.+float(i));}return h*.3;}
void main(){vec2 p=(gl_FragCoord.xy-.5*r)/r.y+(m-.5)*.2;p*=1.+k*.8;float h=f(p);vec2 e=vec2(.004,0.);
vec3 n=normalize(vec3(f(p+e.xy)-h,f(p+e.yx)-h,.02));vec3 l=normalize(vec3(m.x-.2,m.y-.3,.6));
float d=max(dot(n,l),0.);float s=pow(max(dot(reflect(-l,n),vec3(0.,0.,1.)),0.),24.);
vec3 c=mix(vec3(.05,.045,.04),vec3(.72,.6,.42),d*.8)+vec3(.9,.8,.6)*s*.6;c*=smoothstep(1.3,.2,length(p));gl_FragColor=vec4(c,1.);}`;
const sh=(t,s)=>{const o=g.createShader(t);g.shaderSource(o,s);g.compileShader(o);return o},pg=g.createProgram();
g.attachShader(pg,sh(g.VERTEX_SHADER,V));g.attachShader(pg,sh(g.FRAGMENT_SHADER,F));g.linkProgram(pg);
if(!g.getProgramParameter(pg,g.LINK_STATUS)){c.remove();return}
g.useProgram(pg);const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);
g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),g.STATIC_DRAW);
const a=g.getAttribLocation(pg,'a');g.enableVertexAttribArray(a);g.vertexAttribPointer(a,2,g.FLOAT,false,0,0);
const u=n=>g.getUniformLocation(pg,n),rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
let m=[.5,.5],s=[.5,.5],vis=true;
addEventListener('pointermove',e=>{const R=c.getBoundingClientRect();m=[(e.clientX-R.left)/R.width,1-(e.clientY-R.top)/R.height]});
new IntersectionObserver(e=>{vis=e[0].isIntersecting}).observe(c);
(function d(t){requestAnimationFrame(d);if(!vis)return;const q=Math.min(devicePixelRatio,1.5),w=c.clientWidth*q|0,h=c.clientHeight*q|0;
if(c.width!=w||c.height!=h){c.width=w;c.height=h;g.viewport(0,0,w,h)}
s[0]+=(m[0]-s[0])*.05;s[1]+=(m[1]-s[1])*.05;
g.uniform2f(u('r'),w,h);g.uniform2f(u('m'),s[0],s[1]);g.uniform1f(u('t'),rm?0:t/1000);g.uniform1f(u('k'),k);g.drawArrays(g.TRIANGLES,0,3)})(0);
}
fabric(document.getElementById('gl1'),0);fabric(document.getElementById('gl2'),1);
