// The current parameter, tip and drawn prefix are evaluated together. No reveal
// mask is used: a self-intersection must never expose a later part of a curve.
const equationSourceCache=new WeakMap();
function eqNum(x,n=3){return Number.isFinite(x)?Number(x.toFixed(n)).toString().replace('-','−'):'—'}
function eqPointText(p){return '('+p.map(x=>eqNum(x)).join(', ')+')'}
function eqPathNumber(x){return Number(x.toFixed(4))}
function equationSourceModel(r){
 if(equationSourceCache.has(r))return equationSourceCache.get(r);
 let parts=r.playParts;
 if(!parts){parts=[];const tok=r.d.match(/[MLCZ]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g)||[];let i=0,P=[],last=[0,0],start=last;
  const point=()=>[+tok[i++],+tok[i++]];
  while(i<tok.length){const op=tok[i++];if(op==='M'){if(P.length>1)parts.push(P);last=point();start=last;P=[last]}else if(op==='L'){last=point();P.push(last)}else if(op==='C'){const a=last,b=point(),c=point(),d=point(),N=Math.max(16,Math.min(256,Math.ceil((Math.hypot(b[0]-a[0],b[1]-a[1])+Math.hypot(c[0]-b[0],c[1]-b[1])+Math.hypot(d[0]-c[0],d[1]-c[1]))/2)));for(let k=1;k<=N;k++){const t=k/N,u=1-t;P.push([u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]])}last=d}else if(op==='Z'){P.push(start);last=start}else break}
  if(P.length>1)parts.push(P);
 }
 const segments=[];let total=0;
 for(const P of parts)for(let i=1;i<P.length;i++){const A=P[i-1],B=P[i],length=Math.hypot(B[0]-A[0],B[1]-A[1]);if(length>1e-10){segments.push({A,B,length,start:total,move:i===1});total+=length}}
 const model={segments,total};equationSourceCache.set(r,model);return model;
}
function equationSourcePrefix(r,f){
 const model=equationSourceModel(r),v=Math.max(0,Math.min(1,f))*model.total;let d='',point=model.segments[0]?.A||[0,0],current=model.segments[0],u=0;
 for(const s of model.segments){if(s.start>v)break;if(s.move)d+=' M'+s.A.map(eqPathNumber).join(' ');u=Math.max(0,Math.min(1,(v-s.start)/s.length));point=s.A.map((x,k)=>x+(s.B[k]-x)*u);d+=' L'+point.map(eqPathNumber).join(' ');current=s;if(u<1)break}
 return{d:d.trim(),point,current,u,total:model.total};
}
function eqClipSegment(A,B,w,h){let lo=0,hi=1,dx=B[0]-A[0],dy=B[1]-A[1];for(const[p,q]of[[-dx,A[0]],[dx,w-A[0]],[-dy,A[1]],[dy,h-A[1]]]){if(Math.abs(p)<1e-12){if(q<0)return null}else{const z=q/p;if(p<0)lo=Math.max(lo,z);else hi=Math.min(hi,z);if(lo>hi)return null}}return[lo,hi]}
function eqPrepareCurve(c,m){
 if(c._eq)return c._eq;const N=Math.max(100,Math.min(100000,c.count||1600)),points=[],intervals=[];
 for(let i=0;i<=N;i++){const t=c.t0+(c.t1-c.t0)*i/N,q=c.eval(t);points.push({t,q})}
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if(!a.q?.every(Number.isFinite)||!b.q?.every(Number.isFinite))continue;const clip=eqClipSegment(a.q,b.q,m.w,m.h);if(!clip)continue;const lo=(i-1+clip[0])/N,hi=(i-1+clip[1])/N;if(hi-lo<1e-10)continue;if(intervals.length&&lo<=intervals.at(-1)[1]+1e-8)intervals.at(-1)[1]=hi;else intervals.push([lo,hi])}
 const span=intervals.reduce((s,[a,b])=>s+b-a,0);return c._eq={N,points,intervals,span};
}
function eqVisibleFraction(model,f){if(!model.span)return Math.max(0,Math.min(1,f));let remain=Math.max(0,Math.min(1,f))*model.span;for(const[a,b]of model.intervals){if(remain<=b-a)return a+remain;remain-=b-a}return model.intervals.at(-1)[1]}
function eqCurvePrefix(c,model,f,m){
 const q=eqVisibleFraction(model,f),t=c.t0+(c.t1-c.t0)*q,last=c.eval(t),count=Math.min(model.N,Math.floor(q*model.N)),points=model.points.slice(0,count+1).map(x=>x.q);if(q*model.N>count+1e-10)points.push(last);else if(points.length)points[points.length-1]=last;
 let d='',previous=null;for(let i=1;i<points.length;i++){const A=points[i-1],B=points[i];if(!A?.every(Number.isFinite)||!B?.every(Number.isFinite)){previous=null;continue}const clip=eqClipSegment(A,B,m.w,m.h);if(!clip){previous=null;continue}const X=A.map((v,k)=>v+(B[k]-v)*clip[0]),Y=A.map((v,k)=>v+(B[k]-v)*clip[1]);if(!previous||Math.hypot(X[0]-previous[0],X[1]-previous[1])>.02)d+=' M'+X.map(eqPathNumber).join(' ');d+=' L'+Y.map(eqPathNumber).join(' ');previous=clip[1]<1?null:Y}
 return{d:d.trim(),t,point:last,math:c.math?c.math(t):null};
}
function eqCurveSVG(c,d,st){return vectorPath({...c.r,d,playParts:undefined,playLengths:undefined,f:[],clip:c.r.clip||[]},st.prefix)}
function eqCurveLive(e,c,trace,n,N){
 const variable=c.variable||'t',base=typeof c.params==='function'?c.params(trace.t):c.params||'',tex=typeof c.tex==='function'?c.tex(trace.t):c.tex||e.tex;
 const xy=trace.math?(variable==='x'?' · y = '+eqNum(trace.math[1]):variable==='y'?' · x = '+eqNum(trace.math[0]):' · x = '+eqNum(trace.math[0])+'，y = '+eqNum(trace.math[1])):'';
 return{tex,values:(base?base+' · ':'')+variable+' = '+eqNum(trace.t,4)+xy,detail:'第 '+(n+1)+' / '+N+' 条曲线；'+variable+' 从 '+eqNum(c.t0,4)+' 到 '+eqNum(c.t1,4)+'。红点为方程中的当前点 (x,y)。'};
}
function eqRun(e,p,ghost,guide,plan){
 const st=vectorState,m=st.m;if(!plan._prepared){plan.curves=plan.curves.filter(c=>eqPrepareCurve(c,m).span>1e-10);plan._prepared=true;plan._complete=[];for(const c of plan.curves){const full=eqCurvePrefix(c,c._eq,1,m);plan._complete.push(eqCurveSVG(c,full.d,st))}}
 const curves=plan.curves,refs=plan.refs||[],N=curves.length;if(!N)return null;
 const end=plan.mainEnd??(refs.length ? .92 : 1);let done=null,doneKey='',active='',tip='',live;
 if(p>=1){$('#vDone').innerHTML=(plan.finalPaths||m.paths).map(r=>vectorPath(r,st.prefix)).join('');$('#vActive').innerHTML='';$('#vPoint').innerHTML='';st.done=m.paths.length;st._eqDoneKey='final';const c=curves.at(-1),trace=eqCurvePrefix(c,c._eq,1,m);live=eqCurveLive(e,c,trace,N-1,N);live.detail='方程轨迹与原书补充线已完成。';return{readout:'已完成 · 方程与参数同步',live,equationDriven:true}}
 if(p<end){const v=p/end*N,i=Math.min(N-1,Math.floor(v)),f=v-i,c=curves[i],trace=eqCurvePrefix(c,c._eq,f,m);doneKey='curve'+i;if(st._eqDoneKey!==doneKey)done=plan._complete.slice(0,i).join('');active=eqCurveSVG(c,trace.d,st);if(trace.point?.every(Number.isFinite))tip=dot(trace.point,red,3.2/st.scale);live=eqCurveLive(e,c,trace,i,N);if(plan.note)live.detail+=' '+plan.note}
 else{const v=(p-end)/(1-end)*refs.length,i=Math.min(refs.length-1,Math.floor(v)),f=v-i;doneKey='ref'+i;if(st._eqDoneKey!==doneKey)done=plan._complete.join('')+refs.slice(0,i).map(r=>vectorPath(r,st.prefix)).join('');const r=refs[i];if(r){active=vectorPath(r,st.prefix,f);const a=equationSourcePrefix(r,f);live=eqSourceLive(e,r,f,'自动补全原书辅助线');tip=dot(live.point||a.point,red,3/st.scale)}else live={tex:e.tex,values:'补充线完成',detail:''}}
 if(done!==null){$('#vDone').innerHTML=done;st._eqDoneKey=doneKey}$('#vActive').innerHTML=active;$('#vPoint').innerHTML=tip;return{readout:live.values,live,equationDriven:true};
}
function eqSourceLive(e,r,f,title='当前线段'){
 const a=equationSourcePrefix(r,f),s=a.current,base=numericRecordValue(e,{record:r,fraction:f});
 if(r.f.length){const b=r.visibleBox||r.box,horizontal=b[2]-b[0]>=b[3]-b[1],axis=horizontal?'X':'Y',start=(horizontal?b[0]:b[1])-.01,width=(horizontal?b[2]-b[0]:b[3]-b[1])+.02,front=start+width*f;return{tex:'\\Omega(u)=\\Omega_0\\cap\\{'+axis+'\\le '+eqNum(start)+'+'+eqNum(width)+'u\\},\\quad0\\le u\\le1',values:(base?.text?base.text+' · ':'')+'u = '+eqNum(f,4)+' · '+axis+' = '+eqNum(front)+' · 透明度 = '+eqNum(r.fo??1),detail:'按当前扫描边界填充原书区域；图案坐标向右、向下为正。',point:horizontal?[front,(b[1]+b[3])/2]:[(b[0]+b[2])/2,front]}}
 if(!s)return{tex:e.tex,values:base?.text||'u = '+eqNum(f,4),detail:'按原书构造规则生成。'};
 const A=s.A.map(x=>Number(x.toFixed(3))),D=s.B.map((x,k)=>Number((x-s.A[k]).toFixed(3))),tex='\\begin{aligned}X(u)&='+A[0]+'+('+D[0] +')u\\\\Y(u)&='+A[1]+'+('+D[1]+')u\\end{aligned}\\quad 0\\le u\\le1';
 return{tex,values:(base?.text?base.text+' · ':'')+'u = '+eqNum(a.u,4)+' · P = '+eqPointText(a.point),detail:title+'；此处用图案坐标表示当前线段（向右、向下为正）。'};
}
function equationUpdate(e,p,ghost,guide){
 const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);const st=vectorState;
 if(typeof eqRemainderUpdate==='function'){const custom=eqRemainderUpdate(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqFirstMaskUpdate==='function'){const custom=eqFirstMaskUpdate(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqBook185Update==='function'){const custom=eqBook185Update(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqConicConstructionUpdate==='function'){const custom=eqConicConstructionUpdate(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqFunctionUpdate==='function'){const custom=eqFunctionUpdate(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqParametricUpdate==='function'){const custom=eqParametricUpdate(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqMixedUpdate==='function'){const custom=eqMixedUpdate(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqPolarUpdate==='function'){const custom=eqPolarUpdate(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqLateUpdate==='function'){const custom=eqLateUpdate(e,p,ghost,guide);if(custom)return custom}
 if(typeof eqMeltingUpdate==='function'){const custom=eqMeltingUpdate(e,p,ghost,guide);if(custom)return custom}
 if(!st._equationChecked){st._equationChecked=true;for(const factory of [eqLinePlan,eqParametricPlan,eqParabolaPlan,eqFunctionPlan,eqPolarPlan,eqMixedPlan,eqRemainderPlan,eqLatePlan]){const plan=factory(e,st);if(plan){st._equationPlan=plan;break}}}
 return st._equationPlan?eqRun(e,p,ghost,guide,st._equationPlan):null;
}
