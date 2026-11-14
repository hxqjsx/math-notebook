// Page 185: evaluate the printed cusp family, then rotate the whole family.
// A single fixed affine page calibration fits all 1,118 printed vertices;
// changing c, tracing t, and rotating theta all act on these same coordinates.
const eb185H=[71.39879196990758,-4.6800723509013125];
const eb185V=[-4.69,-71.54857142857142];
const eb185Q=[2.75,3.78],eb185M=[181.765,367.8],eb185Angle=Math.PI/24;
const eb185A=(()=>{const c=Math.cos(eb185Angle),s=Math.sin(eb185Angle);return[eb185H[0]*c-eb185V[0]*s,eb185H[0]*s+eb185V[0]*c,eb185H[1]*c-eb185V[1]*s,eb185H[1]*s+eb185V[1]*c]})();
function eb185Rotate(P,theta){const c=Math.cos(theta),s=Math.sin(theta),x=P[0]-eb185Q[0],y=P[1]-eb185Q[1];return[eb185Q[0]+c*x-s*y,eb185Q[1]+s*x+c*y]}
function eb185Project(P,theta=0){const R=eb185Rotate(P,theta),x=R[0]-eb185Q[0],y=R[1]-eb185Q[1];return[eb185M[0]+eb185A[0]*x+eb185A[1]*y,eb185M[1]+eb185A[2]*x+eb185A[3]*y]}
function eb185Inverse(P){const x=P[0]-eb185M[0],y=P[1]-eb185M[1],D=eb185H[0]*eb185V[1]-eb185H[1]*eb185V[0];return[eb185Q[0]+(x*eb185V[1]-y*eb185V[0])/D,eb185Q[1]+(y*eb185H[0]-x*eb185H[1])/D]}
function eb185Math(t,c){return[2.75+t*t*t,.5*t*t+c]}
function eb185FullD(curve){const P=[],N=800;for(let i=0;i<=N;i++){const t=curve.t0+(curve.t1-curve.t0)*i/N;if(i&&t>0&&curve.t0+(curve.t1-curve.t0)*(i-1)/N<0)P.push(curve.eval(0));P.push(curve.eval(t))}return P.map((p,i)=>(i?'L':'M')+p.map(eqPathNumber).join(' ')).join(' ')}
function eb185Build(st){
 const refs=st.m.paths.filter(r=>r.s.length&&Math.max(...r.s)<.1),rows=st.m.paths.filter(r=>!refs.includes(r));
 const curves=rows.map((r,i)=>{const pairs=Array.from(r.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g),m=>[+m[1],+m[2]]),a=eb185Inverse(pairs[0]),b=eb185Inverse(pairs.at(-1)),c=(i+1)*.28;
  const C={r,c,t0:Math.cbrt(a[0]-2.75),t1:Math.cbrt(b[0]-2.75),count:1600,math:t=>eb185Math(t,c),eval:t=>eb185Project(eb185Math(t,c)),tex:'y=\\tfrac12|x-2.75|^{2/3}+c,\\quad x=2.75+t^3,\\ y=\\tfrac12t^2+c'};
  C._eq=eqPrepareCurve(C,st.m);C.html=eqCurveSVG(C,eb185FullD(C),st);return C;
 });
 const aux=refs[0],A=eb185Project([2.75,.28]),B=eb185Project([2.75,7.28]),auxHTML=vectorPath({...aux,d:'M'+A.join(' ')+' L'+B.join(' ')},st.prefix);
 return{curves,refs,aux,A,B,auxHTML,full:curves.map(c=>c.html).join('')+auxHTML};
}
function eb185Transform(theta){
 // A R(theta) A^-1: this is the same mathematical rotation as eb185Project.
 const [a,b,c,d]=eb185A,D=a*d-b*c,C=Math.cos(theta),S=Math.sin(theta),u=a*C+b*S,v=-a*S+b*C,w=c*C+d*S,z=-c*S+d*C;
 const m00=(u*d-v*c)/D,m01=(-u*b+v*a)/D,m10=(w*d-z*c)/D,m11=(-w*b+z*a)/D;
 return'matrix('+[m00,m10,m01,m11,eb185M[0]-m00*eb185M[0]-m01*eb185M[1],eb185M[1]-m10*eb185M[0]-m11*eb185M[1]].map(eqPathNumber).join(' ')+')';
}
function eqBook185Update(e,p,ghost,guide){
 if(Number(e.vectorPage)!==185)return null;
 const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);const st=vectorState,plan=st._book185||(st._book185=eb185Build(st));
 let done='',active='',tip='',live,rotationTransform=null,doneKey='';
 const curveEnd=.72,lineEnd=.78,N=plan.curves.length;
 if(p>=1){done=st.m.paths.map(r=>vectorPath(r,st.prefix)).join('');live={tex:'y=\\tfrac12|x-2.75|^{2/3}+c,\\quad x=2.75,\\quad\\theta=7.5^\\circ',values:'c = 0.28, 0.56, …, 7.28 · θ = 7.5°',detail:'26条曲线及中线完成；整组按原书要求逆时针旋转7.5°。'};st.done=st.m.paths.length;doneKey='final'}
 else if(p<curveEnd){const v=Math.max(0,p)/curveEnd*N,k=Math.min(N-1,Math.floor(v)),f=v-k,c=plan.curves[k],trace=eqCurvePrefix(c,c._eq,f,st.m),P=c.math(trace.t);doneKey='curve'+k;done=plan.curves.slice(0,k).map(c=>c.html).join('');active=eqCurveSVG(c,trace.d,st);tip=dot(trace.point,red,3.2/st.scale);live={tex:c.tex,values:'c = '+eqNum(c.c)+' · t = '+eqNum(trace.t,4)+' · x = '+eqNum(P[0])+'，y = '+eqNum(P[1])+' · θ = 0°',detail:'第 '+(k+1)+' / '+N+' 条曲线；t连续变化，红点和曲线均由当前方程计算。'}}
 else if(p<lineEnd){const f=(p-curveEnd)/(lineEnd-curveEnd),y=.28+7*f,P=eb185Project([2.75,y]);doneKey='midline';done=plan.curves.map(c=>c.html).join('');active=vectorPath({...plan.aux,d:'M'+plan.A.join(' ')+' L'+P.join(' ')},st.prefix);tip=dot(P,red,3.2/st.scale);live={tex:'x=2.75,\\qquad y=0.28+7u,\\quad0\\le u\\le1',values:'u = '+eqNum(f,4)+' · x = 2.75，y = '+eqNum(y)+' · θ = 0°',detail:'自动补全原书的中线；随后整组曲线一起旋转。'}}
 else{const f=(p-lineEnd)/(1-lineEnd),theta=eb185Angle*f,P=eb185Rotate([2.75,7.28],theta);doneKey='rotation';rotationTransform=eb185Transform(theta);active='<g id="eb185Rotation" transform="'+rotationTransform+'">'+plan.full+'</g>';tip=dot(eb185Project([2.75,7.28],theta),red,3.2/st.scale);live={tex:'\\begin{gathered}y=\\tfrac12|x-2.75|^{2/3}+c,\\quad x=2.75\\\\P_\\theta=Q+\\begin{pmatrix}\\cos\\theta&-\\sin\\theta\\\\\\sin\\theta&\\cos\\theta\\end{pmatrix}(P-Q),\\quad Q=(2.75,3.78)\\end{gathered}',values:'θ = '+eqNum(theta*180/Math.PI,3)+'° · c = 0.28, 0.56, …, 7.28 · 中线上端：('+eqNum(P[0])+', '+eqNum(P[1])+')',detail:'整组曲线和中线一起逆时针旋转；图中坐标采用与原书相同的版面投影。'}}
 if(st._book185DoneKey!==doneKey){$('#vDone').innerHTML=done;st._book185DoneKey=doneKey}
 const rotationNode=rotationTransform&&st._book185Render==='rotation'?$('#eb185Rotation'):null;if(rotationNode?.setAttribute)rotationNode.setAttribute('transform',rotationTransform);else $('#vActive').innerHTML=active;st._book185Render=rotationTransform?'rotation':'trace';$('#vPoint').innerHTML=tip;return{readout:live.values,live,equationDriven:true};
}
