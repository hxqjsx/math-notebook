// P172: horizontal construction, the printed analytic reference, then whole-line
// deformation. The PDF contains 11,700 white paint slivers; none is animated.
// The book does not prescribe a unique displacement law for each horizontal.
// Mc is the printed contour, calibrated as a function of x; lambda explains the
// deformation continuously without claiming that every row is c + f(x).
function emN(x,n=3){return Number(Number(x).toFixed(n)).toString()}
function emPoints(r){return Array.from(r.d.matchAll(/[ML]([-\d.]+)[ ,]+([-\d.]+)/g),m=>[+m[1],+m[2]])}
function emF(x){return Math.exp(.2*x)*Math.sin(-2*x)+Math.sin(-3*x)}
function emInit(e,ghost,guide){
 if(!vectorState||vectorState.key!==e.id+ghost+guide)startVector(e,ghost,guide);const st=vectorState;
 if(st.emPlan)return st;
 const source=id=>{const i=st.m.sourceIndexes?.indexOf(id);return i>=0?st.m.paths[i]:st.m.paths[id]},ids=[...Array.from({length:16},(_,i)=>i),18,21,24,27,32,33,11730,11731,11732,11733],sy=(source(0).box[1]-source(15).box[1])/(15*.28),y0=source(0).box[1]+sy*.28;
 const rows=ids.map((id,i)=>{const r=source(id),P=emPoints(r),base=P[0][1];return{r,c:.28*(i+1),base,P:P.slice().sort((a,b)=>a[0]-b[0]),curved:P.length>2}}),melt=rows.filter(r=>r.curved),aux=source(11734);
 st.emPlan={rows,melt,aux,sy,y0,refY:272.61,x0:.62,sx:72,final:null};return st;
}
function emValue(row,X){const P=row.P;if(X<=P[0][0])return P[0][1];if(X>=P.at(-1)[0])return P.at(-1)[1];let lo=0,hi=P.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(P[m][0]<X)lo=m;else hi=m}const A=P[lo],B=P[hi],q=(X-A[0])/(B[0]-A[0]);return A[1]+q*(B[1]-A[1])}
function emRow(st,row,lambda=0,fraction=1){
 const a=st.emPlan,left=0,right=Math.min(st.m.w,396.5),end=left+(right-left)*fraction,N=lambda===0||!row.curved?1:Math.max(1,Math.ceil((end-left)/.35)),P=Array.from({length:N+1},(_,i)=>{const X=left+(end-left)*i/N;return[X,row.base+lambda*(emValue(row,X)-row.base)]});
 return{P,svg:vectorPath({...row.r,d:path(P),clip:[]},st.prefix)};
}
function emDeformed(st,count,lambda=1){const a=st.emPlan;let out=a.rows.map(row=>emRow(st,row).svg).join('');
 for(let i=0;i<count;i++){const row=a.melt[i],q=i===count-1?lambda:1,{P,svg}=emRow(st,row,q),top=row.base-20.08,region=[...P,[P.at(-1)[0],top],[P[0][0],top]];out+='<path d="'+path(region)+' Z" fill="'+paper+'" fill-rule="evenodd"/>'+svg}
 // Printed straight rows above the deformed band stay visible after overpainting.
 out+=a.rows.slice(22).map(row=>emRow(st,row).svg).join('');return out;
}
function eqMeltingUpdate(e,p,ghost,guide){
 if(+e.page!==172)return null;const st=emInit(e,ghost,guide),a=st.emPlan;let done='',active='',mark='',live,readout;
 if(p<.30){const v=p/.30*a.rows.length,i=Math.min(a.rows.length-1,Math.floor(v)),q=v-i,row=a.rows[i],part=emRow(st,row,0,q),P=part.P.at(-1),x=(P[0]-a.x0)/a.sx;
  done=a.rows.slice(0,i).map(row=>emRow(st,row).svg).join('');active=part.svg;mark=dot(P,red,2.5/st.scale);live={tex:'y=c,\\qquad x=t',values:'c = '+emN(row.c)+' · x = '+emN(x)+' · y = '+emN(row.c),detail:'第一步：取不同的 c，先生成完整水平线；x 决定当前画笔的位置。',point:P};readout='先画 y=c · 第 '+(i+1)+' / 26 条';
 }else if(p<.47){const q=(p-.30)/.17,x=-4.5+4.5*q,N=Math.max(1,Math.ceil(q*1800)),P=Array.from({length:N+1},(_,i)=>{const t=-4.5+(x+4.5)*i/N;return[324.62+72*t,a.refY-36*emF(t)]});
  done=a.rows.map(row=>emRow(st,row).svg).join('');active=line(P,gold,1.2/st.scale);mark=dot(P.at(-1),red,2.6/st.scale);live={tex:'f(x)=e^{0.2x}\\sin(-2x)+\\sin(-3x)',values:'x = '+emN(x)+' · f(x) = '+emN(emF(x)),detail:'第二步：按书中公式计算参考轮廓。金色曲线仅帮助观察函数起伏；原书未规定各行采用同一个位移量。',point:P.at(-1)};readout='生成书中函数轮廓 · x 连续变化';
 }else if(p<.96){const v=(p-.47)/.49*a.melt.length,i=Math.min(a.melt.length-1,Math.floor(v)),lambda=v-i,row=a.melt[i];done=emDeformed(st,i+1,lambda);
  const X=324.62-160*lambda,Y=row.base+lambda*(emValue(row,X)-row.base),x=(X-a.x0)/a.sx,Mc=(a.y0-emValue(row,X))/a.sy,y=(a.y0-Y)/a.sy;mark=guide?dot([X,Y],red,2.6/st.scale):'';
  live={tex:'y(x;\\lambda)=(1-\\lambda)c+\\lambda M_c(x),\\quad0\\le\\lambda\\le1',values:'c = '+emN(row.c)+' · λ = '+emN(lambda,4)+' · x = '+emN(x)+' · M꜀(x) = '+emN(Mc)+' · y = '+emN(y),detail:'第 '+(i+1)+' / 6 条融化线。M꜀(x) 为原书此行的完整轮廓；λ 连续改变整条曲线。原书仅给参考函数，未指定逐行位移公式，此处保留图示。',point:[X,Y]};readout='整条线连续变形 · 第 '+(i+1)+' / 6 条 · λ = '+emN(lambda);
 }else{const q=Math.min(1,(p-.96)/.04),P=emPoints(a.aux),A=P[0],B=P.at(-1),Q=[A[0]+q*(B[0]-A[0]),A[1]+q*(B[1]-A[1])];done=emDeformed(st,6);active=vectorPath({...a.aux,d:path([A,Q]),clip:[]},st.prefix);mark=dot(Q,red,2.5/st.scale);live={tex:'x=4.5,\\qquad y=t',values:'x = 4.5 · y = '+emN((a.y0-Q[1])/a.sy),detail:'自动补充原书竖线，随后显示原书完整线条与交叠关系。',point:Q};readout='自动补齐原书竖线';
  if(p>=1){if(!a.final)a.final=st.m.paths.map(r=>vectorPath(r,st.prefix)).join('');done=a.final;active=mark='';readout='原书完整图案已完成'}
 }
 $('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=mark;
 return{readout,live,numericConstruction:true};
}
