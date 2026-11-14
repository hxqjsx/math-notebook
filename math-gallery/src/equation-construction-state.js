// Live equations for the geometric construction engines. Values below are
// computed from the same phase variables and cached geometry used to draw.
// Capital X,Y denote calibrated picture coordinates (right/down); book units
// are used only when the printed value is known.
const ecCoordinateNote='X、Y 为图案校准坐标：向右、向下为正；数值与当前画面一致。';
function ecN(x,d=3){return Number(Number(x).toFixed(d)).toString()}
function ecQ(p){return '('+p.map(x=>ecN(x)).join(', ')+')'}
function ecV(p){return '\\binom{'+ecN(p[0])+'}{'+ecN(p[1])+'}'}
function ecClamp(x){return Math.max(0,Math.min(1,x))}
function ecEase(x){x=ecClamp(x);return x*x*(3-2*x)}
function ecMix(a,b,q){return a.map((v,i)=>v+(b[i]-v)*q)}
function ecState(tex,values,detail=ecCoordinateNote,extra={}){return{tex,values,detail,...extra}}
function ecLine(A,B,u,label='线段'){
 u=ecClamp(u);const d=B.map((v,i)=>v-A[i]),P=ecMix(A,B,u);
 return ecState('\\binom{X}{Y}='+ecV(A)+'+u'+ecV(d)+',\\quad0\\le u\\le1',label+' · u = '+ecN(u)+' · P = '+ecQ(P),ecCoordinateNote,{point:P,u});
}
function ecPolyline(P,q,label='分段直线'){
 if(P.length<2)return null;const lens=P.slice(1).map((b,i)=>Math.hypot(b[0]-P[i][0],b[1]-P[i][1]));let left=ecClamp(q)*lens.reduce((a,b)=>a+b,0),i=0;
 while(i<lens.length-1&&left>lens[i]){left-=lens[i];i++}
 const out=ecLine(P[i],P[i+1],lens[i]?left/lens[i]:0,label+' · 第 '+(i+1)+' 段');return out;
}
function ecPoints(r){return Array.from(r.d.matchAll(/[ML]([-\d.]+)[ ,]+([-\d.]+)/g),m=>[+m[1],+m[2]])}
function ecCircle(C,R,theta,label='圆弧'){
 const P=[C[0]+R*Math.cos(theta),C[1]+R*Math.sin(theta)];
 return ecState('\\binom{X}{Y}='+ecV(C)+'+'+ecN(R)+'\\binom{\\cos\\theta}{\\sin\\theta}',label+' · θ = '+ecN(theta)+' rad ('+ecN(theta*180/Math.PI,1)+'°) · r = '+ecN(R)+' · P = '+ecQ(P),ecCoordinateNote,{point:P,theta});
}
function ecTransform(C0,C,angle,sx=1,sy=sx,label='整体变换'){
 return ecState('P=C+R_\\alpha\\begin{pmatrix}s_x&0\\\\0&s_y\\end{pmatrix}(P_0-C_0),\\quad R_\\alpha=\\begin{pmatrix}\\cos\\alpha&-\\sin\\alpha\\\\\\sin\\alpha&\\cos\\alpha\\end{pmatrix}',label+' · α = '+ecN(angle,2)+'° · sₓ = '+ecN(sx,4)+' · sᵧ = '+ecN(sy,4)+' · C₀ = '+ecQ(C0)+' · C = '+ecQ(C));
}
function ecRawRecord(r,q,label='补充线'){
 if(!r)return null;const P=ecPoints(r);if(P.length>=2)return ecPolyline(P,q,label);
 const b=r.box;return ecState('X\\in['+ecN(b[0])+','+ecN(b[2])+'],\\quad Y\\in['+ecN(b[1])+','+ecN(b[3])+']',label+' · u = '+ecN(q),ecCoordinateNote);
}
function ecSequence(rs,q,label){if(!rs?.length)return null;const v=ecClamp(q)*(rs.length-1e-9),i=Math.floor(v);return ecRawRecord(rs[i],v-i,label)}
function ecTogether(rs,q,label){if(!rs?.length)return null;const out=ecRawRecord(rs[0],q,label+'（第1条）');out.values='共同进度 λ = '+ecN(q)+' · '+out.values;out.detail+=' '+rs.length+'条路径以同一个λ同时绘制；当前方程对应第1条路径的当前线段。';return out}
function ecMeta(e,st,r){const i=st.m.paths.indexOf(r),old=st.m.sourceIndexes[i];return typeof numericParameters==='undefined'?null:numericParameters[e.page]?.records?.[old]}
function ecHorizontal(e,st,r,q,label='水平线'){
 const P=ecPoints(r);if(P.length<2)return ecRawRecord(r,q,label);const meta=ecMeta(e,st,r),out=ecLine(P[0],P.at(-1),q,label);
 if(Number.isFinite(meta?.c)){out.tex='y='+ecN(meta.c)+';\\qquad '+out.tex;out.values='c = '+ecN(meta.c)+' · '+out.values}
 return out;
}
function ecTail(st,p,refs,start=.94){return ecSequence(refs,(p-start)/(1-start),'自动补充原图线条')}

