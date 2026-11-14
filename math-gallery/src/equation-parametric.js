// True parameter-driven chapter 10 curves. Every active endpoint is evaluated from t.
function epNumber(x,d=3){return Number(x.toFixed(d)).toString().replace('-', '−')}
function epMap(F,A){return t=>{const P=F(t);return[A[0]*P[0]+A[1],A[2]*P[1]+A[3]]}}
function epF(n,t,c=0){const s=Math.sin,co=Math.cos,ex=Math.exp,pi=Math.PI;
 if(n===150)return[t-s(t),1-co(t)+c];
 if(n===151){const r=ex(co(t))-2*co(4*t)-s(t/12)**5;return[s(t)*r,co(t)*r]}
 if(n===152)return[.5*s(20*t),s(20*t)**2*co(7*t)];
 if(n===153)return[4*pi*(t+co(80*pi*t)-co(2*pi*t)),co(4*pi*t)+4*pi*(s(80*pi*t)-s(2*pi*t))];
 if(n===154||n===157)return[16*s(t)**3,13*co(t)-5*co(2*t)-2*co(3*t)-co(4*t)];
 if(n===155)return[co(t)/(1+s(t)**2),s(t)*co(t)/(1+s(t)**2)];
 if(n===156)return[2*co(6.1*t)**2*s(s(7.6*t)),2*s(6.1*t)*co(co(7.6*t))];
 if(n===158)return[(11*co(t)-co(11*t))/(4.5+c)-2.75,(11*s(t)-s(11*t))/(4.5+c)+4.25];
 if(n===159)return[t+co(14*t)/t,t+s(14*t)/t];
 if(n>=160&&n<=163)return[2*s(13*pi*t),3.5*co((1+2*(n-160))*pi*t)];
 if(n===164)return[-co(2.01*t-pi/2)*ex(-.00085*t)-co(3*t-pi/16),-s(3*t)*ex(-.0065*t)-s(2*t)];
 return[0,0];
}
function epCycloidT(x){let lo=0,hi=50;for(let i=0;i<65;i++){const t=(lo+hi)/2;if(t-Math.sin(t)<x)lo=t;else hi=t}return(lo+hi)/2}
function epCurve(r,n,A,t0,t1,tex,params='',count=8000,c=0){const math=t=>epF(n,t,c);return{r,t0,t1,math,eval:epMap(math,A),tex,params,count,variable:'t'}}
function eqParametricPlan(e,st){
 const n=+e.page;if(n<150||n>164||n===157)return null;
 const rs=st.m.paths,curves=[];let note='曲线由当前参数 t 直接代入方程计算，红点与曲线末端采用同一次计算。';
 if(n===150){
  const A=[-10.8,396.97,-7.2,596.32],t0=epCycloidT((396.97-Math.min(st.m.w,396.97))/10.8),t1=epCycloidT(396.97/10.8);
  for(const r of rs.filter(r=>r.s.length&&r.s[0]>.1)){const c=(596.32-r.box[3])/7.2;let start=t0;if(r.box[3]>st.m.h)start=Math.max(start,Math.acos(Math.max(-1,1-(r.box[3]-st.m.h)/7.2)));
   curves.push(epCurve(r,n,A,start,t1,e.tex,'c ≈ '+epNumber(c,4),7000,c));}
  note='原书未列出摆线的 c 档位。本页以第一条摆线为 c=0，在同一坐标比例下标定后续平移量；每条摆线由 x=t−sin t、y=1−cos t+c 实时计算。';
 }else if(n===154){
  const groups=Array.from({length:20},()=>[]);rs.forEach((r,i)=>{const layer=i<13?i+1:i<15?15:i<30?16+Math.floor((i-15)/3):14;groups[layer-1].push(r)});
  groups.forEach((sources,j)=>{const scale=(j+1)/20,math=t=>epF(154,t).map(v=>v*scale),r=sources[0];curves.push({r,sources,t0:0,t1:2*Math.PI,math,eval:epMap(math,[-16.764,198.82,-16.764,289.782]),tex:'\\begin{aligned}x&=16\\lambda\\sin^3t\\\\y&=\\lambda(13\\cos t-5\\cos2t-2\\cos3t-\\cos4t)\\end{aligned}',params:'λ = '+epNumber(scale,2)+'（以最外层为1）',count:6500,variable:'t'})});
  note='同一颗大爱心在原文件里被分成数段；这里已合并为完整的一圈，t 连续从 0 走到 2π，再改变缩放参数 λ。';
 }else if(n===155){
  // Source 0 is the zero-size member of the family: it is a stationary point,
  // not a final auxiliary action. Source IDs survive typography cleanup.
  const bySource=new Map(st.m.sourceIndexes.map((source,i)=>[source,rs[i]]));
  for(let source=1;source<=12;source++){const r=bySource.get(source);if(!r)continue;const scale=source/12,math=t=>{const [x,y]=epF(155,t);return[-scale*y,scale*x]};curves.push({r,t0:0,t1:2*Math.PI,math,eval:epMap(math,[259.2,199.14,-259.2,292.21]),tex:'\\begin{aligned}x&=-\\lambda\\frac{\\sin t\\cos t}{1+\\sin^2t}\\\\y&=\\lambda\\frac{\\cos t}{1+\\sin^2t}\\end{aligned}',params:'λ = '+epNumber(scale,4)+'（以最外层为1） · 旋转 α = 90°',count:6000,variable:'t'})}
  return{curves,refs:[],mainEnd:1,note:'每圈中 t 连续从 0 走到 2π，再改变 λ；最外圈完成即结束。零尺寸的退化点不占用动画时间。'};
 }else if(n===158){
  rs.forEach((r,i)=>{const c=i<15?i+1:.5,A=eqParametricTransforms[n+':'+i];curves.push(epCurve(r,n,A,0,2*Math.PI,e.tex,'c = '+c+' · a = '+epNumber(1/(4.5+c),4)+' · b = '+epNumber(10/(4.5+c),4),9000,c))});
 }else if(n===159){
  curves.push(epCurve(rs[0],n,[22.5,144.24,-22.5,470.91],.05874426194522821,11.597628967939063,e.tex,'t > 0',18000));
  note='t=0 时分母为零。按原书 0<t≤20 作图，当前书页能看到的部分约为 0.05874≤t≤11.59763；只播放此可见区间，随后补全 y=x 等原图线条。';
 }else{
  const ranges={151:[0,12*Math.PI],152:[0,2*Math.PI],153:[0,1],156:[-8,8],160:[0,2],161:[0,2],162:[0,2],163:[0,2],164:[0,249.99]},counts={151:20000,152:24000,153:24000,156:22000,160:14000,161:16000,162:18000,163:20000,164:24000},A=eqParametricTransforms[n+':0'];
  curves.push(epCurve(rs[0],n,A,...ranges[n],e.tex,'',counts[n]));
 }
 const covered=new Set(curves.flatMap(c=>c.sources||[c.r]));return{curves,refs:rs.filter(r=>!covered.has(r)),note};
}

