// Analytic functions: the drawn point and readout share the same evaluation.
function efN(x,d=4){return Number(x.toFixed(d)).toString().replace('-','−')}
function efValue(n,x,q){const c=q.c||0,ph=q.phase||0;
 if(n===76||n===78)return Math.sin(x-ph)+c;
 if(n===77){const u=x-2;return Math.exp(-u*u)*Math.cos(30*u-6.5*u*u)}
 if(n===79)return .4*Math.sin(.2*c*x)+.3*c;
 if(n===80)return Math.sin(2*x)*Math.log(-.5*x)+c;
 if(n===81)return .18*c*x+Math.sin(2*x);
 if(n===83)return(ph?Math.cos(x):Math.sin(x))+c;
 if(n===84)return Math.sin(2*x)*Math.exp(q.lam*x)+c;
 if(n===86)return Math.sin(2*q.k*x)+c;
 if(n===89)return q.sign*Math.abs(x*Math.sin(15*x));
 if(n===90)return -1/(x+1)+c;
 if(n===93)return q.kind==='oscill93'?-Math.sin(q.lam*x+q.phi)/(x-1)+c:1/(1-x)+c;
 if(n===94)return(x*x-4)/(x+2.75)+c;
 if(n===96)return-Math.tan(x)+c;
 if(n===97)return(x+c)/(3*x+2)+11/12;
 if(n===99)return 1/(1+Math.exp(-4*x))+c;
 if(n===101)return x+c+(q.branch?q.delta:0);
 if(n===102)return x-x**3/6+x**5/120+c;
 return NaN;
}
function efImplicitRadius(t){let lo=0,hi=4;for(let i=0;i<55;i++){const r=(lo+hi)/2,x=r*Math.cos(t),y=r*Math.sin(t),v=Math.cos(x+y)/20+Math.cos(x)+Math.cos(y);if(v>0)lo=r;else hi=r}return(lo+hi)/2}
function eqFunctionPlan(e,st){
 const n=+e.page,models=eqFunctionModels[n];if(!models)return null;
 const byOld=new Map(st.m.sourceIndexes.map((i,j)=>[i,st.m.paths[j]])),curves=[],used=new Set();
 let note='原书未列出的平移量，以本页第一条曲线为 c=0 标定；当前方程、参数和红点使用同一次计算。';
 const formulas={76:'y=\\sin x+c',78:'y=\\sin(x-\\varphi)+c',79:'y=0.4\\sin(0.2cx)+0.3c',80:'y=\\sin(2x)\\ln(-0.5x)+c',81:'y=0.18cx+\\sin(2x)',84:'y=\\sin(2x)e^{\\alpha x}+c',86:'y=\\sin(2kx)+c',89:'y=\\sigma\\left|x\\sin(15x)\\right|',90:'y=-\\frac1{x+1}+c',94:'y=\\frac{x^2-4}{x+2.75}+c',96:'y=-\\tan x+c',97:'y=\\frac{x+c}{3x+2}+\\frac{11}{12}',99:'y=\\frac1{1+e^{-4x}}+c',102:'y=x-\\frac{x^3}{6}+\\frac{x^5}{120}+c'};
 for(const q of models){const r=byOld.get(q.index);if(!r)continue;used.add(r);let math=t=>[t,efValue(n,t,q)],project=P=>[q.b+q.s*P[0],q.d+q.a*P[1]],tex=formulas[n]||e.tex,params='c ≈ '+efN(q.c||0),variable='x',count=4000;
  if(n===60){math=t=>[q.c*Math.cos(t),q.c*Math.sin(t)];tex='x=c\\cos\\theta,\\quad y=c\\sin\\theta,\\quad x^2+y^2=c^2';params='c ≈ '+efN(q.c);variable='θ';note='圆弧用等价参数式连续生成；在原书可见范围内，取上半圆的左侧分支。';}
  if(n===77){const h=(q.b-54.0024142)/72,c=(q.d-527.82107495)/(-64.796);math=t=>[t+h,efValue(n,t,q)+c];project=P=>[q.b+q.s*(P[0]-h),q.d+q.a*(P[1]-c)];tex='y=e^{-(x-h-2)^2}\\cos\\!\\left[30(x-h-2)-6.5(x-h-2)^2\\right]+c';params='h ≈ '+efN(h)+' · c ≈ '+efN(c);variable='u = x−h';count=14000;note='按原书先复制，再向上或向右平移；h 与 c 是各复制曲线的实际平移参数。'}
  if(n===78){params+=' · φ = '+(q.phase===0?'0':Math.abs(q.phase-Math.PI/3)<.01?'π/3':'2π/3');count=16000;}
  if(n===82){const k=Math.round((q.b-models[0].b)/(2*Math.PI*11.429)),l=Math.round((q.d-models[0].d)/(2*Math.PI*11.429)),cx=Math.PI+2*Math.PI*k,cy=Math.PI+2*Math.PI*l;math=t=>{const rad=efImplicitRadius(t);return[cx+rad*Math.cos(t),cy+rad*Math.sin(t)]};project=P=>[q.b+q.s*(P[0]-cx),q.d+q.a*(P[1]-cy)];tex='\\frac{\\cos(x+y)}{20}-\\cos x-\\cos y=0,\\quad (x,y)=(x_0,y_0)+r(\\theta)(\\cos\\theta,\\sin\\theta)';params='k = '+k+' · l = '+l+' · x₀ = '+efN(cx)+' · y₀ = '+efN(cy)+' · r(θ) 为方程的正根';variable='θ';count=2400;note='沿极角 θ 连续变化，每一点的半径都由原书隐式方程求根；重复单元按原图缩小和平移。'}
  if(n===83)tex=q.phase?'y=\\cos x+c':'y=\\sin x+c';
  if(n===84){params+=' · α ≈ '+efN(q.lam,6);note='原书文字给出指数系数 0.25；原图标定得到约 1/11。此处明确显示当前实际系数 α，以保留原图形状。'}
  if(n===86){params+=' · k = '+q.k+' Hz';count=18000;note='各行使用同一坐标比例，k 对应谱中音高，c 改变上下位置；x 连续变化生成声波。'}
  if(n===89){params='σ = '+q.sign;count=18000;note='原书隐式式 y²=x²sin²(15x) 分成上下两支；随 x 连续生成，两支最后合成完整图案。'}
  if(n===92){math=t=>[-1+q.sign*Math.exp(t-q.c),t];tex='y=\\ln|x+1|+c,\\quad x=-1+\\sigma e^{y-c}';params+=' · σ = '+q.sign;variable='y';note='使用同一对数方程的反解，以 y 连续变化生成渐近线附近的曲线，避免舍入误差造成突然跳动。'}
  if(n===93){if(q.kind==='oscill93'){tex='y=-\\frac{\\sin(\\lambda x+\\varphi)}{x-1}+c';params+=' · λ ≈ '+efN(q.lam)+' · φ ≈ '+efN(q.phi)}else tex='y=\\frac1{1-x}+c';note='左支按书面式绘制；右支原图的振荡频率与书面 sin(x) 不同，当前式明确显示由原图标定的 λ 与 φ。'}
  if(n===100){math=t=>[-Math.exp(q.sign*q.c*t/12),t];tex='x=-e^{\\sigma cy/12}';params='c = '+q.c+' · σ = '+q.sign;variable='y';note='以 y 为连续自变量，直接代入指数方程计算 x；正负号决定两组曲线的方向。'}
  if(n===101){tex=q.branch?'y=x+c+\\delta,\\quad x\\ge b':'y=x+c,\\quad x<b';params+=' · b ≈ '+efN(q.breakpoint)+' · δ ≈ '+efN(q.delta);count=300;note='原图同一断点的右支是向上跳约 1/8；书面式写 −1/8。当前方程明确显示图形实际跳跃量 δ，开闭圆点最后自动补上。'}
  if(n===102){note='原书文字列到七次项，而原图轮廓对应五次式；当前方程显示实际生成图案的五次近似，并用 c 平移。'}
  curves.push({r,t0:q.t0,t1:q.t1,math,eval:t=>project(math(t)),tex,params,count,variable});
 }
 return curves.length?{curves,refs:st.m.paths.filter(r=>!used.has(r)&&(n!==60||r.box[0]<st.m.w-.01)),note}:null;
}
function efLinePath(P){return P.map((p,i)=>(i?'L':'M')+p.map(v=>Number(v.toFixed(5))).join(' ')).join(' ')}
function eqFunctionUpdate(e,p,ghost,guide){
 const n=+e.page;if(n!==91&&n!==95)return null;
 const st=scInit(e,ghost,guide),models=eqBoundaryModels[n],byOld=new Map(st.m.sourceIndexes.map((i,j)=>[i,st.m.paths[j]]));
 if(!st.eqBoundary){const curves=models.map(q=>({q,r:byOld.get(q.index),F:y=>[q.b+q.s*Math.sin(1/y),q.d+q.a*y]})),rows=st.m.paths.filter(scGrey);st.eqBoundary={curves,rows};for(const c of curves){const N=16000;c.P=Array.from({length:N+1},(_,i)=>c.F(c.q.t0+(c.q.t1-c.q.t0)*i/N));c.full=scLine(st,c.r,c.P)}}
 const m=st.eqBoundary,frame=models[0],coord=P=>[(P[0]-frame.b)/frame.s,(P[1]-frame.d)/frame.a];let done='',active='',help='',tex='',values='',detail='',readout='';
 if(p>=1){scFinal(st,'黑曲线与连接线 · 全部完成');return{readout:'黑曲线与连接线 · 全部完成',equationDriven:true,live:{tex:n===91?'x=\\sin(1/y),\\quad x=B-\\sin(1/y),\\quad y=c':'x=\\sin(1/y)',values:'构造完成',detail:'每条黑曲线由当前 y 直接代入计算，之后按原书连接端点。'}}}
 if(p<.3){const q=p/.3;for(const c of m.curves){const N=c.P.length-1,k=Math.floor(q*N),y=c.q.t0+(c.q.t1-c.q.t0)*q,Q=c.F(y),P=c.P.slice(0,k+1);P.push(Q);active+=scLine(st,c.r,P);help+=dot(Q,red,2.9/st.scale)}const y=frame.t0+(frame.t1-frame.t0)*q,x=Math.sin(1/y),B=n===91?(models[1].b-frame.b)/frame.s:0;tex=n===91?'x_1=\\sin(1/y),\\quad x_2=B-\\sin(1/y)':'x=\\sin(1/y)';values='y = '+efN(y,6)+' · 1/y = '+efN(1/y)+' · x'+(n===91?'₁':'')+' = '+efN(x)+(n===91?' · B ≈ '+efN(B)+' · x₂ = '+efN(B-x):'');detail='连续改变实际自变量 y，每次直接计算 sin(1/y)；红点与曲线末端使用同一结果。';readout='先生成黑色函数曲线';
 }else{const v=(p-.3)/.7*m.rows.length,i=Math.min(m.rows.length-1,Math.floor(v)),u=v-i,r=m.rows[i],P=scPoints(r.d);done=m.curves.map(c=>c.full).join('')+scSource(st,m.rows.slice(0,i));let A=P[0],B=P.at(-1);if(n===95&&P.length===2&&Math.abs(A[1]-B[1])>.1&&A[0]>50)[A,B]=[B,A];
  if(P.length===3){A=P[0];B=P[1];const C=P[2],Q=scMix(A,B,u),R=scMix(C,B,u);active=scLine(st,r,[A,Q])+scLine(st,r,[C,R]);help=dot(Q,red,2.6/st.scale)+dot(R,red,2.6/st.scale)}else{const Q=scMix(A,B,u);active=scLine(st,r,[A,Q]);help=dot(Q,red,2.8/st.scale)}
  const a=coord(A),b=coord(B),x=a[0]+u*(b[0]-a[0]),y=a[1]+u*(b[1]-a[1]);if(Math.abs(a[1]-b[1])<1e-6){tex='y=c,\\quad x(u)=x_A+(x_B-x_A)u';values='c = '+efN(a[1],6)+' · xA = '+efN(a[0])+' · xB = '+efN(b[0])+' · u = '+efN(u)+' · x = '+efN(x)}else{tex='\\begin{aligned}x(u)&=x_A+(x_B-x_A)u\\\\y(u)&=y_A+(y_B-y_A)u\\end{aligned}';values='A=('+efN(a[0])+', '+efN(a[1],6)+') · B=('+efN(b[0])+', '+efN(b[1],6)+') · u = '+efN(u)+' · x = '+efN(x)+' · y = '+efN(y,6)}detail=n===91?'按当前 y=c 连接两条黑色边界。':'按原书连接页面端点与黑曲线极值点，其余部分生成 y=c。';readout='生成连接线 · '+(i+1)+' / '+m.rows.length;
 }
 scRender(st,done,active,help);return{readout,equationDriven:true,live:{tex,values,detail}};
}