function ecKoch(e,p,st){
 const target={50:0,51:1,52:2,53:3,54:5}[+e.page];if(p>=1)return ecState('N_n=3\\cdot4^n,\\quad\\ell_n=\\ell_0/3^n','n = '+target+' · Nₙ = '+3*4**target+' · ℓₙ/ℓ₀ = '+ecN(3**(-target),6),'每条旧边的中间三分之一替换成等边三角形的另外两边。');
 const k=Math.min(2,st.m.paths.length-1),levels=st.kochConstruction[k];
 if(!target)return ecPolyline(levels[0],p,'n = 0，等边三角形');
 const v=p*target,level=Math.floor(v),N=3*4**level,x=(v-level)*N,i=Math.min(N-1,Math.floor(x)),q=x-i,pts=levels[level+1].slice(i*4,i*4+5);let out;
 if(q<.24)out=ecLine(pts[1],pts[3],1,'标出并删除中间三分之一');else out=ecPolyline([pts[1],pts[2],pts[3]],(q-.24)/.76,'画等边三角形另外两边');
 out.tex='A_1=A+\\tfrac13(B-A),\\quad A_2=A+\\tfrac23(B-A),\\quad T=A_1+R_{\\pm60^\\circ}(A_2-A_1)\\\\'+out.tex;
 out.values='n = '+level+' → '+(level+1)+' · 当前旧边 '+(i+1)+' / '+N+' · '+out.values;return out;
}
function ecTransformPlan(e,p,st){
 const plan=st.transformPlan;if(!plan)return null;const {groups,kind}=plan,n=+e.page,initial=plan.initial??(['similarity','nestedPage','reptiles','circleGrid','cornerMask','street'].includes(kind)?1:0),v=Math.min(1-1e-10,p)*(groups.length-initial),done=Math.floor(v)+initial,f=v-Math.floor(v),g=groups[Math.min(groups.length-1,done)];
 if(!g)return null;
 if(kind==='similarity'){
  const a=g.motion;if(!a)return ecRawRecord(g.rs[0],1,'初始图形');const sp=1+f*(a.s-1),co=Math.cos(a.a),si=Math.sin(a.a),u=1-a.s*co,w=a.s*si,den=u*u+w*w;let C=ecMix(a.c,a.t,f);
  if(den>1e-10){const bx=a.t[0]-a.s*(co*a.c[0]-si*a.c[1]),by=a.t[1]-a.s*(si*a.c[0]+co*a.c[1]),O=[(u*bx-w*by)/den,(w*bx+u*by)/den],d=[a.c[0]-O[0],a.c[1]-O[1]],c=Math.cos(f*a.a),s=Math.sin(f*a.a);C=[O[0]+sp*(c*d[0]-s*d[1]),O[1]+sp*(s*d[0]+c*d[1])]}
  return ecTransform(a.c,C,f*a.a*180/Math.PI,sp,sp,'第 '+done+' 个副本');
 }
 if(kind==='wholeScale'){const a=groups[0];return ecTransform(a.center,a.center,0,1+p*(a.sx-1),1+p*(a.sy-1),'整页缩放')}
 if(kind==='rotationGroups')return ecTransform(g.center,g.center,f*g.angle,1,1,'第 '+(done+1)+' 组旋转');
 if(kind==='wholeRotate')return ecTransform(g.center,g.center,g.angle*p,1,1,'整页旋转');
 if(kind==='pageGrid'){const C=ecMix(g.from,g.center,f),s=1-f/2;return ecTransform(g.from,C,0,s,s,'第 '+(done+1)+' / 4 页')}
 if(kind==='nestedPage'){const a=1+f*(g.ratio-1),C=ecMix(g.previous,g.center,f);return ecTransform(g.previous,C,f*g.rotation,a,a,'第 '+done+' 次缩小')}
 if(kind==='circleGrid'){if(g.mode==='seed')return ecSequence(g.rs,f,'初始横线');const r=g.rs.find(x=>x.s.length)||g.rs[0],R=(r.box[2]-r.box[0])/2,C=ecMix(g.previous,g.center,f);return ecState('(X-a)^2+(Y-b)^2=r^2,\\qquad C(\\lambda)=(1-\\lambda)C_0+\\lambda C_1','λ = '+ecN(f)+' · C₀ = '+ecQ(g.previous)+' · C₁ = '+ecQ(g.center)+' · C = '+ecQ(C)+' · r = '+ecN(R))}
 if(kind==='chords'){
  const N={139:12,140:24,141:72}[n],circle=groups[0].rs[0],C=trCenter([circle]),R=(circle.box[2]-circle.box[0])/2;
  if(done===0)return ecCircle(C,R,-2*Math.PI*f,'先画圆（从右端点逆时针）');
  const P=ecPoints(g.rs[0]),k=Math.min(N,done),target=((2*k-1)%N)+1,out=ecLine(P[0],P.at(-1),f,'连接圆周两点');out.values='N = '+N+' · k = '+k+' → '+target+'（2k 对 N 取余，余0记作N） · '+out.values;out.detail+=' 圆周点按原书编号；当前线段端点为 A = '+ecQ(P[0])+'、B = '+ecQ(P.at(-1))+'。';return out;
 }
 return null;
}
function ecLocal(e,p,st){const n=+e.page,C=[st.m.w/2,st.m.h/2];
 if(n===108){if(p<.7)return ecTransform([99.64,103.185],[99.64,103.185],90*ecEase(p/.7),1,1,'左上区域旋转');const q=ecEase((p-.7)/.3);return ecTransform([.85,4.39],[.85,4.39],0,q,q,'白色三角形遮盖')}
 if(n===109){if(p<.9)return ecTransform([72.58,94.33],[72.58,94.33],-Math.atan(.5)*180/Math.PI*ecEase(p/.9),1,1,'黑线左侧旋转');return ecTogether(st.m.paths.slice(50),(p-.9)/.1,'同时补充分段边界')}
 if(n===110){if(p<.65)return ecTransform([324.85,250.05],[324.85,250.05],26.5*ecEase(p/.65),1,1,'中间区域旋转');const dx=-79.97*ecEase((p-.65)/.35);return ecTransform([0,0],[dx,0],0,1,1,'底部平移')}
 if(n===112)return ecTransform(C,C,135*ecEase(p),1,1,'整页顺时针旋转');
 if(n===113){const v=Math.min(5-1e-9,p*5),i=Math.floor(v)+1,q=ecEase(v-Math.floor(v));return ecTransform([-.35,290.2],[-.35,290.2],i*30*q,1,1,'k = '+i+'，绕左侧中点旋转')}
 if(n===115){if(p<.4){const q=ecEase(p/.4);return ecState('P=C+\\begin{pmatrix}1-2u&0\\\\0&1\\end{pmatrix}(P_0-C)','u = '+ecN(q)+' · 水平倍率 = '+ecN(1-2*q)+' · C = '+ecQ(C),ecCoordinateNote)}return ecTransform(C,C,-90*ecEase((p-.4)/.6),1,1,'翻转后逆时针旋转')}
 if(n===116){const m=st.localReptiles,v=Math.min(1-1e-10,p)*m.records.length,i=Math.floor(v),q=ecEase(v-i),r=m.records[i],a=[-120,120,0][r.index%3];return ecTransform(m.B,ecMix(m.B,r.C,q),a*q,1,1,'第 '+(i+1)+' 个爬行动物')}
 return null;
}
function ecSpecial(e,p,st){const n=+e.page;
 if(n===61){const m=st.scYoyo;if(p>=.94)return ecTail(st,p,m.refs);const v=p/.94*m.pairs.length,i=Math.floor(v),q=v-i,a=m.pairs[i],meta=ecMeta(e,st,a.line),c=meta?.c??.28*(i+1),k=meta?.k??i+1;
  if(q<.35){const X=.194*k*q/.35;return ecState('\\begin{aligned}y&='+ecN(c)+'\\\\x&=u\\cdot0.194k,\\quad0\\le u\\le1\\end{aligned}','c = '+ecN(c)+' · k = '+k+' · u = '+ecN(q/.35)+' · x = '+ecN(X),'圆与直线共用本行 c；先画横线，再画与它相切的圆。')}
  const theta=(q-.35)/.65*2*Math.PI,angle=-Math.PI/2+theta,out=ecCircle(a.arc.O,a.arc.R,angle,'转动画圆');out.tex='\\begin{aligned}x&=0.194k+0.14\\cos\\theta\\\\y&=c-0.14-0.14\\sin\\theta\\end{aligned}';out.values='c = '+ecN(c)+' · k = '+k+' · r = 0.14 · θ = '+ecN(angle)+' rad';out.detail='θ与圆规转动同步；画面纵轴向下，书中纵轴向上。';return out;
 }
 if(n===66||n===70){const m=st.scJoined;if(p>=.94)return ecTail(st,p,m.refs);const v=p/.94*m.groups.length,i=Math.floor(v),q=v-i,a=m.groups[i];
  if(n===66){if(q<.25)return ecRawRecord(a.right,q/.25,'第一条横线');if(q<.7)return ecCircle(a.circle.O,a.circle.R,a.circle.start+a.circle.sweep-(q-.25)/.45*a.circle.sweep,'半径为3行高的圆弧');return ecRawRecord(a.left,(q-.7)/.3,'第二条横线')}
  if(q<.6){const out=ecCircle(a.circle.O,a.circle.R,a.circle.start+q/.6*a.circle.sweep,'第 '+(i+1)+' 个半圆');out.detail+=' 原书半径序列写作 rₖ=1.1k+0.3，当前值按原图校准。';return out}const out=ecRawRecord(a.left,(q-.6)/.4,'从半圆交点延长');out.values+=' · 左右同时延长';return out;
 }
 if(n===74){const m=st.scCups;if(p>=.94)return ecTail(st,p,m.refs);const v=p/.94*m.curves.length,i=Math.floor(v),q=v-i,a=m.curves[i];return ecCircle(a.c.O,a.c.R,a.c.start+q*a.c.sweep,'交替半圆，第 '+(i+1)+' 个')}
 if(n===75){const m=st.scSynth;if(p>=.94)return ecTail(st,p,m.refs);const v=p/.94*m.rows.length,i=Math.floor(v),q=v-i,a=m.rows[i],meta=ecMeta(e,st,a.r);if(q<.27){const j=Math.max(0,Math.ceil(q/.27*a.pts.length)-1),P=a.pts[j];return ecState('y_j=c+0.3\\,(j\\bmod2),\\qquad x_j=x_0+j\\Delta x','c = '+ecN(meta?.c??i*.28)+' · j = '+j+' · 当前取点 = '+ecQ(P),'先按交替高度取点，然后依次连接。')}const x=(q-.27)/.73*(a.pts.length-1),j=Math.min(a.pts.length-2,Math.floor(x));return ecLine(a.pts[j],a.pts[j+1],x-j,'按取点顺序连接')}
 if(n===88){const m=st.scLimit;if(p>=.94)return ecTail(st,p,m.refs);const v=p/.94*(m.g.length-1),i=Math.floor(v),q=v-i,c0=7.25-(7.25-.28)/2**(i+1),c1=(c0+7.25)/2,c=c0+q*(c1-c0);return ecState('y=c(u),\\quad c(u)=(1-u)c_n+u c_{n+1},\\quad c_{n+1}=\\frac{c_n+7.25}{2}','n = '+(i+1)+' · u = '+ecN(q)+' · c = '+ecN(c,6)+' · cₙ = '+ecN(c0,6)+' · cₙ₊₁ = '+ecN(c1,6),'本条直线的位置由显示的 c 连续决定；到目标线的距离减半。')}
 if(n===65){const m=st.scBird;if(p<.6){const v=p/.6*m.lines.length,i=Math.floor(v);return ecHorizontal(e,st,m.lines[i],v-i)}if(p<.85){const q=(p-.6)/.25,[A,B,C]=m.pts,Q=[B[0],A[1]+q*(B[1]-A[1])];return ecState('Q(u)=(B_x,\\,(1-u)A_y+uB_y),\\quad A\\longrightarrow Q(u)\\longrightarrow C','u = '+ecN(q)+' · A = '+ecQ(A)+' · Q = '+ecQ(Q)+' · C = '+ecQ(C),ecCoordinateNote)}const q=(p-.85)/.15,r=m.circles[0],C=[(r.box[0]+r.box[2])/2,(r.box[1]+r.box[3])/2],R=(r.box[2]-r.box[0])/2*q;return ecState('(X-a)^2+(Y-b)^2\\le r(u)^2,\\quad r(u)=u r_0','u = '+ecN(q)+' · C = '+ecQ(C)+' · r = '+ecN(R),'逐渐扩大白圆，遮住圆内部原有线条。')}
 if(n===26){const m=st.scTangents;if(p>=.94)return ecTail(st,p,m.refs);if(p<.22)return ecState('y=x^2,\\quad y=-x^2','u = '+ecN(p/.22)+' · 同步生成两条抛物线','抛物线的坐标按原图平移与缩放。');const v=(p-.22)/.72*m.rows.length,i=Math.floor(v),q=v-i,r=m.rows[i],P=ecPoints(r);if(Math.abs(P[0][1]-P[1][1])<.1)return ecRawRecord(r,q,'水平线');const A=Math.abs(P[0][0]-190.2)<Math.abs(P[1][0]-190.2)?P[0]:P[1],B=A===P[0]?P[1]:P[0],dx=B[0]-A[0],dy=B[1]-A[1],a=Math.atan2(dy,Math.abs(dx))*Math.min(1,q/.45),s=q<.45?.35:.35+.65*(q-.45)/.55,L=Math.hypot(dx,dy)*s;return ecState('P=A+\\lambda\\binom{\\sigma\\cos\\alpha}{\\sin\\alpha}','A = '+ecQ(A)+' · α = '+ecN(a*180/Math.PI,2)+'° · λ = '+ecN(L)+' · σ = '+Math.sign(dx),ecCoordinateNote)}
 if(n===91||n===95){const m=st.scBoundary;if(p<.3){const q=p/.3;return ecState('x=\\sin(1/y)','边界构造进度 u = '+ecN(q),'黑色边界按纵坐标由上至下生成。')}const v=(p-.3)/.7*m.rows.length,i=Math.floor(v),q=v-i,r=m.rows[i],P=ecPoints(r);if(n===91)return ecLine(P[0],P.at(-1),q,'连接两条边界的交点');if(P.length===3)return ecState('P_1(u)=(1-u)A+uB,\\qquad P_2(u)=(1-u)C+uB','u = '+ecN(q)+' · A = '+ecQ(P[0])+' · B = '+ecQ(P[1])+' · C = '+ecQ(P[2]),ecCoordinateNote);return ecRawRecord(r,q,'连接边界点')}
 return null;
}
function ecBook(e,p,st){const n=+e.page;
 if(n===32){const m=st.bcParabolas;if(p<.055){const out=ecRawRecord(m.curves[0],p/.055,'初始抛物线');out.detail='沿原书黑色抛物线确定种子，随后整条旋转和平移。';return out}const v=(p-.055)/.945*(m.curves.length-1),i=Math.min(m.curves.length-2,Math.floor(v)),q=v-i,A=m.poses[i],B=m.poses[i+1],C=ecMix(A.vertex,B.vertex,q),angle=(A.angle+(B.angle-A.angle)*q-m.poses[0].angle)*180/Math.PI;return ecTransform(m.poses[0].vertex,C,angle,1,1,'整条抛物线，第 '+(i+2)+' 个位置')}
 if(n===45){const m=st.bcPolygons;if(p<.5){const v=p/.5*5,i=Math.min(4,Math.floor(v)),q=v-i,P=ecPoints(m.rs[i]),out=ecPolyline(P,q,'正'+(P.length-1)+'边形');out.values='n = '+(P.length-1)+' · '+out.values;return out}const q=ecClamp((p-.58)/.41),N=Math.min(999,Math.round(24*(999/24)**q)),u=p<.58?(p-.5)/.08:1;return ecState('P_j=C+r\\binom{\\cos(\\theta_0+2\\pi j/n)}{\\sin(\\theta_0+2\\pi j/n)},\\quad P_j\\longrightarrow P_{j+1}','n = '+N+' · Δθ = '+ecN(360/N)+'° · C = '+ecQ(m.C)+' · r = '+ecN(m.R)+' · 连边进度 u = '+ecN(u),ecCoordinateNote)}
 if(n===64){const m=st.bcCircularPatch;if(p<.32){const v=p/.32*m.base.length,i=Math.floor(v);return ecHorizontal(e,st,m.base[i],v-i)}if(p<.62){const q=(p-.32)/.3;return ecTransform(m.source,ecMix(m.source,m.C,q),90*q,1,1,'圆形区域旋转并平移')}const v=(p-.62)/.38*2,k=Math.min(1,Math.floor(v)),q=v-k,target=[2,0][k],C=bcCenter(m.patches[target].circle);return ecTransform(m.C,ecMix(m.C,C,q),0,1,1,'第 '+(k+2)+' 份圆形区域')}
 if(n===72){const m=st.bcReuleaux;if(p>.965)return ecTail(st,p,m.references,.965);const v=p/.965*m.curves.length,i=Math.floor(v),q=v-i,M=m.models[i];if(q<.24)return ecPolyline([...M.vertices,M.vertices[0]],Math.max(.01,q/.24),'等边三角形');const t=(q-.24)/.76*3,j=Math.min(2,Math.floor(t)),u=t-j,P=bcPartial(M.arcs[j],u),C=M.vertices[(j+2)%3],tip=P.at(-1),theta=Math.atan2(tip[1]-C[1],tip[0]-C[0]);return ecCircle(C,M.radius,theta,'第 '+(i+1)+' 个图形 · 第 '+(j+1)+' 段60°圆弧')}
 if(n===145){const m=st.bcWhiteLeaves;if(p<.3){const v=p/.3*m.base.length,i=Math.floor(v);return ecHorizontal(e,st,m.base[i],v-i)}if(p<.43)return eqPolarLeafState((p-.3)/.13);if(p<.55){const q=(p-.43)/.12,b=m.seed.box,X=b[0]-2+(b[2]-b[0]+4)*q;return ecState('\\Omega(u)=\\Omega_{\\rm leaf}\\cap\\{X\\le X_0+uW\\}','u = '+ecN(q)+' · 当前白色填充边界 X = '+ecN(X),'白色区域沿当前边界覆盖横线，叶形外保持原图。')}const v=(p-.55)/.45*3,k=Math.min(2,Math.floor(v)),q=v-k,a=m.poses[k];return ecTransform(a.ca,ecMix(a.ca,a.cb,q),a.a*q*180/Math.PI,1+(a.s-1)*q,1+(a.s-1)*q,'第 '+(k+2)+' 片叶子')}
 if(n===181){const m=st.bcBelly;if(p<.12)return ecCircle(m.circle.C,m.circle.R,-Math.PI/2+2*Math.PI*p/.12,'构造圆，书中圆心(2.75,3.775)，半径2');if(p>=.94)return ecTail(st,p,m.references);const v=(p-.12)/.82*m.rows.length,i=Math.floor(v),q=v-i,row=m.rows[i];if(!row.curves.length)return ecSequence(row.lines,q,'圆外横线');if(q<.32)return ecSequence(row.lines,q/.32,'圆外两段横线');const r=row.curves[0],out=ecRawRecord(r,(q-.32)/.68,'连接圆内抛物线');const meta=ecMeta(e,st,r);if(Number.isFinite(meta?.c))out.values='c ≈ '+ecN(meta.c)+' · '+out.values;out.detail='圆内图形保持两个圆周交点；按原图校准坐标显示当前边界点。';return out}
 return null;
}
function ecLate(e,p,st){const n=+e.page,m=st.latePlan;
 if(n===167){if(p<.12){const v=p/.12*m.circles.length,i=Math.floor(v),c=m.circles[i];return ecCircle(c.c,c.r,(v-i)*2*Math.PI,'第 '+(i+1)+' 个构造圆')}const v=(p-.12)/.88*(m.lines.length+1),i=Math.floor(v),q=v-i;if(i<m.lines.length){const r=m.lines[i],out=ecRawRecord(r,q,'水平线遇圆后转为竖直弦'),meta=ecMeta(e,st,r);if(meta?.text)out.values=meta.text+' · '+out.values;return out}return ecTogether(m.aux,q,'同时补充竖线')}
 if(n===168||n===171){const v=p*m.groups.length,i=Math.min(m.groups.length-1,Math.floor(v)),q=v-i,g=m.groups[i];return ecTransform(g.c,g.c,g.angle*q,1,1,'固定随机样本，第 '+(i+1)+' 次旋转')}
 if(n===185){if(p>=.68)return ecTransform(m.center,m.center,-(p-.68)/.32*7.5,1,1,'整页在原数学坐标中逆时针旋转');const v=p/.68*(m.curves.length+1),i=Math.floor(v),q=v-i;if(i<m.curves.length){const r=m.curves[i],meta=ecMeta(e,st,r);return ecState('y=0.5(x-2.75)^{2/3}+c','c = '+ecN(meta?.c??.28*(i+1))+' · 当前曲线描点进度 u = '+ecN(q),'本条曲线的c保持不变；生成曲线后，连同中线整体旋转7.5°。')}return ecState('x=2.75','x = 2.75 · u = '+ecN(q),'自动生成旋转前的中线。')}
 if(n===190){const v=p*8,i=Math.min(7,Math.floor(v)),q=v-i;if(i===7)return ecTogether(m.sides,q,'同时连接两侧轮廓');if(i===0)return ecTogether(m.groups[0].rs,q,'同时绘制第一层台阶');const A=m.groups[i-1].origin,B=m.groups[i].origin,D=[q*(B[0]-A[0]),q*(B[1]-A[1])];return ecTransform(A,ecMix(A,B,q),0,1,1,'第 '+(i+1)+' 级台阶；本次平移 d = '+ecQ(D))}
 return null;
}
function eqConstructionState(e,p,result,st){
 if(!st)return null;if(result?.live&&[107,111,121,139,140,141].includes(+e.page))return result.live;const n=+e.page;
 // Use the same actual last phase at completion, keeping a concrete equation
 // visible; the caller can label it “绘制完成”.
 if(p>=1&&n!==50&&n!==51&&n!==52&&n!==53&&n!==54)return eqConstructionState(e,1-1e-9,result,st);
 if(n>=50&&n<=54)return ecKoch(e,p,st);
 if(n>=56&&n<=59){const m=st.circleConstruction,a=m.sign*p*2*Math.PI,d=[m.C0[0]-m.O[0],m.C0[1]-m.O[1]],C=[m.O[0]+d[0]*Math.cos(a)-d[1]*Math.sin(a),m.O[1]+d[0]*Math.sin(a)+d[1]*Math.cos(a)];return ecState('(X-a_\\varphi)^2+(Y-b_\\varphi)^2=r^2,\\qquad C_\\varphi=O+R_\\varphi(C_0-O)','φ = '+ecN(a*180/Math.PI,2)+'° · 圆心 Cφ = '+ecQ(C)+' · r = '+ecN(m.R),ecCoordinateNote)}
 if(n>=46&&n<=49){const m=st.triangleConstruction,v=p*(m.curves.length-1),i=Math.min(m.curves.length-2,Math.floor(v)),q=v-i,A=constructionPoints(m.curves[i].d).slice(0,3),B=constructionPoints(m.curves[i+1].d).slice(0,3),ca=[0,1].map(k=>A.reduce((s,x)=>s+x[k],0)/3),cb=[0,1].map(k=>B.reduce((s,x)=>s+x[k],0)/3);let dp=0,cr=0;for(let j=0;j<3;j++){const a=[A[j][0]-ca[0],A[j][1]-ca[1]],b=[B[j][0]-cb[0],B[j][1]-cb[1]];dp+=a[0]*b[0]+a[1]*b[1];cr+=a[0]*b[1]-a[1]*b[0]}const angle=Math.atan2(cr,dp),co=Math.cos(angle),si=Math.sin(angle),tx=cb[0]-co*ca[0]+si*ca[1],ty=cb[1]-si*ca[0]-co*ca[1],den=(1-co)**2+si**2,O=den>1e-8?[((1-co)*tx-si*ty)/den,(si*tx+(1-co)*ty)/den]:ca;return ecTransform(O,O,q*angle*180/Math.PI,1,1,'第 '+(i+2)+' 个三角形')}
 if(n===20){if(p<.86){const stage=Math.min(2,Math.floor(Math.min(p,.749999)/.25)),N=[32,64,128][stage],q=p<.75?(p-stage*.25)/.25:1;return ecState('A_n=\\sum_{i=1}^n h_i\\Delta X,\\qquad\\Delta X=W/n','n = '+N+' · ΔX = '+ecN(st.m.w/N)+' · 当前列 '+Math.min(N,Math.floor(q*N)+1)+' / '+N,ecCoordinateNote+' 轮廓为原书城市天际线。')}return ecSequence(st.skylineConstruction.partitions,(p-.86)/.14,'原书分割线')}
 if(n===111){const angles=[30,120,210,300],v=p*4,i=Math.min(3,Math.floor(v));return ecTransform([st.m.w/2,st.m.h/2],[st.m.w/2,st.m.h/2],angles[i]*(v-i),1,1,'按原书文字，第 '+(i+1)+' 组；正角为顺时针')}
 const local=ecLocal(e,p,st);if(local)return local;
 if(st.transformPlan){const out=ecTransformPlan(e,p,st);if(out)return out}
 const special=ecSpecial(e,p,st);if(special)return special;
 const book=ecBook(e,p,st);if(book)return book;
 if(st.latePlan){const late=ecLate(e,p,st);if(late)return late}
 if(result?.numericRecord)return ecRawRecord(result.numericRecord,result.numericFraction||0,'原图几何构造');
 return null;
}
