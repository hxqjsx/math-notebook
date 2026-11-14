// Operations for the later chapters. PDF paths define the fixed printed samples;
// transforms operate on whole objects rather than tracing a fabricated route.
function lateWhite(r){return (r.s.length&&Math.min(...r.s)>.95)||(r.f.length&&Math.min(...r.f)>.95)}
function latePoints(r){return Array.from(r.d.matchAll(/[ML]([-\d.]+)[ ,]+([-\d.]+)/g),m=>[+m[1],+m[2]])}
function lateBounds(rs){return rs.reduce((b,r)=>[Math.min(b[0],r.box[0]),Math.min(b[1],r.box[1]),Math.max(b[2],r.box[2]),Math.max(b[3],r.box[3])],[Infinity,Infinity,-Infinity,-Infinity])}
function lateCenter(rs,m){const b=lateBounds(rs);return[(Math.max(0,b[0])+Math.min(m.w,b[2]))/2,(Math.max(0,b[1])+Math.min(m.h,b[3]))/2]}
function lateVisible(r,m){return r.box[2]>0&&r.box[0]<m.w&&r.box[3]>0&&r.box[1]<m.h}
function lateHTML(rs,st){return rs.map(r=>vectorPath(r,st.prefix)).join('')}
function lateStroke(points,st,color=green,width=.75,extra=''){return '<path d="'+path(points)+'" fill="none" stroke="'+color+'" stroke-width="'+Math.max(width,.8/st.scale)+'" '+extra+'/>'}
function latePartial(points,q){let total=0,lengths=[];for(let i=1;i<points.length;i++){const l=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(l);total+=l}let left=Math.max(0,Math.min(1,q))*total,out=[points[0]],segment=0;for(let i=0;i<lengths.length;i++){segment=i;if(left>=lengths[i]){out.push(points[i+1]);left-=lengths[i]}else{const t=lengths[i]?left/lengths[i]:0;out.push([points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t]);break}}return{points:out,segment}}
function latePut(done,active,point=''){$('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=point}
function lateFinal(st){if(!st.lateFinalHTML)st.lateFinalHTML=lateHTML(st.m.paths,st);latePut(st.lateFinalHTML,'');st.done=st.m.paths.length;st.lateDone=-1}
function lateAngle(r){const ps=latePoints(r);if(ps.length!==2)return 0;return Math.atan2(ps[1][1]-ps[0][1],ps[1][0]-ps[0][0])*180/Math.PI}
function lateRotation(angle,c){return 'translate('+c.join(' ')+') rotate('+angle+') translate('+(-c[0])+' '+(-c[1])+')'}
function lateBlackHolePlan(st){
 const rs=st.m.paths,whites=rs.filter(r=>r.f.length&&lateWhite(r)),clusters=[];
 for(const r of whites){if(!clusters.length||r.box[0]<clusters.at(-1).at(-1).box[0]-.1)clusters.push([]);clusters.at(-1).push(r)}
 const circles=clusters.map(group=>{const b=lateBounds(group);return{c:[(b[0]+b[2])/2,(b[1]+b[3])/2],r:(b[3]-b[1])/2}});
 const ink=rs.filter(r=>r.s.length&&!lateWhite(r)),aux=ink.filter(r=>Math.max(...r.s)<.1),lines=ink.filter(r=>!aux.includes(r));
 // Keep original line order, but use circle exclusion only for the seven plain
 // horizontals. The U paths contain the prescribed vertical circle chords.
 return {circles,lines,aux,maskId:st.prefix+'late-circle-outside'};
}
function lateBlackHole(st,p,guide){
 const plan=st.latePlan||(st.latePlan=lateBlackHolePlan(st)),C=plan.circles;
 const circle=(c,i,q=1)=>'<circle cx="'+c.c[0]+'" cy="'+c.c[1]+'" r="'+c.r+'" fill="none" stroke="'+gold+'" stroke-width="'+(1/st.scale)+'" pathLength="1" stroke-dasharray="'+q+' 1"/>';
 if(p>=1){lateFinal(st);return{readout:'3 个圆 · 圆外 y=c/2，交点处改画竖线 · 辅助线已补全'}}
 if(p<.12){const v=p/.12*C.length,k=Math.floor(v);latePut('',C.slice(0,k).map(c=>circle(c,0)).join('')+(C[k]?circle(C[k],k,v-k):''));return{readout:'先画 3 个圆 · 第 '+Math.min(C.length,k+1)+' 个圆'}}
 const v=(p-.12)/.88*(plan.lines.length+1),k=Math.min(plan.lines.length,Math.floor(v)),q=v-k;
 const mask='<defs><mask id="'+plan.maskId+'" maskUnits="userSpaceOnUse" x="0" y="0" width="'+st.m.w+'" height="'+st.m.h+'"><rect width="'+st.m.w+'" height="'+st.m.h+'" fill="white"/>'+C.map(c=>'<circle cx="'+c.c[0]+'" cy="'+c.c[1]+'" r="'+c.r+'" fill="black"/>').join('')+'</mask></defs>';
 const render=(r,f=1)=>{const pts=latePoints(r),body=vectorPath(r,st.prefix,f);return pts.length===2&&Math.abs(pts[1][1]-pts[0][1])<.02?'<g mask="url(#'+plan.maskId+')">'+body+'</g>':body};
 let done=mask+plan.lines.slice(0,k).map(r=>render(r)).join(''),active='',label='';
 if(k<plan.lines.length){const r=plan.lines[k],pts=latePoints(r),part=latePartial(pts,q);active=render({...r,d:path(part.points)});const a=pts[part.segment],b=pts[part.segment+1];label=a&&b&&Math.abs(a[0]-b[0])<.02?'到达圆周交点 → 画竖直弦':'圆外画水平线 y=c/2'}else{active=plan.aux.map(r=>vectorPath(r,st.prefix,q)).join('');label='自动补全原图竖直辅助线'}
 latePut(done,active,guide?C.map(c=>circle(c,0)).join(''):'');return{readout:label+' · 已完成 '+k+' / '+plan.lines.length+' 条构造线'};
}
function lateRotationPlan(st,n){
 const rs=st.m.paths,m=st.m;let base=[],groups=[],pending=[],current=[],hasInk=false;
 if(n===168){for(const r of rs){if(current.length&&lateWhite(r)&&hasInk){groups.push({rs:current});current=[];hasInk=false}current.push(r);if(!lateWhite(r))hasInk=true}if(current.length)groups.push({rs:current})}
 else{
  let i=0;while(i<rs.length&&!lateWhite(rs[i]))base.push(rs[i++]);
  // White rectangle records delimit individual fixed random samples. Duplicate
  // fill/stroke records at the same location belong to the same rectangle.
  for(;i<rs.length;i++){const r=rs[i];if(lateWhite(r)&&current.length){const b=current.find(lateWhite)?.box,same=b&&r.box.every((x,k)=>Math.abs(x-b[k])<.05);if(hasInk||!same){groups.push({rs:current});current=[];hasInk=false}}current.push(r);if(!lateWhite(r))hasInk=true}if(current.length)groups.push({rs:current});
 }
 const visible=[];
 for(const g of groups){const ink=g.rs.filter(r=>!lateWhite(r)&&lateVisible(r,m));if(!ink.length){pending.push(...g.rs);continue}
  const ref=ink.find(r=>r.s.length&&Math.min(...r.s)>.1)||ink[0];let angle=lateAngle(ref);if(n===171){angle=((Math.round(angle/90)*90)%360+360)%360;if(angle===0)angle=180}
  const mask=g.rs.find(lateWhite),c=n===171&&mask?[(mask.box[0]+mask.box[2])/2,(mask.box[1]+mask.box[3])/2]:lateCenter(ink,m);
  visible.push({rs:g.rs,before:pending,angle,c});pending=[];
 }
 return{base,groups:visible,tail:pending};
}
function lateRandomRotation(st,p,n,guide){
 const plan=st.latePlan||(st.latePlan=lateRotationPlan(st,n));if(p>=1){lateFinal(st);return{readout:'原书固定随机样本 · '+plan.groups.length+' 次'+(n===171?'矩形区域旋转':'页面旋转')+'完成'}}
 const v=p*plan.groups.length,k=Math.min(plan.groups.length-1,Math.floor(v)),q=v-k,g=plan.groups[k];if(!g)return null;
 if(st.lateDone!==k){st.lateBaseHTML=lateHTML(plan.base,st)+plan.groups.slice(0,k).map(a=>lateHTML(a.before,st)+lateHTML(a.rs,st)).join('')+lateHTML(g.before,st);st.lateDone=k}
 // The pre-rotation patch is the exact source patch under the inverse rotation.
 // This keeps the book's random sample and layer order; no random re-sampling.
 const active='<g transform="'+lateRotation((q-1)*g.angle,g.c)+'">'+lateHTML(g.rs,st)+'</g>';
 let mark='';if(guide){mark='<circle cx="'+g.c[0]+'" cy="'+g.c[1]+'" r="'+(3/st.scale)+'" fill="'+gold+'"/>';const r=16/st.scale;mark+=lateStroke([[g.c[0]-r,g.c[1]],[g.c[0]+r,g.c[1]]],st,gold)+lateStroke([[g.c[0],g.c[1]-r],[g.c[0],g.c[1]+r]],st,gold)}
 latePut(st.lateBaseHTML,active,mark);return{readout:'原书固定随机样本 '+(k+1)+' / '+plan.groups.length+' · '+(n===171?'矩形区域':'围绕固定点')+'旋转 θ='+Math.abs(q*g.angle).toFixed(1)+'°'+(n===171?'（本次 '+g.angle+'°）':'')};
}
function lateBookPlan(st){
 const rs=st.m.paths,aux=rs.filter(r=>r.s.length&&Math.max(...r.s)<.1),curves=rs.filter(r=>!aux.includes(r)),ps=latePoints(aux[0]),dx=Math.abs(ps[1][0]-ps[0][0]),dy=Math.abs(ps[1][1]-ps[0][1]);
 // Source page is anisotropic. Recover its x/y scale ratio from the known
 // 7.5-degree rotation and the printed transformed vertical x=2.75.
 const ratio=dx/dy/Math.tan(7.5*Math.PI/180),center=lateCenter(aux,st.m);
 curves.sort((a,b)=>Math.abs((a.box[1]+a.box[3])/2-st.m.h/2)-Math.abs((b.box[1]+b.box[3])/2-st.m.h/2));
 return{curves,aux,ratio,center};
}
function lateOpenBook(st,p,guide){
 const plan=st.latePlan||(st.latePlan=lateBookPlan(st));if(p>=1){lateFinal(st);return{readout:'y=0.5(x−2.75)^(2/3)+c 与 x=2.75 · 整体逆时针旋转 7.5° 完成'}}
 const draw=Math.min(1,p/.68),rotation=Math.max(0,(p-.68)/.32),v=draw*(plan.curves.length+1),k=Math.min(plan.curves.length+1,Math.floor(v)),q=v-k;let body=lateHTML(plan.curves.slice(0,k),st);
 if(k<plan.curves.length)body+=vectorPath(plan.curves[k],st.prefix,q);else body+=plan.aux.map(r=>vectorPath(r,st.prefix,k>plan.curves.length?1:q)).join('');
 const c=plan.center,a=(1-rotation)*7.5,transform='translate('+c.join(' ')+') scale('+plan.ratio+' 1) rotate('+a+') scale('+(1/plan.ratio)+' 1) translate('+(-c[0])+' '+(-c[1])+')';
 latePut('','<g transform="'+transform+'">'+body+'</g>',guide?'<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+(3/st.scale)+'" fill="'+gold+'"/>':'');
 return{readout:p<.68?(k<plan.curves.length?'绘制 y=0.5(x−2.75)^(2/3)+c · 第 '+(k+1)+' / '+plan.curves.length+' 条曲线':'自动补全 x=2.75'):'整体逆时针旋转 θ='+(rotation*7.5).toFixed(2)+'° / 7.5°'};
}
function lateStairPlan(st){const rs=st.m.paths,top=latePoints(rs[14]),bottom=latePoints(rs[15]),groups=[];for(let j=0;j<7;j++){const a=top.slice(j*2,j*2+3),b=bottom.slice(j*2,j*2+3);groups.push({rs:[{...rs[14],d:path(a)},{...rs[15],d:path(b)},...rs.slice(j*2,j*2+2)],origin:a[0]})}return{groups,sides:rs.slice(16)}}
function lateStairs(st,p,guide){
 const plan=st.latePlan||(st.latePlan=lateStairPlan(st));if(p>=1){lateFinal(st);return{readout:'7 级台阶 · 上下轮廓与斜边完整连接 · 每级水平、竖直各 1 单位'}}
 const v=p*8,k=Math.min(7,Math.floor(v)),q=v-k;let done=plan.groups.slice(0,k).map(g=>lateHTML(g.rs,st)).join(''),active='',mark='';
 if(k===0){active=plan.groups[0].rs.map(r=>vectorPath(r,st.prefix,q)).join('')}
 else if(k<7){const prev=plan.groups[k-1],g=plan.groups[k],dx=(prev.origin[0]-g.origin[0])*(1-q),dy=(prev.origin[1]-g.origin[1])*(1-q);active='<g transform="translate('+dx+' '+dy+')">'+lateHTML(g.rs,st)+'</g>';if(guide)mark=lateStroke([prev.origin,g.origin],st,gold,1,'stroke-dasharray="4 4"')}
 else active=plan.sides.map(r=>vectorPath(r,st.prefix,q)).join('');
 latePut(done,active,mark);return{readout:k===7?'自动连接两侧外轮廓 · 完成施罗德阶梯':'第 '+(k+1)+' / 7 级 · 上下轮廓同步平移复制 · 水平、竖直各 1 单位'};
}
function lateConstructionUpdate(e,p,ghost,guide){
 const n=+e.page;if(![167,168,171,185,190].includes(n))return null;
 const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);const st=vectorState;
 if(n===167)return lateBlackHole(st,p,guide);if(n===168||n===171)return lateRandomRotation(st,p,n,guide);if(n===185)return lateOpenBook(st,p,guide);return lateStairs(st,p,guide);
}
