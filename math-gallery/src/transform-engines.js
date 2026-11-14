// Constructive transforms: move complete objects, retain copies, then restore exact source layering.
function trWhite(r){return (r.s.length&&Math.min(...r.s)>.999)||(r.f.length&&Math.min(...r.f)>.999)}
function trCenter(rs){let b=rs.reduce((a,r)=>[Math.min(a[0],r.box[0]),Math.min(a[1],r.box[1]),Math.max(a[2],r.box[2]),Math.max(a[3],r.box[3])],[Infinity,Infinity,-Infinity,-Infinity]);return[(b[0]+b[2])/2,(b[1]+b[3])/2]}
function trAngle(r){const ps=Array.from(r.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g),m=>[+m[1],+m[2]]);if(ps.length!==2)return null;return ((Math.atan2(ps[1][1]-ps[0][1],ps[1][0]-ps[0][0])*180/Math.PI)%180+180)%180}
function trGroup(rs,mode='copy',arg={}){return {rs,mode,...arg}}
function trVertices(r){return Array.from(r.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g),m=>[+m[1],+m[2]])}
function trSimilarity(prev,r,square){
 const c=trCenter([prev]),t=trCenter([r]),a=trVertices(prev),b=trVertices(r);let angle=r.motion?.a||0,scale=r.motion?.s||1;
 if(square&&a.length>=4&&b.length>=4){
  const pa=Math.atan2(a[1][1]-a[0][1],a[1][0]-a[0][0]),pb=Math.atan2(b[1][1]-b[0][1],b[1][0]-b[0][0]);
  angle=((pb-pa+Math.PI/4)%(Math.PI/2)+Math.PI/2)%(Math.PI/2)-Math.PI/4;
  scale=Math.hypot(b[1][0]-b[0][0],b[1][1]-b[0][1])/Math.hypot(a[1][0]-a[0][0],a[1][1]-a[0][1]);
 }else if(!square&&a.length>20&&b.length>20){
  const pw=prev.box[2]-prev.box[0],ph=prev.box[3]-prev.box[1],w=r.box[2]-r.box[0],h=r.box[3]-r.box[1];
  if(Math.abs(pw/ph-1)<.015&&Math.abs(w/h-1)<.015){scale=(w+h)/(pw+ph);angle=Math.atan2(b[0][1]-t[1],b[0][0]-t[0])-Math.atan2(a[0][1]-c[1],a[0][0]-c[0]);angle=((angle+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI}
  else if(r.motion)return r.motion;
 }
 return{a:angle,s:scale,c,t};
}
function trPlan(e){const n=+e.page,m=bookVectors[e.vectorPage],rs=m.paths,ink=rs.filter(r=>!trWhite(r));let groups=[],kind='';
 if([69,71,104,105,106,107,184].includes(n)){
  const square=[105,106,107,184].includes(n),objects=ink.filter(r=>r.s.length&&(r.box[2]-r.box[0]>5)&&(r.box[3]-r.box[1]>5)&&(!square||(!r.d.includes('C')&&trVertices(r).length>=4&&trVertices(r).length<=5)));if(!objects.length)return null;
  // PDF paint order puts the dark seed last; display it before generating the copies.
  const unique=[];for(const r of objects){const i=unique.findIndex(x=>x.d===r.d);if(i<0)unique.push(r);else if(Math.max(...r.s)<.1)unique[i]=r}
  const seed=unique.findIndex(r=>Math.max(...r.s)<.1);if(seed>0)unique.unshift(...unique.splice(seed,1));
  groups=unique.map((r,i)=>trGroup([r],i?'similarity':'seed',{motion:i?trSimilarity(unique[i-1],r,square):null,previous:unique[Math.max(0,i-1)]}));kind='similarity';
 }else if([42,43,44,111,113].includes(n)){
  const clusters=[];for(const r of ink){if(n===42&&(m.sourceIndexes?.[rs.indexOf(r)]??rs.indexOf(r))>46)continue;const a=trAngle(r);if(a===null)continue;let g=clusters.find(x=>Math.abs(x.angle-a)<.2);if(!g){g={angle:a,rs:[]};clusters.push(g)}g.rs.push(r)}
  clusters.sort((a,b)=>a.angle-b.angle);const count={42:3,43:5,44:7,111:4,113:6}[n];if(n<45){const ordered=Array.from({length:count},(_,i)=>(360*i/count)%180).map(a=>clusters.reduce((best,g)=>Math.abs(g.angle-a)<Math.abs(best.angle-a)?g:best,clusters[0]));clusters.splice(0,clusters.length,...ordered)}
  if(n===111){const quads=[[],[],[],[]];for(const r of ink){const c=trCenter([r]);quads[(c[1]>m.h/2?2:0)+(c[0]>m.w/2?1:0)].push(r)}groups=quads.filter(x=>x.length).map((g,i)=>trGroup(g,'rotate',{angle:[30,120,210,300][i],center:[m.w/2,m.h/2]}))}else groups=clusters.filter(x=>x.rs.length>=3).slice(0,count).map((g,i)=>trGroup(g.rs,'rotate',{angle:n===111?[30,120,210,300][i]:n===113?30*i:360*i/count,center:n===113?[0,m.h/2]:[m.w/2,m.h/2]}));kind='rotationGroups';
 }else if(n===108){const lines=ink.filter(r=>trAngle(r)!==null),base=lines.filter(r=>Math.abs(trAngle(r))<.1),vertical=lines.filter(r=>Math.abs(trAngle(r)-90)<.1),white=rs.filter(trWhite),triangle=white.filter(r=>new Set(Array.from(r.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g),m=>m[1]+','+m[2])).size===3),backing=white.filter(r=>!triangle.includes(r));groups=[trGroup(base,'seed'),trGroup([...backing,...vertical],'rotate',{angle:90,center:trCenter(backing)}),trGroup(triangle,'mask')];kind='cornerMask';
 }else if(n===109){const horizontal=ink.filter(r=>{const a=trAngle(r);return a===null||Math.abs(a)<.1}),diagonal=ink.filter(r=>{const a=trAngle(r);return a!==null&&a>145&&a<160}),rest=ink.filter(r=>!horizontal.includes(r)&&!diagonal.includes(r));groups=[trGroup(horizontal,'seed'),trGroup(diagonal,'rotate',{angle:-Math.atan(.5)*180/Math.PI,center:[72.58,94.33]}),trGroup(rest,'seed')];kind='street';
 }else if([112,115].includes(n)){groups=[trGroup(rs,'wholeRotate',{angle:n===112?135:-90,flip:n===115,center:[m.w/2,m.h/2]})];kind='wholeRotate';
 }else if(n===118){
  // Zoom a complete ruled page. The PDF only retains lines inside the enlarged crop;
  // extending that same regular grid restores the standard page before enlargement.
  const horizontal=ink.filter(r=>Math.abs(r.box[3]-r.box[1])<.1).sort((a,b)=>a.box[1]-b.box[1]),vertical=ink.find(r=>Math.abs(r.box[2]-r.box[0])<.1),step=(horizontal.at(-1).box[1]-horizontal[0].box[1])/(horizontal.length-1),full=[];
  for(let i=0;i<27;i++){const r=horizontal[Math.min(i,horizontal.length-1)],y=i<horizontal.length?horizontal[i].box[1]:horizontal.at(-1).box[1]+(i-horizontal.length+1)*step;full.push({...r,clip:[],d:'M'+horizontal[0].box[0]+' '+y+' L'+(m.w*2.5)+' '+y})}
  if(vertical)full.push({...vertical,clip:[],d:'M'+vertical.box[0]+' '+vertical.box[1]+' L'+vertical.box[0]+' '+m.h*2.5});
  groups=[trGroup(full,'wholeScale',{sx:2.5,sy:2.5,center:[0,0]})];kind='wholeScale';
 }else if([119,121].includes(n)){groups=[trGroup(rs,'wholeScale',{sx:n===119?.5:1,sy:n===119?.5:1/40,center:trCenter(ink)})];kind='wholeScale';
 }else if(n===120){const buckets=[[],[],[],[]];for(const r of ink){const cx=(r.box[0]+r.box[2])/2,cy=(r.box[1]+r.box[3])/2;buckets[(cy>m.h/2?2:0)+(cx>m.w/2?1:0)].push(r)}groups=buckets.filter(g=>g.length).map(g=>trGroup(g,'placePage',{center:trCenter(g),from:[m.w/2,m.h/2]}));kind='pageGrid';
 }else if([122,123].includes(n)){
  let current=[];for(const r of rs){if((n===122&&r.box[0]>m.w*.9)||(r.f.length&&Math.min(...r.f)>.999&&r.d.includes('C')))continue;const w=r.box[2]-r.box[0],h=r.box[3]-r.box[1],newPage=r.f.length&&Math.min(...r.f)>.999&&!r.d.includes('C')&&w/h>.4&&w/h<.8&&h>65;if(newPage&&current.length){groups.push(trGroup(current,groups.length?'nestedPage':'seed',{ratio:n===122?.8:.7,rotation:n===123?180:0}));current=[]}current.push(r)}if(current.length)groups.push(trGroup(current,groups.length?'nestedPage':'seed',{ratio:n===122?.8:.7,rotation:n===123?180:0}));kind='nestedPage';
 }else if([124,125,126,127].includes(n)){
  const circles=[],base=[];for(const r of rs){const w=r.box[2]-r.box[0],h=r.box[3]-r.box[1];if(r.d.includes('C')&&w>1&&h>1&&Math.abs(w-h)<1){const c=trCenter([r]);let g=circles.find(g=>Math.abs(g.center[0]-c[0])<.08&&Math.abs(g.center[1]-c[1])<.08);if(!g){g={center:c,rs:[]};circles.push(g)}g.rs.push(r)}else base.push(r)}
  circles.sort((a,b)=>Math.abs(a.center[1]-b.center[1])>.5?a.center[1]-b.center[1]:a.center[0]-b.center[0]);groups=[trGroup(base,'seed'),...circles.map((g,i)=>trGroup(g.rs,'placeCircle',{center:g.center,previous:i?circles[i-1].center:g.center}))];kind='circleGrid';
 }else if([139,140,141].includes(n)){const circle=ink.reduce((a,b)=>a.d.length>b.d.length?a:b),chords=ink.filter(r=>r!==circle);groups=[trGroup([circle],'circle'),...chords.map((r,i)=>trGroup([r],'chord',{k:i+1,N:{139:12,140:24,141:72}[n]}))];kind='chords';
 }else if(n===116){groups=ink.map((r,i)=>trGroup([r],i?'reptile':'seed',{center:trCenter([r]),previous:i?trCenter([ink[i-1]]):trCenter([r]),angle:i%3*120}));kind='reptiles';
 }else return null;
 if(!groups.length)return null;if(kind==='nestedPage')groups.forEach((g,i)=>{g.center=trCenter(g.rs);g.previous=i?trCenter(groups[i-1].rs):g.center});const initial=kind==='rotationGroups'&&n<45?1:undefined,covered=new Set(groups.flatMap(g=>g.rs)),base=n>=42&&n<=44?rs.filter(r=>!covered.has(r)):[];return{groups,kind,n,m,final:rs,initial,base};
}
function trTransform(group,f,plan){const c=group.center||trCenter(group.rs),center=c.join(' ');let t='';
 if(group.mode==='similarity'&&group.motion){const a=group.motion,sp=1+f*(a.s-1),scale=sp/a.s,co=Math.cos(a.a),si=Math.sin(a.a),u=1-a.s*co,v=a.s*si,den=u*u+v*v;let cx=a.c[0]+f*(a.t[0]-a.c[0]),cy=a.c[1]+f*(a.t[1]-a.c[1]);if(den>1e-10){const bx=a.t[0]-a.s*(co*a.c[0]-si*a.c[1]),by=a.t[1]-a.s*(si*a.c[0]+co*a.c[1]),ox=(u*bx-v*by)/den,oy=(v*bx+u*by)/den,dx=a.c[0]-ox,dy=a.c[1]-oy,cf=Math.cos(f*a.a),sf=Math.sin(f*a.a);cx=ox+sp*(cf*dx-sf*dy);cy=oy+sp*(sf*dx+cf*dy)}t='translate('+cx+' '+cy+') rotate('+((f-1)*a.a*180/Math.PI)+') scale('+scale+') translate('+(-a.t[0])+' '+(-a.t[1])+')'}
 else if(group.mode==='rotate'||group.mode==='wholeRotate'){let angle=(f-1)*group.angle,flip=1;if(group.flip){flip=f<.4?-1+2*f/.4:1;angle=f<.4?-group.angle:(1-(f-.4)/.6)*(-group.angle)}t='translate('+center+') rotate('+angle+') scale('+flip+' 1) translate('+(-c[0])+' '+(-c[1])+')'}
 else if(group.mode==='wholeScale'){const sx=(1+f*(group.sx-1))/group.sx,sy=(1+f*(group.sy-1))/group.sy;t='translate('+center+') scale('+sx+' '+sy+') translate('+(-c[0])+' '+(-c[1])+')'}
 else if(group.mode==='placePage'){const cx=group.from[0]*(1-f)+c[0]*f,cy=group.from[1]*(1-f)+c[1]*f;t='translate('+cx+' '+cy+') scale('+(2-f)+') translate('+(-c[0])+' '+(-c[1])+')'}
 else if(group.mode==='nestedPage'){const ratio=group.ratio,scale=(1+f*(ratio-1))/ratio,from=group.previous||c,cx=from[0]+f*(c[0]-from[0]),cy=from[1]+f*(c[1]-from[1]);t='translate('+cx+' '+cy+') rotate('+((f-1)*group.rotation)+') scale('+scale+') translate('+(-c[0])+' '+(-c[1])+')'}
 else if(group.mode==='placeCircle'||group.mode==='reptile'){const prev=group.previous;t='translate('+((prev[0]-c[0])*(1-f))+' '+((prev[1]-c[1])*(1-f))+')';if(group.mode==='reptile')t+=' rotate('+(-(1-f)*120)+' '+c.join(' ')+')'}
 return t;
}

// V11: preserve original source identities when cleanup removes text masks.
function trSourceRows(m){return m.paths.map((r,i)=>({r,old:m.sourceIndexes?.[i]??i})).sort((a,b)=>a.old-b.old)}
function trN(x,d=3){return Number(x.toFixed(d)).toString()}
function trResult(tex,values,detail){return{readout:values,live:{tex,values,detail},equationDriven:true}}
function trInit(e,ghost,guide,fullPage=false){const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key||(fullPage&&!vectorState._trFullFrame)){startVector(fullPage?{...e,chapter:'第1章'}:e,ghost,guide);if(fullPage)vectorState._trFullFrame=true}return vectorState}
function trPut(st,done,active='',point=''){ $('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=point;st.done=0 }
function trRecords(st,rs){return rs.map(r=>vectorPath(r,st.prefix)).join('')}
function trBookCorners(e,p,ghost,guide){
 const st=trInit(e,ghost,guide),m=st.m,C=[m.w/2,m.h/2],angles=[30,120,210,300];
 if(!st.trCorners){const rows=trSourceRows(m),ranges=[[1,52],[53,86],[87,135],[136,169]];st.trCorners={base:rows.filter(x=>x.old===0).map(x=>x.r),groups:ranges.map(([a,b])=>rows.filter(x=>x.old>=a&&x.old<=b).map(x=>x.r))}}
 const model=st.trCorners,v=Math.min(1-1e-12,Math.max(0,p))*4,k=Math.floor(v),q=v-k,angle=angles[k]*q,done=trRecords(st,model.base)+model.groups.slice(0,k).map(rs=>trRecords(st,rs)).join('');
 if(p>=1)trPut(st,trRecords(st,model.base)+model.groups.map(rs=>trRecords(st,rs)).join(''));
 else trPut(st,done,'<g transform="rotate('+((q-1)*angles[k])+' '+C.join(' ')+')">'+trRecords(st,model.groups[k])+'</g>',guide?dot(C,gold,3/st.scale):'');
 return trResult('P_\\alpha=C+R_\\alpha(P_0-C),\\quad R_\\alpha=\\begin{pmatrix}\\cos\\alpha&-\\sin\\alpha\\\\\\sin\\alpha&\\cos\\alpha\\end{pmatrix}', '第 '+(k+1)+' / 4 组 · α = '+trN(p>=1?angles[3]:angle,2)+'° · 目标角 '+angles[k]+'° · C = ('+C.map(x=>trN(x)).join(', ')+')','采用图案坐标（X向右、Y向下），正角按原书文字顺时针旋转。四组及各自的黑色参考线都按同一实际角度运动，终点就是原书图案。');
}
function trSquareVertices(k,C=[207,297.64]){const a=k*Math.PI/36,L=14.4+1.8*k,u=[Math.sin(a),-Math.cos(a)],v=[-Math.cos(a),-Math.sin(a)];return[C,[C[0]+L*u[0],C[1]+L*u[1]],[C[0]+L*(u[0]+v[0]),C[1]+L*(u[1]+v[1])],[C[0]+L*v[0],C[1]+L*v[1]],C]}
function trSpiralSquarePlan(st){const rows=trSourceRows(st.m),C=[207,297.64],groups=[];let group=[];for(const x of rows){if(x.old>885)continue;const P=trVertices(x.r);group.push(x.r);if(x.r.d.endsWith('Z')||Math.hypot(P.at(-1)[0]-C[0],P.at(-1)[1]-C[1])<.02){groups.push(group);group=[]}}if(group.length)groups.push(group);return{C,groups,anchor:rows.filter(x=>x.old===886||x.old===887).map(x=>x.r),r:groups[0][0]}}
function trSpiralSquares(e,p,ghost,guide){
 const st=trInit(e,ghost,guide),m=st.trSpiral||(st.trSpiral=trSpiralSquarePlan(st)),N=m.groups.length,v=Math.max(0,Math.min(1,p))*(N-1),i=Math.floor(v),P=trSquareVertices(v,m.C),done=m.groups.slice(0,i+1).map(rs=>trRecords(st,rs)).join('');
 if(p>=1)trPut(st,m.groups.map(rs=>trRecords(st,rs)).join('')+trRecords(st,m.anchor));
 else trPut(st,done,vectorPath({...m.r,d:path(P),clip:[]},st.prefix),trRecords(st,m.anchor)+(guide?dot(P[1],red,2.5/st.scale):''));
 return trResult('\\begin{gathered}L(t)=14.4+1.8t,\\quad\\alpha(t)=5t^\\circ\\\\P_j(t)=C+L(t)R_{\\alpha(t)}V_j,\\quad V_j\\in\\{(0,0),(0,-1),(-1,-1),(-1,0)\\}\\end{gathered}','t = '+trN(v,3)+' · α = '+trN(v*5,2)+'° · L = '+trN(14.4+1.8*v)+' · 已保留 '+(i+1)+' / '+N+' 个正方形','所有正方形绕同一个原书顶点 C=(207,297.64) 连续旋转、放大；超出页面的部分由页面边界自然裁切，裁开的各段仍属于同一个方形。');
}
function trCompression(e,p,ghost,guide){
 const st=trInit(e,ghost,guide,true);if(!st.trCompression){const rows=trSourceRows(st.m),lines=rows.filter(x=>x.r.s.length&&Math.max(...x.r.s)>.1&&Math.abs(x.r.box[3]-x.r.box[1])<.02).map(x=>x.r),ys=lines.map(r=>r.box[1]),C=(Math.min(...ys)+Math.max(...ys))/2;st.trCompression={rows:rows.filter(x=>x.old<=26).map(x=>x.r),C,gap:(Math.max(...ys)-Math.min(...ys))/(lines.length-1),count:lines.length}}
 const m=st.trCompression,sy=Math.pow(40,-Math.max(0,Math.min(1,p))),factor=40*sy,svg=m.rows.map(r=>{const P=trVertices(r).map(([x,y])=>[x,m.C+factor*(y-m.C)]);return vectorPath({...r,d:path(P)},st.prefix)}).join('');trPut(st,p>=1?trRecords(st,m.rows):svg);
 return trResult('\\begin{aligned}X_j(s)&=X_j^{(0)}\\\\Y_j(s)&=Y_c+s\\bigl(Y_j^{(0)}-Y_c\\bigr),\\quad 1\\ge s\\ge\\tfrac1{40}\\\\\\Delta Y(s)&=s\\,\\Delta Y_0\\end{aligned}','s = '+trN(sy,5)+' · 当前线距 ΔY = '+trN(factor*m.gap,4)+' · '+m.count+' 条横线 · 线宽固定','横线的实际间距不断缩小，线宽保持不变，因此密度逐渐增加，最后自然汇成原书的灰色窄带。');
}
function trChordPlan(st,n){
 const N={139:12,140:24,141:72}[n],rows=trSourceRows(st.m),circle=rows.find(x=>x.old===N)?.r||st.m.paths.reduce((a,b)=>a.d.length>b.d.length?a:b),edges=rows.filter(x=>x.old<N).map(x=>{const P=trVertices(x.r);return{r:x.r,k:x.old+1,target:((2*(x.old+1)-1)%N)+1,A:P[0],B:P.at(-1)}}),byK=new Map(edges.map(e=>[e.k,e])),visited=new Set(),trails=[];
 for(let start=1;start<=N;start++){if(visited.has(start))continue;let k=start,trail=[];while(!visited.has(k)&&byK.has(k)){const e=byK.get(k);visited.add(k);trail.push(e);k=e.target}if(trail.length)trails.push(trail)}
 const events=[];let last=null;trails.forEach((trail,j)=>{const visible=trail.filter(e=>Math.hypot(e.B[0]-e.A[0],e.B[1]-e.A[1])>.02);if(!visible.length)return;const A=visible[0].A;if(last&&Math.hypot(last[0]-A[0],last[1]-A[1])>.02)events.push({lift:true,A:last,B:A,k:visible[0].k,trail:j+1,weight:.32});for(const e of visible){events.push({...e,trail:j+1,weight:1});last=e.B}});
 let total=0;events.forEach(e=>{e.start=total;total+=e.weight});const C=[0,1].map(k=>edges.reduce((s,e)=>s+e.A[k],0)/N),R=edges.reduce((s,e)=>s+Math.hypot(e.A[0]-C[0],e.A[1]-C[1]),0)/N;
 return{N,circle,edges,events,total,C,R,trails};
}
function trThreadChords(e,p,ghost,guide){
 const st=trInit(e,ghost,guide),m=st.trChords||(st.trChords=trChordPlan(st,+e.page)),circleEnd=.12;let done='',active='',help='',live;
 const marks=()=>m.edges.map(a=>dot(a.A,'#7a9a89',1.6/st.scale)+(guide&&m.N<=24?'<text x="'+(m.C[0]+(m.R+12)*Math.cos(-2*Math.PI*(a.k-1)/m.N))+'" y="'+(m.C[1]+(m.R+12)*Math.sin(-2*Math.PI*(a.k-1)/m.N))+'" font-size="9" fill="'+gold+'">'+a.k+'</text>':'')).join('');
 if(p>=1){trPut(st,trRecords(st,st.m.paths));return trResult('P_k\\longrightarrow P_{2k\\bmod N},\\qquad P_{j+N}=P_j','N = '+m.N+' · '+m.trails.length+' 条连接链全部完成','每条链从上一根线的终点继续；只有已无未画出边时才抬笔，全部原书线段和圆周已完成。')}
 if(p<circleEnd){const theta=-2*Math.PI*Math.max(0,p)/circleEnd,count=Math.max(1,Math.ceil(Math.abs(theta)*90)),P=Array.from({length:count+1},(_,i)=>[m.C[0]+m.R*Math.cos(theta*i/count),m.C[1]+m.R*Math.sin(theta*i/count)]);active=vectorPath({...m.circle,d:path(P)},st.prefix);help=dot(P.at(-1),red,3/st.scale);live=trResult('\\binom{X}{Y}=C+r\\binom{\\cos\\theta}{\\sin\\theta}', '先画圆 · θ = '+trN(theta,4)+' rad · r = '+trN(m.R)+' · C = ('+m.C.map(x=>trN(x)).join(', ')+')','从最右端开始逆时针生成圆周，随后按原书编号连续连接。')}
 else{const v=(p-circleEnd)/(1-circleEnd)*m.total,i=Math.min(m.events.length-1,m.events.findIndex(x=>v<x.start+x.weight)),event=m.events[i],q=(v-event.start)/event.weight,Q=event.A.map((a,k)=>a+q*(event.B[k]-a));done=vectorPath(m.circle,st.prefix)+m.events.slice(0,i).filter(x=>!x.lift).map(x=>vectorPath(x.r,st.prefix)).join('');help=marks()+dot(Q,red,3/st.scale);
  if(event.lift){if(guide)help+=line([event.A,event.B],gold,.8/st.scale,'stroke-dasharray="4 5"');live=trResult('P(u)=(1-u)A+uB,\\qquad0\\le u\\le1','本链已完成 · 抬笔至 '+event.k+' 号点 · u = '+trN(q,4),'仅移动笔尖，不留下连线；到达新链起点后继续按 k→2k 的规则。')}
  else{active=vectorPath({...event.r,d:path([event.A,Q])},st.prefix);live=trResult('\\begin{gathered}j=2k\\bmod N\\quad(0\\text{记为}N)\\\\P(u)=(1-u)P_k+uP_j,\\quad0\\le u\\le1\\end{gathered}', '第 '+event.trail+' 条链 · '+event.k+' → '+event.target+' · u = '+trN(q,4)+' · P = ('+Q.map(x=>trN(x)).join(', ')+')','当前线段从上一根线的终点继续，端点与参数u同步；一条链结束后才抬笔。')}
 }
 trPut(st,done,active,help);return live;
}

function transformationUpdate(e,p,ghost,guide){
 if(+e.page===111)return trBookCorners(e,p,ghost,guide);
 if(+e.page===107)return trSpiralSquares(e,p,ghost,guide);
 if(+e.page===121)return trCompression(e,p,ghost,guide);
 if([139,140,141].includes(+e.page))return trThreadChords(e,p,ghost,guide);
 const n=+e.page;if(![42,43,44,69,71,104,105,106,107,108,109,111,112,113,115,116,118,119,120,121,122,123,124,125,126,127,139,140,141,184].includes(n))return null;
 const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);const st=vectorState;
 if(!st.transformPlan)st.transformPlan=trPlan(e);const plan=st.transformPlan;if(!plan)return null;
 const {groups,kind}=plan,initial=plan.initial??(['similarity','nestedPage','reptiles','circleGrid','cornerMask','street'].includes(kind)?1:0);let v=p*(groups.length-initial),done=Math.min(groups.length,Math.floor(v)+initial),f=v-Math.floor(v);
 if(p===1){$('#vDone').innerHTML=plan.final.map(r=>vectorPath(r,st.prefix)).join('');$('#vActive').innerHTML='';$('#vPoint').innerHTML='';st.transformDone=-1;return{readout:kind==='chords'?'k → 2k（模 '+groups.at(-1).N+'）· 全部连线完成':kind==='circleGrid'?'按 '+({124:15,125:20,126:33,127:42}[n])+' 列排列 · 镶嵌完成':kind==='wholeScale'?'比例 '+groups[0].sx+' × '+groups[0].sy+' · 缩放完成':'构造完成 · 原书全部图案与补充线'}}
 if(st.transformDone===undefined||st.transformDone<0||done<st.transformDone){$('#vDone').innerHTML=trRecords(st,plan.base||[]);st.transformDone=0}if(done>st.transformDone){$('#vDone').insertAdjacentHTML('beforeend',groups.slice(st.transformDone,done).map(g=>g.rs.map(r=>vectorPath(r,st.prefix)).join('')).join(''));st.transformDone=done}
 const g=groups[done];let active='',point='',readout='';if(g){const transform=trTransform(g,f,plan);active='<g'+(transform?' transform="'+transform+'"':'')+'>'+g.rs.map(r=>vectorPath(r,st.prefix,(g.mode==='circle'||g.mode==='chord'||g.mode==='mask')?f:1)).join('')+'</g>'}
 if(kind==='chords'){const N={139:12,140:24,141:72}[n],circle=groups[0].rs[0],c=trCenter([circle]),R=(circle.box[2]-circle.box[0])/2;if(done>0){for(let k=0;k<N;k++){const a=-k*2*Math.PI/N,pt=[c[0]+R*Math.cos(a),c[1]+R*Math.sin(a)];point+=dot(pt,k===((done-1)%N)?gold:'#7a9a89',1.8/st.scale);if(guide&&N<=24)point+='<text x="'+(c[0]+(R+11)*Math.cos(a))+'" y="'+(c[1]+(R+11)*Math.sin(a))+'" font-size="9" fill="'+gold+'">'+(k+1)+'</text>'}const k=Math.min(N,done),target=((2*k-1)%N)+1;readout='每隔 '+(360/N)+'° 标记 · k = '+k+' → '+target+'（2k 模 '+N+'）'}else readout='先画圆 · 再作 '+N+' 个等距标记'}
 else if(kind==='cornerMask')readout=done<2?'左上角旋转 θ = '+(90*f).toFixed(1)+'°':'用白色直角三角形遮挡左上角';
 else if(kind==='street')readout='保留右侧水平线 · 左侧旋转 Δθ = '+(-Math.atan(.5)*180/Math.PI*(done===1?f:1)).toFixed(2)+'°';
 else if(kind==='wholeScale'){const a=groups[0];readout='水平比例 = '+(1+p*(a.sx-1)).toFixed(3)+' · 垂直比例 = '+(1+p*(a.sy-1)).toFixed(3)}
 else if(kind==='wholeRotate')readout=(groups[0].flip&&p<.4?'先翻转 · ':'旋转 θ = ')+(groups[0].angle*(groups[0].flip?Math.max(0,(p-.4)/.6):p)).toFixed(1)+'°';
 else if(kind==='pageGrid')readout='缩放至 1/2 · 第 '+Math.min(4,done+1)+' / 4 页 · 排列成 2 × 2';
 else if(kind==='nestedPage'){const ratio=n===122?.8:.7;readout='第 '+done+' 次 · 缩放比例 '+Math.pow(ratio,done).toFixed(4)+(n===123?' · 每次旋转180°，置于左上角':' · 居中放置')}
 else if(kind==='circleGrid')readout='共 '+({124:15,125:20,126:33,127:42}[n])+' 列圆 · 已放置 '+Math.max(0,done-1)+' / '+(groups.length-1)+' 个圆';
 else if(kind==='rotationGroups')readout='第 '+Math.min(groups.length,done+1)+' / '+groups.length+' 组 · 旋转 θ = '+((g?.angle||0)*f).toFixed(1)+'°';
 else if(kind==='reptiles')readout='旋转120°并平移复制 · 第 '+done+' / '+groups.length+' 个爬行动物';
 else {const angle=(g?.motion?.a||0)*180/Math.PI;readout=(n===105?'圆轨道半径0.3英寸 · ':n===106?'圆轨道半径1.2英寸 · ':n===184?'每步缩小至90% · ':'')+'第 '+done+' / '+groups.length+' 个副本 · Δθ = '+(angle*f).toFixed(1)+'° · s = '+(1+f*((g?.motion?.s||1)-1)).toFixed(3)}
 $('#vActive').innerHTML=active;$('#vPoint').innerHTML=point;return{readout};
}
