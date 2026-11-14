// Analytic curve plans for the second chapter. The source path only supplies
// styling and final-frame provenance. Every moving point is evaluated from the
// displayed equation; no path dash, rectangle reveal or arc-length LUT is used.
function eqpN(x,d=4){return Number(x.toFixed(d)).toString().replace('-', '−')}
function eqpMedian(a){const q=a.slice().sort((a,b)=>a-b);return q.length%2?q[(q.length-1)/2]:(q[q.length/2-1]+q[q.length/2])/2}
function eqParabolaPlan(e,st){
 const page=+e.page,model=eqParabolaModels[e.page];if(!model)return null;
 const rows=model.rows,curves=[],used=new Set(),byOld=new Map(st.m.sourceIndexes.map((x,i)=>[x,st.m.paths[i]]));
 const add=(f,t0,t1,evalFn,mathFn,tex,params,extra={})=>{const r=byOld.get(f.sourceIndex);if(!r)return;used.add(r);curves.push({r,t0,t1,eval:evalFn,math:mathFn,tex,params,count:640,...extra})};
 let note='曲线按当前方程逐点生成；图中的具体取值和坐标尺度按原图校准，显示约值。';
 if(page===23){
  const sx=72,sy=36,h=117,oy=rows[0].k;
  for(const f of rows){const c=(oy-f.k)/sy,t0=(f.endpoints[0][0]-h)/sx,t1=(f.endpoints[1][0]-h)/sx;add(f,t0,t1,t=>[h+sx*t,oy-sy*(t*t+c)],t=>[t,t*t+c],'y=x^2+c,\\qquad x=t',t=>'c ≈ '+eqpN(c)+' · x = '+eqpN(t))}
  note='以第一条抛物线顶点所在水平线为 c=0 的校准基准；保持同一坐标系，改变 c 平移抛物线。';
 }else if(page===24){
  const sx=72,sy=72,ox=198.85,oy=297.64;
  rows.forEach((f,i)=>{const c=.5+Math.floor(i/2)*.125,sign=f.A<0?1:-1,t0=(f.endpoints[0][0]-ox)/sx,t1=(f.endpoints[1][0]-ox)/sx;add(f,t0,t1,t=>[ox+sx*t,oy-sy*sign*(t*t-c*c)],t=>[t,sign*(t*t-c*c)],sign>0?'y=(x+c)(x-c),\\ y\\le0,\\ x=t':'y=-(x+c)(x-c),\\ y\\ge0,\\ x=t',t=>'c = '+eqpN(c)+' · x = '+eqpN(t))});note='每个 c 先后生成上下两条抛物线；当前点由同一个 x=t 代入对应分支求出。';
 }else if(page===25){
  const sy=72,sx=18,oy=324.6388,ox=Math.max(...rows.map(f=>f.k));
  for(const f of rows){const c=(ox-f.k)/sx,t0=(oy-f.endpoints[0][1])/sy,t1=(oy-f.endpoints[1][1])/sy;add(f,t0,t1,t=>[ox-sx*(t*t+c),oy-sy*t],t=>[-t*t-c,t],'-x=y^2+c,\\qquad y=t',t=>'c ≈ '+eqpN(c)+' · y = '+eqpN(t))}note='以黑色参考抛物线为 c=0；同一坐标系内改变 c，抛物线向左平移。';
 }else if(page===27){
  const sx=72,sy=72,ox=405,oy=611.08;
  rows.forEach((f,i)=>{const a=(i+1)/13,c=(i+1)/4,t0=(f.endpoints[0][0]-ox)/sx,t1=(f.endpoints[1][0]-ox)/sx;add(f,t0,t1,t=>[ox+sx*t,oy-sy*(a*(t+2.75)**2+c)],t=>[t,a*(t+2.75)**2+c],'y=a(x+2.75)^2+c,\\qquad x=t',t=>'a = '+eqpN(a)+' · c = '+eqpN(c)+' · x = '+eqpN(t))});note='a 与 c 同时逐条改变：a 控制开口宽窄，c 控制顶点高度。';
 }else if(page===28){
  const sx=14.4,sy=72,ox=114.6,oy=261.28;
  rows.forEach((f,i)=>{const c=i,t0=(oy-f.endpoints[0][1])/sy,t1=(oy-f.endpoints[1][1])/sy;add(f,t0,t1,t=>[ox+sx*(-((t+c/4)**2)+c),oy-sy*t],t=>[-((t+c/4)**2)+c,t],'x=-\\left(y+\\frac c4\\right)^2+c,\\qquad y=t',t=>'c = '+c+' · y = '+eqpN(t))});note='以第一条曲线为 c=0 校准坐标；同一方程中 c 同时改变顶点的横、纵位置。';
 }else if(page===29){
  const s=288,ox=207.3535,oy=350.7875;
  for(const f of rows){const vertical=f.axis===0,sign=vertical?(f.A<0?1:-1):(f.A>0?1:-1),c=vertical?sign*(oy-f.k)/s:sign*(f.k-ox)/s;const t0=vertical?(f.endpoints[0][0]-ox)/s:(oy-f.endpoints[0][1])/s,t1=vertical?(f.endpoints[1][0]-ox)/s:(oy-f.endpoints[1][1])/s;const fn=t=>vertical?[t,sign*(t*t+c)]:[sign*(t*t+c),t];add(f,t0,t1,t=>{const q=fn(t);return[ox+s*q[0],oy-s*q[1]]},fn,(vertical?'y=':'x=')+(sign<0?'-':'')+(vertical?'x^2':'y^2')+(sign<0?'-c':'+c')+',\\qquad '+(vertical?'x':'y')+'=t',t=>'c ≈ '+eqpN(c)+' · '+(vertical?'x':'y')+' = '+eqpN(t))}note='四组抛物线使用同一个中心和坐标单位；每次显示当前所画分支的方程与 c。';
 }else if(page===30){
  const sx=144,sy=72,ox=64.2-sx,oy=st.m.h;
  for(const f of rows){const c=(oy-f.k)/sy,horizontal=byOld.get(f.sourceIndex-1);if(horizontal){const P=Array.from(horizontal.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g),m=>[+m[1],+m[2]]),t0=(P[0][0]-ox)/sx,t1=(P.at(-1)[0]-ox)/sx;add({sourceIndex:f.sourceIndex-1},t0,t1,t=>[ox+sx*t,oy-sy*c],t=>[t,c],'y=c,\\qquad x=t',t=>'c ≈ '+eqpN(c)+' · x = '+eqpN(t)+' · 水平段')}
   const t0=(f.endpoints[0][0]-ox)/sx,t1=(f.endpoints[1][0]-ox)/sx;add(f,t0,t1,t=>[ox+sx*t,oy-sy*((t-1)**2+c)],t=>[t,(t-1)**2+c],'y=(x-1)^2+c,\\qquad x=t',t=>'c ≈ '+eqpN(c)+' · x = '+eqpN(t)+' · 抛物线段')
  }note='同一个 c 先画水平段，再接上抛物线段；原图两段的端点位置保留。';
 }else if(page===31){
  const sx=144,sy=72,ox=207,oy=350.4333;
  for(const f of rows){const sign=f.A<0?1:-1,c=sign*(oy-f.k)/sy,t0=(f.endpoints[0][0]-ox)/sx,t1=(f.endpoints[1][0]-ox)/sx;add(f,t0,t1,t=>[ox+sx*t,oy-sy*sign*(t*t+c)],t=>[t,sign*(t*t+c)],sign>0?'y=x^2+c,\\qquad x=t':'y=-x^2-c,\\qquad x=t',t=>'c ≈ '+eqpN(c)+' · x = '+eqpN(t))}note='同一个 c 对应上下对称的两个分支；最后自动补上中心横线。';
 }else if(page===33){
  const sx=36,sy=72,ox=st.m.w,oy=st.m.h;
  for(const f of rows){const c=(oy-f.h)/sy,delta=(f.k-ox)/sx+c,t0=(oy-f.endpoints[0][1])/sy,t1=(oy-f.endpoints[1][1])/sy;add(f,t0,t1,t=>[ox+sx*((t-c)**2-c+delta),oy-sy*t],t=>[(t-c)**2-c+delta,t],'x=(y-c)^2-c+\\delta,\\qquad y=t',t=>'c ≈ '+eqpN(c)+' · δ ≈ '+eqpN(delta)+' · y = '+eqpN(t))}note='原图的水平位移并非仅由书面公式中的 c 决定；δ 明确表示对齐原图所需的额外水平平移，显示的方程直接生成当前曲线。';
 }else if(page===34){
  const sx=72,sy=72,ox=-8.15,oy=539.08;
  for(const f of rows){const a=-f.A*sx*sx/sy,b=-(2*f.A*ox+f.B)*sx/sy,c=(oy-(f.A*ox*ox+f.B*ox+f.C))/sy,t0=(f.endpoints[0][0]-ox)/sx,t1=(f.endpoints[1][0]-ox)/sx;add(f,t0,t1,t=>[ox+sx*t,oy-sy*(a*t*t+b*t+c)],t=>[t,a*t*t+b*t+c],'x(t)=t,\\qquad y(t)=a t^2+b t+c',t=>'a ≈ '+eqpN(a)+' · b ≈ '+eqpN(b)+' · c ≈ '+eqpN(c)+' · t = '+eqpN(t))}note='原书用抛物线描述抛射轨迹，未给出各次投掷的系数；这里把原图各条轨迹的二次式与当前横向参数 t 明确列出。';
 }else if(page===39){
  const sx=72,sy=60,ox=207.886,oy=st.m.h;
  for(const f of rows){const a=-f.A/sy,b=sx/f.s,c=(oy-f.B)/sy,h=(f.h-ox)/sx,t0=(f.endpoints[0][0]-ox)/sx,t1=(f.endpoints[1][0]-ox)/sx;add(f,t0,t1,t=>[ox+sx*t,oy-sy*(a*Math.cosh(b*(t-h))+c)],t=>[t,a*Math.cosh(b*(t-h))+c],'y=a\\cosh\\!\\bigl(b(x-h)\\bigr)+c,\\qquad x=t',t=>'a ≈ '+eqpN(a)+' · b ≈ '+eqpN(b)+' · c ≈ '+eqpN(c)+' · h ≈ '+eqpN(h)+' · x = '+eqpN(t))}note='原图各悬链线同时发生平移和尺度变化，因此把横纵尺度 a、b 一并写进当前方程；只改变 c 无法生成原图中的形状变化。';
 }
 if(!curves.length)return null;
 return{curves,refs:st.m.paths.filter(r=>!used.has(r)),note};
}
