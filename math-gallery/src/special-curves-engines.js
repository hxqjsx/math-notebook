// Book-specific constructions. Source geometry supplies the printed positions;
// circle arcs, joining lines and midpoint motions are constructed geometrically.
// The last frame always renders the original records without modification.
function scPoints(d){return Array.from(d.matchAll(/[ML]([\-\d.]+)[ ,]+([\-\d.]+)/g),m=>[+m[1],+m[2]])}
function scInit(e,ghost,guide){if(!vectorState||vectorState.key!==e.id+ghost+guide)startVector(e,ghost,guide);return vectorState}
function scGrey(r){return r.s.length&&!r.f.length&&Math.max(...r.s)>.1&&Math.min(...r.s)<.999}
function scBlack(r){return r.s.length&&!r.f.length&&Math.max(...r.s)<.1}
function scMix(a,b,q){return[a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q]}
function scRender(st,done,active='',help=''){ $('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=help;st.done=0 }
function scSource(st,rs){return rs.map(r=>vectorPath(r,st.prefix)).join('')}
function scFinal(st,readout){scRender(st,scSource(st,st.m.paths));st.done=st.m.paths.length;return{readout}}
function scLine(st,r,pts){return vectorPath({...r,d:path(pts)},st.prefix)}
function scHint(st,pts){return line(pts,gold,.85/st.scale,'stroke-dasharray="'+(3/st.scale)+' '+(3/st.scale)+'"')}
function scPartial(pts,q){if(!pts.length)return[];const x=Math.max(0,Math.min(1,q))*(pts.length-1),i=Math.min(pts.length-2,Math.floor(x));return i<0?pts:[...pts.slice(0,i+1),scMix(pts[i],pts[i+1],x-i)]}
function scCircle(r){
 const pts=scPoints(r.d),n=pts.length,closed=Math.hypot(pts[0][0]-pts[n-1][0],pts[0][1]-pts[n-1][1])<.1;
 const a=pts[0],b=pts[Math.floor((n-1)/(closed?3:2))],c=pts[closed?Math.floor(2*(n-1)/3):n-1];
 const den=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));if(Math.abs(den)<1e-7)return null;
 const aa=a[0]**2+a[1]**2,bb=b[0]**2+b[1]**2,cc=c[0]**2+c[1]**2;
 const O=[(aa*(b[1]-c[1])+bb*(c[1]-a[1])+cc*(a[1]-b[1]))/den,(aa*(c[0]-b[0])+bb*(a[0]-c[0])+cc*(b[0]-a[0]))/den],R=Math.hypot(a[0]-O[0],a[1]-O[1]);
 let sweep=0,old=Math.atan2(a[1]-O[1],a[0]-O[0]);const start=old;
 for(let i=1;i<n;i++){const ang=Math.atan2(pts[i][1]-O[1],pts[i][0]-O[0]);let d=ang-old;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;sweep+=d;old=ang}
 return{O,R,start,sweep,pts};
}
function scArc(st,r,c,q,start=c.start,sweep=c.sweep){const a=start+q*sweep,N=Math.max(2,Math.ceil(Math.abs(q*sweep)*22)),pts=Array.from({length:N+1},(_,i)=>{const t=start+(a-start)*i/N;return[c.O[0]+c.R*Math.cos(t),c.O[1]+c.R*Math.sin(t)]});return{svg:scLine(st,r,pts),tip:pts.at(-1)}}
function scTail(st,p,core,refs,readout){if(p<.94)return null;const q=(p-.94)/.06,v=q*refs.length,i=Math.min(refs.length,Math.floor(v));scRender(st,scSource(st,core)+scSource(st,refs.slice(0,i)),i<refs.length?vectorPath(refs[i],st.prefix,v-i):'');return{readout:readout+' · 自动补齐原图辅助线'}}

