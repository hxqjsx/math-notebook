// Polar curves are evaluated from their equations, never uncovered by a mask.
// PDF coordinates retain the book's rotations and scale. Where printed ranges
// or coefficients differ from the actual artwork, the live panel names the
// calibrated equation explicitly; the left panel keeps the printed formula.
function epN(x,n=4){return Number(x.toFixed(n)).toString()}
function epFirst(r){const a=r.d.match(/M\s*([-\d.]+)[ ,]+([-\d.]+)/);return[+a[1],+a[2]]}
function epPolar(r,fn,t0,t1,O,S,tex,params='',map=null,count=5000){
 const math=t=>{const z=fn(t);return[z*Math.cos(t),z*Math.sin(t)]};
 return{r,t0,t1,variable:'θ',math,eval:t=>{const a=math(t);return map?map(a):[O[0]+S*a[0],O[1]-S*a[1]]},tex,params:t=>(typeof params==='function'?params(t):params)+(params?' · ':'')+'r = '+epN(fn(t)),count};
}
function epHorizontal(r,c,y0,S){const a=epFirst(r),x0=0;return{r,t0:a[0]/S,t1:r.box[0]===a[0]?r.box[2]/S:r.box[0]/S,variable:'x',math:x=>[x,c],eval:x=>[x*S,y0-S*c],tex:'y=c='+epN(c),params:'c = '+epN(c),count:100}}
function eqPolarPlan(e,st){
 const n=+e.page,rs=st.m.paths,P=Math.PI,curves=[],refs=[];
 if(n===98){
  for(let i=0;i<20;i++)curves.push(epPolar(rs[i],t=>.1+.2/t,.025,30*P,[305.465-15.23077*i,486.27512-20.07692*i],72,'r=0.1+\\frac{0.2}{\\theta}', '第 '+(i+1)+' 个平移副本 · a = '+epN(-15.23077*i/72)+' · b = '+epN(20.07692*i/72),null,8000));
  curves.push(epPolar(rs[20],t=>.4+.2/t,.025,30.5*P,[0,0],72,'r=0.4+\\frac{0.2}{\\theta}', '旋转副本 · α = −90°',a=>[66.85107+72*a[1],369.49615+72*a[0]],8000));
  return{curves,refs:[rs[21]],note:'图形校准式包含常数项；左侧保留原书 r=0.2/θ。极径由当前 θ 直接计算。'};
 }
 if(n===131){
  const O=[405.83,81.64],S=72;
  for(let i=0;i<25;i++){const c=P+i*P/50,r=rs[i],b=r.box,R=Math.hypot(b[0]-O[0],b[3]-O[1])/S;curves.push({r,t0:0,t1:R,variable:'ρ',math:t=>[t*Math.cos(c),t*Math.sin(c)],eval:t=>[O[0]+S*t*Math.cos(c),O[1]-S*t*Math.sin(c)],tex:'\\theta=c='+epN(c)+',\\quad (x,y)=(\\rho\\cos c,\\rho\\sin c)',params:'c = '+epN(c)+' rad = '+epN(c*180/P,1)+'°',count:100})}
  return{curves,refs:[rs[25]],note:'固定 θ=c，沿射线增加 ρ；每完成一条射线，再改变 c。'};
 }
 if(n===132){
  for(let c=1;c<=9;c++){const r=rs[c===1?10:c<=7?c-2:c===8?6:8];curves.push(epPolar(r,t=>Math.cos(4*t)+Math.sin(4*t)**2+c,0,2*P,[189.885,310.435],23.84,'r=\\cos4\\theta+\\sin^2 4\\theta+c', 'c = '+c));}
  return{curves,refs,note:'固定 c 后，θ 连续描出一整条曲线，再改变 c。'};
 }
 if(n===133){
  const S=20.05217/.28,y0=578.91+.28*S;
  for(let i=0;i<24;i++)curves.push(epHorizontal(rs[i],.28*(i+1),y0,S));
  curves.push(epPolar(rs[24],t=>1/Math.sqrt(P/2-t),-24.5*P,P/2-.02,[206.99548,489.57125],107.86765,'r=\\sqrt{\\frac1{\\pi/2-\\theta}}','',null,20000));
  return{curves,refs:rs.slice(25),note:'画面校准：横线以首条 c=0.28 定单位；原图可见螺线下限为 −24.5π，原书文字给出 −25π。'};
 }
 if(n===134){for(const sign of[1,-1])curves.push(epPolar(rs[sign===1?0:16],t=>sign*Math.sqrt(t),0,12*P,[190.33,372.30],52.8,'r='+ (sign===1?'':'-')+'\\sqrt\\theta','分支 '+(sign===1?'r ≥ 0':'r ≤ 0'),null,8000));return{curves,refs:rs.slice(30),note:'两条分支各自由 θ 连续生成；页面外的区间自动跳过。'};}
 if(n===135){for(let k=1;k<=11;k++)curves.push(epPolar(rs[21+k],t=>k*Math.cos(t)*Math.cos(2*t),0,P,[0,0],36,'r=c\\cos\\theta\\cos2\\theta','c = '+k,a=>[207.35-36*a[1],127.86+36*a[0]]));return{curves,refs:rs.slice(33),note:'原书未列出 c 的数值；以最小图形 c₁=1 校准单位，c=1…11。坐标按原图旋转摆放。'};}
 if(n===136||n===137){const O=n===136?[397.92,308.97]:[.99,308.99],S=291.43/4.25;curves.push(epPolar(rs[n===136?0:28],t=>4.25*Math.cos(12*t),0,2*P,O,S,'r=4.25\\cos12\\theta','',null,8000));return{curves,refs:rs.slice(-2),note:'跨页玫瑰线按原书同一极坐标方程生成，自动跳过另一页的区间。'};}
 if(n===142){const O=[77.95,316.93],S=25.91;for(let i=0;i<8;i++){const c=(epFirst(rs[i])[0]-O[0])/(2*S);curves.push(epPolar(i===7?rs[8]:rs[i],t=>c*(1+Math.cos(t)),0,2*P,O,S,'r=c(1+\\cos\\theta)','c = '+epN(c)))}return{curves,refs,note:'原书未列出 c 的数值；以最小心形 c₁=1 校准单位。'};}
 if(n===143){curves.push(epPolar(rs[0],t=>-t*Math.cos(3*t),-3.5*P,14.5*P,[0,0],4.98458,'r=-\\theta\\cos3\\theta','画面校准范围：−3.5π ≤ θ ≤ 14.5π',a=>[252.12+4.98458*a[0],312.11+4.98458*a[1]],12000));return{curves,refs:rs.slice(1),note:'原图上限为14.5π；左侧保留原书文字13.5π。按原图的坐标朝向摆放。'};}
 if(n===144){curves.push(epPolar(rs[0],t=>t+2*Math.sin(2*P*t),0,13.5*P,[199.89,303.46],4.32,'r=\\theta+2\\sin(2\\pi\\theta)','',null,8000));return{curves,refs:rs.slice(1)};}
 if(n===146){
  // The caption explicitly says variants. These coefficients are recovered from
  // radial coordinates in the original artwork, with a single 64.8 pt unit.
  const defs=[[2,2.2,.15,12,.5],[3,1.55,-.115,12,.5],[4,1.375,-.1,12,.5],[5,.6,.06,12,.3],[6,1.9,-.25,6,0],[7,.45,.15,12,1.5],[8,1.9,.25,6,0],[9,.35,0,0,0],[10,.85,.3,12,1.9,18],[11,1.15,0,0,0],[12,.25,.15,6,2]];
  for(const[i,a,b,k,d,j=k]of defs){const f=t=>a+(b?b*Math.cos(k*t)/(d?d+Math.abs(Math.sin(j*t)):1):0);const tex='r='+a+(b?(b<0?'-':'+')+(d?'\\frac{'+Math.abs(b)+'\\cos('+k+'\\theta)}{'+d+'+|\\sin('+j+'\\theta)|}':Math.abs(b)+'\\cos('+k+'\\theta)'):'');curves.push(epPolar(rs[i],f,0,2*P,[190.95,304.725],64.8,tex,'图中变体 · a = '+a+' · b = '+b+' · k = '+k+(d?' · d = '+d+' · m = '+j:''),null,7200));}
  return{curves,refs:[rs[0],rs[1]],note:'原书称“各种变体”，未逐条列参数；此处显示从原图径向坐标校准出的具体变体。'};
 }
 if(n===147){for(let c=1;c<=8;c++)curves.push(epPolar(rs[c===8?7:c-1],t=>c*Math.sin(t/2),0,4*P,[0,0],23.10625,'r=c\\sin(\\theta/2)','c = '+c,a=>[205.51-23.10625*a[1],280.07+23.10625*a[0]],6000));return{curves,refs,note:'原书未列出 c 的数值；以最小图形 c₁=1 校准单位，c=1…8；按原图旋转摆放。'};}
 return null;
}
function eqPolarLeaf(theta){const r=5.2*Math.cos(Math.sin(4*theta))-.5*Math.sin(80*theta);return[207.00008+21.6*r*Math.cos(theta),315.14258-21.6*r*Math.sin(theta)]}
function eqPolarLeafState(q){const theta=Math.PI-2*Math.PI*Math.max(0,Math.min(1,q)),r=5.2*Math.cos(Math.sin(4*theta))-.5*Math.sin(80*theta);return{tex:'r=5.2\\cos(\\sin4\\theta)-0.5\\sin80\\theta',values:'θ = '+epN(theta)+' rad · r = '+epN(r),detail:'画面校准式：原书图形的波纹幅度与文字公式不同；此处保留原图，并显示实际生成图形的系数。',point:eqPolarLeaf(theta),theta}}
// A broad white brush can paint the page while its centre is just outside it.
// Keep those intervals and let the outer page clip trim the painted stroke.
function epBrushPrepare(c,m,pad){const z=eqPrepareCurve(c,m),iv=[];for(let i=1;i<z.points.length;i++){const A=z.points[i-1].q.map(v=>v+pad),B=z.points[i].q.map(v=>v+pad),h=eqClipSegment(A,B,m.w+2*pad,m.h+2*pad);if(!h)continue;const a=(i-1+h[0])/z.N,b=(i-1+h[1])/z.N;if(b-a<1e-10)continue;if(iv.length&&a<=iv.at(-1)[1]+1e-8)iv.at(-1)[1]=b;else iv.push([a,b])}z.intervals=iv;z.span=iv.reduce((s,[a,b])=>s+b-a,0);return z}
function epBrushTrace(c,z,f){const q=eqVisibleFraction(z,f),t=c.t0+(c.t1-c.t0)*q,point=c.eval(t),k=Math.min(z.N,Math.floor(q*z.N)),P=z.points.slice(0,k+1).map(v=>v.q);P.push(point);return{d:P.map((p,i)=>(i?'L':'M')+p.map(eqPathNumber).join(' ')).join(' '),t,point,math:c.math(t)}}
// The two phases remain separately playable: the first creates y=c, the second
// follows the analytic Archimedean spiral with a white brush over those lines.
function eqPolarUpdate(e,p,ghost,guide){
 if(+e.page!==138)return null;const st=vectorState,m=st.m,rs=m.paths;
 if(!st.ep138){const S=20.0768/.28,y0=592.29+.28*S;const rows=rs.slice(0,26).map((r,i)=>epHorizontal(r,.28*(26-i),y0,S));const spiral=epPolar(rs[26],t=>t,0,24*Math.PI,[189.37,351.37],7.2,'r=\\theta','白色画笔',null,10000);for(const c of rows)eqPrepareCurve(c,m);epBrushPrepare(spiral,m,spiral.r.w/2);st.ep138={rows,spiral,base:rows.map(c=>eqCurveSVG(c,eqCurvePrefix(c,c._eq,1,m).d,st)).join('')}}
 const a=st.ep138;let done='',active='',point='',live;
 if(p>=1){done=m.paths.map(r=>vectorPath(r,st.prefix)).join('');live={tex:'r=\\theta',values:'横线与螺线涂白已完成',detail:'先画 y=c，再沿 r=θ 的轨迹涂白；补充竖线自动完成。'}}
 else if(p<.4){const v=p/.4*26,i=Math.min(25,Math.floor(v)),f=v-i,c=a.rows[i],trace=eqCurvePrefix(c,c._eq,f,m);done=a.rows.slice(0,i).map(k=>eqCurveSVG(k,eqCurvePrefix(k,k._eq,1,m).d,st)).join('');active=eqCurveSVG(c,trace.d,st);point=dot(trace.point,red,3.2/st.scale);live=eqCurveLive(e,c,trace,i,26);live.detail='第 1 阶段：逐条生成 y=c，完成后暂停。'}
 else if(p<.97){done=a.base;const trace=epBrushTrace(a.spiral,a.spiral._eq,(p-.4)/.57);active=eqCurveSVG(a.spiral,trace.d,st);point=dot(trace.point,red,3.2/st.scale);live=eqCurveLive(e,a.spiral,trace,0,1);live.detail='第 2 阶段：白色画笔的位置由 r=θ 计算，沿螺线涂去横线。'}
 else{done=a.base+eqCurveSVG(a.spiral,epBrushTrace(a.spiral,a.spiral._eq,1).d,st);const f=(p-.97)/.03,a0=equationSourcePrefix(rs[36],f);active=vectorPath(rs[36],st.prefix,f);point=dot(a0.point,red,3/st.scale);live=eqSourceLive(e,rs[36],f,'自动补充竖线')}
 $('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=point;st._eqDoneKey='polar138';return{readout:live.values,live,equationDriven:true};
}
