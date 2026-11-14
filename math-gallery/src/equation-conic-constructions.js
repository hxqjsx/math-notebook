// Equation-driven seed curves for the book's geometric constructions. The
// source points calibrate a quadratic once; animation always evaluates it at t.
function qcNumber(x,n=6){return Number(x.toFixed(n)).toString()}
function qcFit(r,angle=0){
 const source=bcPoints(r.d),co=Math.cos(angle),si=Math.sin(angle),P=source.map(([x,y])=>[x*co+y*si,-x*si+y*co]),mean=P.reduce((s,p)=>s+p[0],0)/P.length,span=Math.max(...P.map(p=>p[0]))-Math.min(...P.map(p=>p[0])),Q=P.map(([x,y])=>[(x-mean)/span,y]);
 const A=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>Q.reduce((s,[x])=>s+x**(i+j),0))),B=Array.from({length:3},(_,i)=>Q.reduce((s,[x,y])=>s+x**i*y,0)),[c,b,a]=bcSolve3(A,B),qa=a/span**2,qb=b/span-2*qa*mean,qc=c-b*mean/span+qa*mean**2,h=-qb/(2*qa),k=qc-qb**2/(4*qa),vertex=[h*co-k*si,h*si+k*co];
 return{source,P,angle,co,si,A:qa,B:qb,C:qc,h,k,vertex,error:Math.max(...P.map(([x,y])=>Math.abs(qa*(x-h)**2+k-y)))};
}
function qcTrace(c,f,st){const model=eqPrepareCurve(c,st.m),trace=eqCurvePrefix(c,model,f,st.m);return{...trace,svg:eqCurveSVG(c,trace.d,st)}}
function qcRender(st,done,active,tip){$('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=tip;st.done=0;st._eqDoneKey=null}
function qcResult(live){return{readout:live.values,live,equationDriven:true}}
function qcTangentModel(st){
 if(st.qcTangents)return st.qcTangents;
 const source=st.scTangents,fit=source.curves.map(r=>qcFit(r)),ox=190.2,oy=(fit[0].k+fit[1].k)/2,sy=72,A=fit.reduce((s,q)=>s+Math.abs(q.A),0)/fit.length,sx=Math.sqrt(sy/A);
 const curves=source.curves.map((r,i)=>{const f=fit[i],a=Math.sign(f.A),k=f.source.reduce((s,[X,Y])=>s+Y-a*A*(X-ox)**2,0)/f.source.length,c=(oy-k)/sy,sign=-a,t0=(f.source[0][0]-ox)/sx,t1=(f.source.at(-1)[0]-ox)/sx;return{r,t0,t1,c,sign,count:800,eval:t=>[ox+sx*t,oy-sy*(sign*t*t+c)],math:t=>[t,sign*t*t+c]}});
 return st.qcTangents={...source,fit,curves,ox,oy,sx,sy};
}
function qcTangents(e,p,ghost,guide){
 const original=specialCurvesUpdate(e,p,ghost,guide),st=vectorState,m=qcTangentModel(st);
 if(p<.22){const traces=m.curves.map(c=>qcTrace(c,p/.22,st)),tex='\\begin{aligned}y_1&='+m.curves[0].sign+'x_1^2+('+qcNumber(m.curves[0].c)+')\\\\y_2&='+m.curves[1].sign+'x_2^2+('+qcNumber(m.curves[1].c)+')\\end{aligned}',values=traces.map((q,i)=>'x'+(i+1)+' = '+eqNum(q.math[0],4)+'，y'+(i+1)+' = '+eqNum(q.math[1],4)).join(' · ');qcRender(st,'',traces.map(q=>q.svg).join(''),traces.map(q=>dot(q.point,red,2.7/st.scale)).join(''));return qcResult({tex,values,detail:'两条抛物线按原书平移；常数已代入。各红点和曲线由同一方程随 x 连续计算，坐标比例按印刷图校准。'})}
 if(p>=.94){const live=eqConstructionState(e,p,original,st);return{...original,live,equationDriven:true}}
 const v=(p-.22)/.72*m.rows.length,i=Math.min(m.rows.length-1,Math.floor(v)),q=v-i,r=m.rows[i],P=bcPoints(r.d),toMath=([X,Y])=>[(X-m.ox)/m.sx,(m.oy-Y)/m.sy];
 if(Math.abs(P[0][1]-P[1][1])<.1){const Q=P[0].map((x,k)=>x+(P[1][k]-x)*q),M=toMath(Q),c=M[1];$('#vPoint').innerHTML=dot(Q,red,2.7/st.scale);return qcResult({tex:'y='+qcNumber(c)+',\\qquad x=t',values:'c = '+eqNum(c,5)+' · t = x = '+eqNum(M[0],4)+' · y = '+eqNum(M[1],4),detail:'横线未穿过上下抛物线的外侧部分，保留水平线；当前 x 连续生成线段。'})}
 const contact=Math.abs(P[0][0]-m.ox)<Math.abs(P[1][0]-m.ox)?P[0]:P[1],outer=contact===P[0]?P[1]:P[0],dx=outer[0]-contact[0],dy=outer[1]-contact[1],alpha=Math.atan2(dy,Math.abs(dx)),lambda=Math.hypot(dx,dy)*q,sigma=Math.sign(dx),Q=[contact[0]+sigma*lambda*Math.cos(alpha),contact[1]+lambda*Math.sin(alpha)],M=toMath(Q);
 // The printed segments are not exact derivatives of the printed parabolas.
 // Expose the actual line and rotation, rather than invent a derivative value.
 $('#vActive').innerHTML=eqCurveSVG({r},path([contact,Q]),st);$('#vPoint').innerHTML=dot(contact,gold,2.8/st.scale)+dot(Q,red,2.7/st.scale);
 return qcResult({tex:'\\begin{aligned}X&='+qcNumber(contact[0])+'+('+sigma+')\\lambda\\cos\\alpha\\\\Y&='+qcNumber(contact[1])+'+\\lambda\\sin\\alpha\\end{aligned}',values:'α = '+eqNum(alpha,6)+' rad · λ = '+eqNum(lambda,4)+' · (X,Y) = '+eqPointText(Q)+' · (x,y) = '+eqPointText(M),detail:'从原书接点按图中的方向连续延长线段。X、Y 为图案坐标（向右、向下为正）；线段斜率按原书印刷位置标定。'})
}
function qcSeedModel(st){
 if(st.qcSeed)return st.qcSeed;const r=st.bcParabolas.curves[0],f=qcFit(r,st.bcParabolas.poses[0].angle),s=72,b=f.A*s*s,t0=(f.P[0][0]-f.h)/s,t1=(f.P.at(-1)[0]-f.h)/s;
 return st.qcSeed={r,t0,t1,fit:f,s,b,count:1000,eval:t=>[f.vertex[0]+s*t*f.co-b*t*t*f.si,f.vertex[1]+s*t*f.si+b*t*t*f.co],math:t=>[s*t,b*t*t]};
}
function qcRotatingSeed(e,p,ghost,guide){
 const original=bookConstructionUpdate(e,p,ghost,guide),st=vectorState,c=qcSeedModel(st);if(p>=.055)return{...original,live:eqConstructionState(e,p,original,st),equationDriven:true};
 const trace=qcTrace(c,p/.055,st),f=c.fit,tex='P(t)=\\binom{'+qcNumber(f.vertex[0])+'}{'+qcNumber(f.vertex[1])+'}+\\begin{pmatrix}\\cos\\alpha&-\\sin\\alpha\\\\\\sin\\alpha&\\cos\\alpha\\end{pmatrix}\\binom{72t}{'+qcNumber(c.b)+'t^2}';
 qcRender(st,'',trace.svg,dot(trace.point,red,2.8/st.scale));return qcResult({tex,values:'α = '+eqNum(f.angle,6)+' rad · t = '+eqNum(trace.t,5)+' · P = '+eqPointText(trace.point),detail:'黑色种子是实际计算的二次曲线：t 连续改变时生成轨迹。原书没有给出数值方程，顶点、比例与初始方向按原图标定；随后整条旋转和平移。'});
}
function qcBellyModels(st){
 if(st.qcBelly)return st.qcBelly;const m=st.bcBelly,{C,R}=m.circle,s=R/2,models=new Map();for(const r of m.curves){const f=qcFit(r),h=(f.h-C[0])/s+2.75,k=(C[1]-f.k)/s+3.775,a=-f.A*s,t0=(f.source[0][0]-C[0])/s+2.75,t1=(f.source.at(-1)[0]-C[0])/s+2.75;models.set(r,{r,fit:f,a,h,k,t0,t1,count:800,math:t=>[t,a*(t-h)**2+k],eval:t=>[C[0]+s*(t-2.75),C[1]-s*(a*(t-h)**2+k-3.775)]})}return st.qcBelly={models,s,C,R};
}
function qcBelly(e,p,ghost,guide){
 const original=bookConstructionUpdate(e,p,ghost,guide),st=vectorState,m=st.bcBelly,cal=qcBellyModels(st);
 if(p<.12){const theta=-Math.PI/2+2*Math.PI*p/.12,M=[2.75+2*Math.cos(theta),3.775-2*Math.sin(theta)],P=[cal.C[0]+cal.R*Math.cos(theta),cal.C[1]+cal.R*Math.sin(theta)];$('#vPoint').innerHTML+=dot(P,red,2.8/st.scale);return qcResult({tex:'\\begin{aligned}(x-2.75)^2+(y-3.775)^2&=4\\\\x(\\theta)&=2.75+2\\cos\\theta\\\\y(\\theta)&=3.775-2\\sin\\theta\\end{aligned}',values:'θ = '+eqNum(theta,6)+' rad · x = '+eqNum(M[0],5)+' · y = '+eqNum(M[1],5),detail:'以书中圆心 (2.75,3.775)、半径 2 生成圆；当前点与 θ 由相同参数方程计算。'})}if(p>=.94)return{...original,live:eqConstructionState(e,p,original,st),equationDriven:true};
 const v=(p-.12)/.82*m.rows.length,i=Math.min(m.rows.length-1,Math.floor(v)),q=v-i,row=m.rows[i];if(!row.curves.length||q<.32){const f=row.curves.length?q/.32:q,vline=f*row.lines.length,j=Math.min(row.lines.length-1,Math.floor(vline)),u=vline-j,r=row.lines[j],P=bcPoints(r.d),Q=P[0].map((a,k)=>a+(P.at(-1)[k]-a)*u),x=(Q[0]-cal.C[0])/cal.s+2.75,y=(cal.C[1]-row.y)/cal.s+3.775;$('#vPoint').innerHTML+=dot(Q,red,2.8/st.scale);return qcResult({tex:'y=\\frac c2='+qcNumber(y)+',\\qquad x=t',values:'c = '+eqNum(2*y,5)+' · t = x = '+eqNum(x,5)+' · y = '+eqNum(y,5),detail:'第 '+(i+1)+' / '+m.rows.length+' 行；先随 x 生成圆外横线，与圆相交时再接上圆内抛物线。'})}
 const f=(q-.32)/.68,curves=row.curves.map(r=>cal.models.get(r)),traces=curves.map(c=>qcTrace(c,f,st)),c=curves[0],trace=traces[0],height=(cal.C[1]-row.y)/cal.s+3.775,parameter=2*height,id=st.prefix+'_bookCircle';
 $('#vActive').innerHTML='<g clip-path="url(#'+id+')">'+traces.map(a=>a.svg).join('')+'</g>';
 $('#vPoint').innerHTML+='<g clip-path="url(#'+id+')">'+traces.map(a=>dot(a.point,red,2.8/st.scale)).join('')+'</g>';
 return qcResult({tex:'\\begin{aligned}y_{\\rm line}&=\\frac c2='+qcNumber(height)+'\\\\x(t)&=t\\\\y(t)&='+qcNumber(c.a)+'(t-('+qcNumber(c.h)+'))^2+('+qcNumber(c.k)+')\\end{aligned}',values:'c = '+eqNum(parameter,5)+' · t = x = '+eqNum(trace.t,5)+' · y = '+eqNum(trace.math[1],5),detail:'第 '+(i+1)+' / '+m.rows.length+' 行；圆内抛物线由当前 t 直接计算，连接水平线与圆的交点。圆心 (2.75,3.775)、半径 2；原书未指定抛物线系数，所列系数按印刷曲线标定。'});
}
function eqConicConstructionUpdate(e,p,ghost,guide){if(!e.vectorPage)return null;switch(+e.page){case 26:return qcTangents(e,p,ghost,guide);case 32:return qcRotatingSeed(e,p,ghost,guide);case 181:return qcBelly(e,p,ghost,guide);default:return null}}