function scYoyo(e,p,ghost,guide){
 const st=scInit(e,ghost,guide);if(!st.scYoyo){const g=st.m.paths.filter(scGrey),pairs=[];for(let i=0;i+1<g.length;i+=2)pairs.push({line:g[i],circle:g[i+1],arc:scCircle(g[i+1])});st.scYoyo={g,pairs,refs:st.m.paths.filter(r=>!g.includes(r))}}
 const m=st.scYoyo;if(p>=1)return scFinal(st,'y=c；(x−0.194k)²+(y−c+0.14)²=0.14² · 全部完成');const tail=scTail(st,p,m.g,m.refs,'圆与横线已连接');if(tail)return tail;
 const v=p/.94*m.pairs.length,i=Math.min(m.pairs.length-1,Math.floor(v)),q=v-i,a=m.pairs[i],end=scPoints(a.line.d),O=a.arc.O,R=a.arc.R;let done=scSource(st,m.pairs.slice(0,i).flatMap(x=>[x.line,x.circle])),active='',help='';
 if(q<.35){active=scLine(st,a.line,[end[0],scMix(end[0],end[1],q/.35)]);help=dot(scMix(end[0],end[1],q/.35),red,2.5/st.scale)}else{done+=vectorPath(a.line,st.prefix);const arc=scArc(st,a.circle,a.arc,(q-.35)/.65,-Math.PI/2,2*Math.PI);active=arc.svg;help=line([O,arc.tip],gold,.85/st.scale)+dot(O,gold,2/st.scale)+dot(arc.tip,red,2.5/st.scale)}
 scRender(st,done,active,help);return{readout:'第 '+(i+1)+' 行 · '+(q<.35?'y=c，横线延伸到 x=0.194k':'以 (0.194k,c−0.14) 为圆心，半径 0.14，转过 '+(((q-.35)/.65)*360).toFixed(0)+'°')};
}
function scBird(e,p,ghost,guide){
 const st=scInit(e,ghost,guide);if(!st.scBird){const bend=st.m.paths.find(r=>scBlack(r)&&scPoints(r.d).length===3),circles=st.m.paths.filter(r=>r.f.length||r.d.includes('C')),lines=st.m.paths.filter(r=>r!==bend&&!circles.includes(r));st.scBird={bend,circles,lines,pts:scPoints(bend.d)}}
 const m=st.scBird;if(p>=1)return scFinal(st,'k≠13：y=c；k=13：连接低点；最后添加白圆 · 全部完成');let done='',active='',help='',readout='';
 if(p<.6){const v=p/.6*m.lines.length,i=Math.min(m.lines.length-1,Math.floor(v)),q=v-i;done=scSource(st,m.lines.slice(0,i));const pts=scPoints(m.lines[i].d);active=scLine(st,m.lines[i],[pts[0],scMix(pts[0],pts[1],q)]);readout='k≠13 · 依次画 y=c 的横线 · '+i+' / '+m.lines.length}
 else if(p<.85){done=scSource(st,m.lines);const q=(p-.6)/.25,[A,B,C]=m.pts,Q=[B[0],A[1]+q*(B[1]-A[1])];active=scLine(st,m.bend,[A,Q,C]);help=dot(Q,gold,3/st.scale);if(guide)help+=scHint(st,[A,C]);readout='k=13 · 两端固定，连接略偏中心的低点'}
 else{done=scSource(st,m.lines)+vectorPath(m.bend,st.prefix);const q=(p-.85)/.15,r=m.circles[0],cx=(r.box[0]+r.box[2])/2,cy=(r.box[1]+r.box[3])/2;active='<g transform="translate('+cx+' '+cy+') scale('+q+') translate('+(-cx)+' '+(-cy)+')">'+scSource(st,m.circles)+'</g>';readout='在弯折线上方添加白圆 · 遮住被圆覆盖的线段'}
 scRender(st,done,active,help);return{readout};
}
function scJoinedArcs(e,p,ghost,guide){
 const page=+e.page,st=scInit(e,ghost,guide);if(!st.scJoined){const g=st.m.paths.filter(scGrey),groups=[];for(let i=0;i+2<g.length;i+=3)groups.push({right:g[i],arc:g[i+1],left:g[i+2],circle:scCircle(g[i+1])});st.scJoined={g,groups,refs:st.m.paths.filter(r=>!g.includes(r))}}
 const m=st.scJoined;if(p>=1)return scFinal(st,page===66?'r=3×行高，四分之一圆连接两条横线 · 全部完成':'rₖ=1.1k+0.3，半圆与第 k 条直线相交后延长 · 全部完成');const tail=scTail(st,p,m.g,m.refs,'圆弧与水平线已连接');if(tail)return tail;
 const v=p/.94*m.groups.length,i=Math.min(m.groups.length-1,Math.floor(v)),q=v-i,a=m.groups[i];let done=scSource(st,m.groups.slice(0,i).flatMap(x=>[x.right,x.arc,x.left])),active='',help='',label='';
 if(page===66){const rp=scPoints(a.right.d),lp=scPoints(a.left.d);if(q<.25){const Q=scMix(rp[0],rp.at(-1),q/.25);active=scLine(st,a.right,[rp[0],Q]);help=dot(Q,red,2.5/st.scale);label='画第一条水平线'}else if(q<.7){done+=vectorPath(a.right,st.prefix);const arc=scArc(st,a.arc,a.circle,(q-.25)/.45,a.circle.start+a.circle.sweep,-a.circle.sweep);active=arc.svg;help=line([a.circle.O,arc.tip],gold,.85/st.scale)+dot(a.circle.O,gold,2/st.scale)+dot(arc.tip,red,2.5/st.scale);label='r=3×行高 · 转过 '+(((q-.25)/.45)*90).toFixed(0)+'°'}else{done+=vectorPath(a.right,st.prefix)+vectorPath(a.arc,st.prefix);const Q=scMix(lp[0],lp.at(-1),(q-.7)/.3);active=scLine(st,a.left,[lp[0],Q]);help=dot(Q,red,2.5/st.scale);label='从圆弧端点延长第二条水平线'}}
 else{if(q<.6){const arc=scArc(st,a.arc,a.circle,q/.6);active=arc.svg;help=line([a.circle.O,arc.tip],gold,.85/st.scale)+dot(a.circle.O,gold,2/st.scale)+dot(arc.tip,red,2.5/st.scale);label='半圆：rₖ=1.1k+0.3；圆心 (−1,c)'}else{done+=vectorPath(a.arc,st.prefix);const t=(q-.6)/.4;for(const r of[a.left,a.right]){let pts=scPoints(r.d);if(r===a.right)pts=pts.slice().reverse();const Q=scMix(pts[0],pts.at(-1),t);active+=scLine(st,r,[pts[0],Q]);help+=dot(Q,red,2.5/st.scale)}label='半圆与第 k 条线相交 · 向两侧延长水平线'}}
 scRender(st,done,active,help);return{readout:'第 '+(i+1)+' / '+m.groups.length+' 组 · '+label};
}
function scCups(e,p,ghost,guide){
 const st=scInit(e,ghost,guide);if(!st.scCups){const g=st.m.paths.filter(scGrey),curves=g.map(r=>({r,c:scCircle(r),base:scPoints(r.d)[0][1]})).sort((a,b)=>Math.abs(a.base-b.base)>.08?b.base-a.base:a.r.box[0]-b.r.box[0]);st.scCups={g,curves,refs:st.m.paths.filter(r=>!g.includes(r))}}
 const m=st.scCups;if(p>=1)return scFinal(st,'沿 y=c 交替画上半圆、下半圆 · 全部完成');const tail=scTail(st,p,m.g,m.refs,'交替半圆已完成');if(tail)return tail;
 const v=p/.94*m.curves.length,i=Math.min(m.curves.length-1,Math.floor(v)),q=v-i,a=m.curves[i],arc=scArc(st,a.r,a.c,q),A=a.c.pts[0],B=a.c.pts.at(-1);let help=line([a.c.O,arc.tip],gold,.8/st.scale)+dot(arc.tip,red,2.3/st.scale);if(guide)help+=scHint(st,[[0,a.base],[st.m.w,a.base]])+dot(A,gold,1.8/st.scale)+dot(B,gold,1.8/st.scale);
 scRender(st,scSource(st,m.curves.slice(0,i).map(x=>x.r)),arc.svg,help);return{readout:'y=c · '+(a.c.O[1]>(a.r.box[1]+a.r.box[3])/2?'上半圆':'下半圆')+' · 圆心沿基线移动 · θ='+Math.min(180,q*Math.abs(a.c.sweep)*180/Math.PI).toFixed(0)+'°'};
}
function scSynth(e,p,ghost,guide){
 const st=scInit(e,ghost,guide);if(!st.scSynth){const g=st.m.paths.filter(scGrey);st.scSynth={g,rows:g.map(r=>({r,pts:scPoints(r.d)})),refs:st.m.paths.filter(r=>!g.includes(r))}}
 const m=st.scSynth;if(p>=1)return scFinal(st,'均匀取 x，纵坐标在 c 与 c+0.3 间交替，依次连线 · 全部完成');const tail=scTail(st,p,m.g,m.refs,'折线已完成');if(tail)return tail;
 const v=p/.94*m.rows.length,i=Math.min(m.rows.length-1,Math.floor(v)),q=v-i,a=m.rows[i];let active='',help='',readout='';if(q<.27){const count=Math.max(1,Math.ceil(q/.27*a.pts.length));help=a.pts.slice(0,count).map(pt=>dot(pt,gold,2.3/st.scale)).join('');readout='均匀取 x；y 在 c 和 c+0.3 之间交替取值'}else{const t=(q-.27)/.73,pts=scPartial(a.pts,t);active=scLine(st,a.r,pts);help=a.pts.map(pt=>dot(pt,gold,1.5/st.scale)).join('')+dot(pts.at(-1),red,2.5/st.scale);readout='按 x 的顺序用直线连接已取的点 · '+Math.floor(t*(a.pts.length-1))+' / '+(a.pts.length-1)+' 段'}
 if(guide)help+=scHint(st,[[0,a.r.box[1]],[st.m.w,a.r.box[1]]])+scHint(st,[[0,a.r.box[3]],[st.m.w,a.r.box[3]]]);scRender(st,scSource(st,m.g.slice(0,i)),active,help);return{readout:'第 '+(i+1)+' 行 · '+readout};
}
function scLimit(e,p,ghost,guide){
 const st=scInit(e,ghost,guide);if(!st.scLimit){const g=st.m.paths.filter(scGrey).sort((a,b)=>b.box[1]-a.box[1]);st.scLimit={g,refs:st.m.paths.filter(r=>!g.includes(r)),target:g.at(-1).box[1]}}
 const m=st.scLimit;if(p>=1)return scFinal(st,'c←(c+7.25)/2 · 与 y=7.25 的距离逐次减半 · 全部完成');const tail=scTail(st,p,m.g,m.refs,'距离逐次减半');if(tail)return tail;
 const v=p/.94*(m.g.length-1),i=Math.min(m.g.length-2,Math.floor(v)),q=v-i,r=m.g[i],next=m.g[i+1],y=r.box[1]+q*(next.box[1]-r.box[1]),pts=[[r.box[0],y],[r.box[2],y]],x=st.m.w*.55,mid=(r.box[1]+m.target)/2;let help=line([[0,m.target],[st.m.w,m.target]],gold,.8/st.scale,'stroke-dasharray="5 4"')+line([[x,r.box[1]],[x,m.target]],gold,.8/st.scale)+line([[x-4,mid],[x+4,mid]],gold,1.2/st.scale)+dot([x,y],red,2.4/st.scale);
 scRender(st,scSource(st,m.g.slice(0,i+1)),scLine(st,next,pts),help);const c=7.25-(7.25-.28)/2**(i+1),cn=(c+7.25)/2;return{readout:'c₀=0.28 · 第 '+(i+1)+'→'+(i+2)+' 次减半：c='+c.toFixed(6)+' → '+cn.toFixed(6)+' · 剩余距离 d/2'};
}
function scVerticalPart(r,q,h){const pts=scPoints(r.d).filter(p=>p[1]>=-.1&&p[1]<=h+.1).sort((a,b)=>a[1]-b[1]);if(pts.length<2)return[];const ymax=pts[0][1]+(pts.at(-1)[1]-pts[0][1])*q,out=[];for(let i=0;i<pts.length;i++){if(pts[i][1]<=ymax)out.push(pts[i]);else{if(i)out.push(scMix(pts[i-1],pts[i],(ymax-pts[i-1][1])/(pts[i][1]-pts[i-1][1])));break}}return out.length?out:[pts[0],pts[0]]}
function scBoundary(e,p,ghost,guide){
 const st=scInit(e,ghost,guide),page=+e.page;if(!st.scBoundary){const boundary=st.m.paths.filter(scBlack),rows=st.m.paths.filter(scGrey);st.scBoundary={boundary,rows,refs:st.m.paths.filter(r=>!boundary.includes(r)&&!rows.includes(r))}}
 const m=st.scBoundary;if(p>=1)return scFinal(st,page===91?'x=sin(1/y)；在两条黑曲线之间连接水平线 · 全部完成':'先画 x=sin(1/y)，再连极值点；其余画 y=c · 全部完成');let done='',active='',help='',readout='';
 if(p<.3){const q=p/.3;for(const r of m.boundary){const pts=scVerticalPart(r,q,st.m.h);active+=scLine(st,r,pts);if(pts.length)help+=dot(pts.at(-1),red,2.5/st.scale)}readout='先生成黑色曲线 x=sin(1/y) · 随 y 变化确定 x · '+Math.round(q*100)+'%'}else{const q=(p-.3)/.7,v=q*m.rows.length,i=Math.min(m.rows.length-1,Math.floor(v)),t=v-i,r=m.rows[i],pts=scPoints(r.d);done=scSource(st,m.boundary)+scSource(st,m.rows.slice(0,i));
  if(page===91){const A=pts[0],B=pts.at(-1),Q=scMix(A,B,t);active=scLine(st,r,[A,Q]);help=dot(A,gold,2.2/st.scale)+dot(B,gold,2.2/st.scale)+dot(Q,red,2.5/st.scale);if(guide)help+=scHint(st,[[0,A[1]],[st.m.w,A[1]]]);readout='y=c · 找到两条边界的交点，再连接水平线 · 第 '+(i+1)+' / '+m.rows.length+' 条'}
  else{if(pts.length===3){const A=pts[0],B=pts[1],C=pts[2];active=scLine(st,r,[scMix(A,B,t),A])+' '+scLine(st,r,[scMix(C,B,t),C]);help=dot(B,gold,2.6/st.scale);readout='从页面两端连接黑曲线的极值点'}else{let A=pts[0],B=pts.at(-1);if(Math.abs(A[1]-B[1])>.1&&A[0]>50){[A,B]=[B,A]}active=scLine(st,r,[A,scMix(A,B,t)]);help=dot(B,gold,2.6/st.scale)+dot(scMix(A,B,t),red,2.5/st.scale);readout=Math.abs(A[1]-B[1])>.1?'将页面端点连到黑曲线的极值点':'其余部分：y=c'}if(guide)help+=scHint(st,[[0,pts[0][1]],[st.m.w,pts[0][1]]]);readout+=' · 第 '+(i+1)+' / '+m.rows.length+' 条'}
 }
 scRender(st,done,active,help);return{readout};
}
function scTangents(e,p,ghost,guide){
 const st=scInit(e,ghost,guide);if(!st.scTangents){const curves=st.m.paths.filter(r=>scBlack(r)&&scPoints(r.d).length>10),rows=st.m.paths.filter(scGrey);st.scTangents={curves,rows,refs:st.m.paths.filter(r=>!curves.includes(r)&&!rows.includes(r))}}
 const m=st.scTangents;if(p>=1)return scFinal(st,'抛物线与横线相交时作切线，否则保留水平线 · 全部完成');const tail=scTail(st,p,[...m.curves,...m.rows],m.refs,'切线与水平线已完成');if(tail)return tail;let done='',active='',help='',readout='';
 if(p<.22){const q=p/.22;for(const r of m.curves){const pts=scPartial(scPoints(r.d),q);active+=scLine(st,r,pts);help+=dot(pts.at(-1),red,2.5/st.scale)}readout='先画上下两条抛物线 · y=±x²（按原图平移）'}else{const v=(p-.22)/.72*m.rows.length,i=Math.min(m.rows.length-1,Math.floor(v)),q=v-i,r=m.rows[i],pts=scPoints(r.d);done=scSource(st,m.curves)+scSource(st,m.rows.slice(0,i));const isHorizontal=Math.abs(pts[0][1]-pts[1][1])<.1;if(isHorizontal){const Q=scMix(pts[0],pts[1],q);active=scLine(st,r,[pts[0],Q]);help=dot(Q,red,2.5/st.scale);readout='未与抛物线相交 · 画水平线'}else{const center=190.2,contact=Math.abs(pts[0][0]-center)<Math.abs(pts[1][0]-center)?pts[0]:pts[1],outer=contact===pts[0]?pts[1]:pts[0],dx=outer[0]-contact[0],dy=outer[1]-contact[1],qrot=Math.min(1,q/.45),angle=Math.atan2(dy,Math.abs(dx))*qrot,span=q<.45?.35:.35+.65*(q-.45)/.55,L=Math.hypot(dx,dy)*span,Q=[contact[0]+Math.sign(dx)*L*Math.cos(angle),contact[1]+L*Math.sin(angle)];active=scLine(st,r,[contact,Q]);help=dot(contact,gold,3/st.scale);if(guide)help+=scHint(st,[[0,contact[1]],[st.m.w,contact[1]]]);readout='在接点作抛物线的切线 · 调整方向后延长'}readout+=' · 第 '+(i+1)+' / '+m.rows.length+' 条'}
 scRender(st,done,active,help);return{readout};
}
function specialCurvesUpdate(e,p,ghost,guide){const n=+e.page;if(!e.vectorPage)return null;if(n===61)return scYoyo(e,p,ghost,guide);if(n===65)return scBird(e,p,ghost,guide);if(n===66||n===70)return scJoinedArcs(e,p,ghost,guide);if(n===74)return scCups(e,p,ghost,guide);if(n===75)return scSynth(e,p,ghost,guide);if(n===88)return scLimit(e,p,ghost,guide);if(n===91||n===95)return scBoundary(e,p,ghost,guide);if(n===26)return scTangents(e,p,ghost,guide);return null}