// p157 is genuinely a masking construction: horizontal equations, a continuous
// analytic heart boundary, then a white interior scan. The scan is not used to
// reveal an ordinary parameter curve.
function epPath(points){return points.map((p,i)=>(i?'L':'M')+p.map(x=>Number(x.toFixed(4))).join(' ')).join(' ')}
function epPrefix(F,t0,t1,t,count=2400){const k=Math.max(0,Math.min(count,Math.floor((t-t0)/(t1-t0)*count))),points=[];for(let j=0;j<=k;j++)points.push(F(t0+(t1-t0)*j/count));const end=F(t);if(!points.length||Math.hypot(points.at(-1)[0]-end[0],points.at(-1)[1]-end[1])>1e-8)points.push(end);return{d:epPath(points),point:end}}
function epStyle(r,prefix,d,extra=''){return vectorPath({...r,d,playParts:undefined,playLengths:undefined},prefix,1,extra)}
function eqParametricUpdate(e,p,ghost,guide){
 if(+e.page!==157)return null;
 const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);const st=vectorState,rs=st.m.paths;
 const bySource=new Map(st.m.sourceIndexes.map((source,i)=>[source,rs[i]])),base=Array.from({length:25},(_,i)=>bySource.get(i+1)).filter(Boolean),fill=bySource.get(26),outline=bySource.get(27),border=bySource.get(28),finalRecords=[...base,fill,outline,border].filter(Boolean),heart=t=>epF(157,t),F=epMap(heart,[11.0634,198.715,-11.0634,324.047]);
 // IDs 0 and 29 are respectively a neighbouring-page sliver and a printed
 // fraction bar. Neither is part of the heart construction or its final image.
 if(p>=1){$('#vDone').innerHTML=finalRecords.map(r=>vectorPath(r,st.prefix)).join('');$('#vActive').innerHTML='';$('#vPoint').innerHTML='';st.done=finalRecords.length;return{equationDriven:true,readout:'横线、白色爱心与原书边缘已完成',live:{tex:e.tex,values:'t = 2π · 填充完成',detail:'各阶段按原书构造顺序连续完成。'}}}
 let done='',active='',point='',tex=e.tex,values='',detail='',readout='';
 if(p<.5){const v=p/.5*base.length,i=Math.min(base.length-1,Math.floor(v)),q=v-i,r=base[i],P=Array.from(r.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g),m=>[+m[1],+m[2]]),A=P[0],B=P.at(-1),Q=A.map((x,k)=>x+(B[k]-x)*q);done=base.slice(0,i).map(r=>vectorPath(r,st.prefix)).join('');active=epStyle(r,st.prefix,epPath([A,Q]));point=dot(Q,red,2.9/st.scale);
  if(i<24){const c=(611.6954-A[1])/71.9121,x=(Q[0]-.956725)/71.9121;tex='y=c,\\qquad x=u';values='c ≈ '+epNumber(c,4)+' · u = '+epNumber(x);detail='固定当前横线的 c，改变横坐标 u；下一条横线再更新 c。'}else{tex='x=1,\\qquad y=u';values='x = 1 · u = '+epNumber((611.6954-Q[1])/71.9121);detail='补上竖线，之后再用白色爱心遮挡。'}readout='先画 y=c 的横线 · 第 '+Math.min(i+1,24)+' / 24 条';
 }else if(p<.78){const t=(p-.5)/.28*2*Math.PI,P=epPrefix(F,0,2*Math.PI,t,6000);done=base.map(r=>vectorPath(r,st.prefix)).join('');active=epStyle({...outline,s:[.25,.45,.25],f:[]},st.prefix,P.d);point=dot(P.point,red,3/st.scale);tex='\\begin{aligned}x&=\\frac{16\\sin^3t}{6.5}+2.75\\\\y&=\\frac{13\\cos t-5\\cos2t-2\\cos3t-\\cos4t}{6.5}+4\\end{aligned}';values='t = '+epNumber(t,4)+' · x = '+epNumber(heart(t)[0]/6.5+2.75)+' · y = '+epNumber(heart(t)[1]/6.5+4);detail='当前点由参数方程直接计算，沿完整爱心连续前进。';readout='连续绘制参数爱心边界';
 }else if(p<.94){const q=(p-.78)/.16,b=fill.box,y=b[1]+(b[3]-b[1])*q,id=st.prefix+'analyticHeartFill';done=base.map(r=>vectorPath(r,st.prefix)).join('');active='<defs><clipPath id="'+id+'"><rect x="'+(b[0]-2)+'" y="'+(b[1]-2)+'" width="'+(b[2]-b[0]+4)+'" height="'+(y-b[1]+2)+'"/></clipPath></defs><g clip-path="url(#'+id+')">'+vectorPath(fill,st.prefix)+'</g>'+(guide?epStyle({...outline,s:[.3,.4,.3]},st.prefix,epPrefix(F,0,2*Math.PI,2*Math.PI,6000).d):'');tex='y_{\\mathrm{scan}}=h,\\qquad\\text{仅涂白爱心内部}';values='h ≈ '+epNumber((611.6954-y)/71.9121)+' · 填充 '+Math.round(q*100)+'%';detail='边界已经完成，现在沿水平扫描线填充白色区域。';readout='用白色覆盖爱心内部';
 }else{done=base.map(r=>vectorPath(r,st.prefix)).join('')+vectorPath(fill,st.prefix)+vectorPath(outline,st.prefix);const q=(p-.94)/.06,a=4.244501280320906,b=5.180276680448474,t=a+(b-a)*q,P=epPrefix(F,a,b,t,2000);active=epStyle(border,st.prefix,P.d);point=dot(P.point,red,2.5/st.scale);tex='\\begin{aligned}x&=\\frac{16\\sin^3t}{6.5}+2.75\\\\y&=\\frac{13\\cos t-5\\cos2t-2\\cos3t-\\cos4t}{6.5}+4\\end{aligned}';values='t = '+epNumber(t,4)+' · 左侧爱心边缘';detail='沿同一参数方程补出原书的黑色边缘。';readout='连续补齐原书的爱心边缘';}
 $('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=point;return{equationDriven:true,readout,live:{tex,values,detail}};
}
const eqParametricTransforms={"151:0":[58.31108968303553,205.51000000000002,-58.31857453899702,336.0416028096515],"152:0":[-378.0,198.5,-251.9618737024129,342.53000000000003],"153:0":[6.80726718884732,176.90267381698865,-6.807269213734634,253.32488363460666],"156:0":[-98.17539475246187,198.97,-98.18093536542783,236.435],"160:0":[88.29,195.39000000000001,-64.8,320.28000000000003],"161:0":[88.28999999999999,198.43,-64.8,318.05],"162:0":[88.29,195.39000000000001,-64.8,322.53000000000003],"163:0":[88.28999999999999,198.43,-64.8,317.74],"164:0":[79.19961372941164,188.06762243859416,-79.19444941616706,303.4842617769119],"158:0":[-64.80030961692172,13.134148553465252,-64.79229166666667,591.2522395833333],"158:1":[-64.80030961692171,13.13414855346528,-64.79687499999999,591.26171875],"158:2":[-64.79858415659501,13.138893569363717,-64.790625,591.24515625],"158:3":[-64.79987825184003,13.135334807439904,-64.79124999999999,591.2428124999999],"158:4":[-64.80117234708504,13.13177604551612,-64.79791666666667,591.2711458333333],"158:5":[-64.80117234708506,13.13177604551609,-64.78500000000003,591.2262500000002],"158:6":[-64.79168231528818,13.14787363295747,-64.77854166666667,591.1938020833334],"158:7":[-64.79103526766566,13.154653013919415,-64.78645833333333,591.2174479166666],"158:8":[-64.79729006134998,13.14245233128753,-64.79437499999999,591.2610937499999],"158:9":[-64.7996625692992,13.130927934427177,-64.79687500000001,591.27171875],"158:10":[-64.79556460102329,13.147197347185937,-64.78354166666661,591.2050520833332],"158:11":[-64.79081958512484,13.160246140906679,-64.79687499999997,591.2717187499999],"158:12":[-64.78456479144053,13.182446823538555,-64.78645833333333,591.2274479166666],"158:13":[-64.7996625692992,13.130927934427177,-64.78083333333328,591.1985416666664],"158:14":[-64.79470187085994,13.149569855135155,-64.79687500000001,591.27171875],"158:15":[-64.79750574389081,13.141859204300289,-64.79166666666666,591.2445833333334]};
