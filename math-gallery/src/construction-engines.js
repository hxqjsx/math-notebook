// Construction engines follow the operation stated in the book. The final source
// records remain authoritative for framing, printed details and final geometry.
function constructionPoints(d){return Array.from(d.matchAll(/[ML]([-\d.]+)[ ,]+([-\d.]+)/g),m=>[+m[1],+m[2]])}
function constructionPartial(points,q){
 const lengths=points.slice(1).map((b,i)=>Math.hypot(b[0]-points[i][0],b[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);let remaining=Math.max(0,Math.min(1,q))*total,out=[points[0]];
 for(let i=0;i<lengths.length;i++){if(remaining>=lengths[i]){out.push(points[i+1]);remaining-=lengths[i]}else{const t=lengths[i]?remaining/lengths[i]:0;out.push([points[i][0]+t*(points[i+1][0]-points[i][0]),points[i][1]+t*(points[i+1][1]-points[i][1])]);break}}return out;
}
function constructionInit(e,ghost,guide){const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);return vectorState}
function constructionFinal(st){$('#vDone').innerHTML=st.m.paths.map(r=>vectorPath(r,st.prefix)).join('');$('#vActive').innerHTML='';$('#vPoint').innerHTML='';st.done=st.m.paths.length}
function constructionKoch(e,p,ghost,guide){
 const page=+e.page,target={50:0,51:1,52:2,53:3,54:5}[page],st=constructionInit(e,ghost,guide);
 if(p>=1){constructionFinal(st);return{readout:target?'n = '+target+' · 每个雪花 Nₙ = 3×4ⁿ = '+(3*4**target)+' 条边 · ℓₙ = ℓ₀ / 3ⁿ':'n = 0 · 以等边三角形为起点（3条边）'}}
 if(!st.kochConstruction){
  st.kochConstruction=st.m.paths.map(r=>{const pts=constructionPoints(r.d);const expected=3*4**target+1;
   if(pts.length!==expected)throw Error('Koch source topology mismatch on p.'+page+': '+pts.length+' instead of '+expected);
   return Array.from({length:target+1},(_,lev)=>pts.filter((_,i)=>i%4**(target-lev)===0));});
 }
 let completed='',active='',point='';
 if(target===0){st.m.paths.forEach((r,k)=>{const pts=st.kochConstruction[k][0],part=constructionPartial(pts,p);completed+=vectorPath({...r,d:path(part)},st.prefix)});$('#vDone').innerHTML=completed;$('#vActive').innerHTML='';$('#vPoint').innerHTML='';return{readout:'n = 0 · 连接三个顶点 · 已画 '+Math.min(3,Math.floor(p*3))+' / 3 条边'}}
 const v=p*target,level=Math.min(target-1,Math.floor(v)),phase=v-level,edgeCount=3*4**level,at=phase*edgeCount,done=Math.min(edgeCount-1,Math.floor(at)),q=at-done;
 st.m.paths.forEach((r,k)=>{
  const old=st.kochConstruction[k][level],next=st.kochConstruction[k][level+1];let d='';
  for(let i=0;i<edgeCount;i++){
   if(i<done){d+=path(next.slice(i*4,i*4+5))+' ';continue}
   if(i>done){d+=path([old[i],old[i+1]])+' ';continue}
   const a=next[i*4],third=next[i*4+1],tip=next[i*4+2],twoThird=next[i*4+3],b=next[i*4+4];
   // Keep the two outer thirds. The middle third is deleted before the new sides appear.
   d+=path([a,third])+' '+path([twoThird,b])+' ';
   if(q<.24){d+=path([third,twoThird])+' ';active+=line([third,twoThird],gold,Math.max(r.w,1.7/st.scale))}
   else{const sides=constructionPartial([third,tip,twoThird],(q-.24)/.76);d+=path(sides)+' ';active+=line(sides,gold,Math.max(r.w,1.7/st.scale));if(k===2&&sides.length)point=dot(sides.at(-1),red,3/st.scale)}
   if(guide)active+=line([third,twoThird],'#a6b49e',.8/st.scale,'stroke-dasharray="'+(3/st.scale)+' '+(3/st.scale)+'"');
  }
  completed+=vectorPath({...r,d},st.prefix);
 });
 $('#vDone').innerHTML=completed;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=point;
 const operation=q<.24?'标出中间 1/3':'删去中段，画等边三角形的另外两边';
 return{readout:'n = '+level+' → '+(level+1)+' · '+operation+' · 已替换 '+done+' / '+edgeCount+' 条边 · 新边长 ℓ / 3'};
}
function constructionCircle(e,p,ghost,guide){
 const N={56:3,57:6,58:12,59:32}[+e.page],st=constructionInit(e,ghost,guide);
 if(!st.circleConstruction){const curves=st.m.paths.filter(r=>r.s.length&&!r.f.length&&Math.max(...r.s)>.1&&Math.min(...r.s)<.999),references=st.m.paths.filter(r=>!curves.includes(r));const anchor=references.find(r=>r.f.length&&Math.max(...r.f)<.1);if(!anchor||curves.length!==N)throw Error('Circle construction source mismatch p.'+e.page);const O=[(anchor.box[0]+anchor.box[2])/2,(anchor.box[1]+anchor.box[3])/2],b=curves[0].box,C0=[(b[0]+b[2])/2,(b[1]+b[3])/2],b1=curves[1].box,C1=[(b1[0]+b1[2])/2,(b1[1]+b1[3])/2],u=[C0[0]-O[0],C0[1]-O[1]],w=[C1[0]-O[0],C1[1]-O[1]],sign=Math.sign(u[0]*w[1]-u[1]*w[0]);st.circleConstruction={curves,references,O,C0,sign,R:(b[2]-b[0])/2}}
 const model=st.circleConstruction,delta=360/N,v=p*N,done=Math.min(N,Math.floor(v)+1),rotation=model.sign*v*delta;
 if(p>=1){constructionFinal(st);return{readout:'φ = 360° · Δφ = '+delta+'° · '+N+' 个圆 · 圆心 Cφ = O + Rφ(C₀ − O)'}}
 let complete=model.curves.slice(0,done).map(r=>vectorPath(r,st.prefix)).join('')+model.references.map(r=>vectorPath(r,st.prefix)).join('');
 const [ox,oy]=model.O,moving='<g transform="translate('+ox+' '+oy+') rotate('+rotation+') translate('+(-ox)+' '+(-oy)+')">'+vectorPath({...model.curves[0],clip:[],w:1.6/st.scale},st.prefix)+'</g>';
 let help='';if(guide){const a=rotation*Math.PI/180,dx=model.C0[0]-ox,dy=model.C0[1]-oy,C=[ox+dx*Math.cos(a)-dy*Math.sin(a),oy+dx*Math.sin(a)+dy*Math.cos(a)];help='<circle cx="'+ox+'" cy="'+oy+'" r="'+Math.hypot(dx,dy)+'" fill="none" stroke="'+gold+'" stroke-width="'+(.8/st.scale)+'" stroke-dasharray="'+(4/st.scale)+' '+(4/st.scale)+'"/>'+line([model.O,C],gold,.8/st.scale)}
 $('#vDone').innerHTML=complete;$('#vActive').innerHTML=moving;$('#vPoint').innerHTML=help;
 return{readout:'φ = '+(p*360).toFixed(1)+'° · Δφ = '+delta+'° · 已留下 '+done+' / '+N+' 个圆 · (x−aφ)²+(y−bφ)²=R²'};
}
function constructionTriangle(e,p,ghost,guide){
 const N={46:3,47:10,48:30,49:90}[+e.page],st=constructionInit(e,ghost,guide);
 if(!st.triangleConstruction){const curves=st.m.paths.filter(r=>r.s.length&&!r.f.length&&Math.max(...r.s)>.1&&Math.min(...r.s)<.999),references=st.m.paths.filter(r=>!curves.includes(r));if(curves.length!==N)return null;st.triangleConstruction={curves,references}}
 const model=st.triangleConstruction;
 if(p>=1){constructionFinal(st);return{readout:'已旋转复制 '+N+' 个三角形 · 每次保持三边长度不变'}}
 const v=p*(N-1),i=Math.min(N-2,Math.floor(v)),q=v-i,prev=model.curves[i],next=model.curves[i+1],m=+e.page===46?null:next.motion;
 let active='',angle=0;
 if(m){angle=m.a;const co=Math.cos(angle),si=Math.sin(angle),cx=m.c[0],cy=m.c[1],tx=m.t[0]-co*cx+si*cy,ty=m.t[1]-si*cx-co*cy,den=(1-co)**2+si**2;
  if(den>1e-8){const ox=((1-co)*tx-si*ty)/den,oy=(si*tx+(1-co)*ty)/den;active='<g transform="translate('+ox+' '+oy+') rotate('+(q*angle*180/Math.PI)+') translate('+(-ox)+' '+(-oy)+')">'+vectorPath({...prev,clip:[],w:1.5/st.scale},st.prefix)+'</g>';if(guide)active+=dot([ox,oy],gold,2.5/st.scale)}
 }
 // Some p.46 source paths contain repeated black reference triangles between grey copies.
 // Fit a true rigid transform from the three vertices when no adjacent transform is stored.
 if(!active){const A=constructionPoints(prev.d).slice(0,3),B=constructionPoints(next.d).slice(0,3),ca=[0,1].map(k=>A.reduce((s,x)=>s+x[k],0)/3),cb=[0,1].map(k=>B.reduce((s,x)=>s+x[k],0)/3);let dotp=0,cross=0;for(let j=0;j<3;j++){const ax=A[j][0]-ca[0],ay=A[j][1]-ca[1],bx=B[j][0]-cb[0],by=B[j][1]-cb[1];dotp+=ax*bx+ay*by;cross+=ax*by-ay*bx}angle=Math.atan2(cross,dotp);const co=Math.cos(angle),si=Math.sin(angle),tx=cb[0]-co*ca[0]+si*ca[1],ty=cb[1]-si*ca[0]-co*ca[1],den=(1-co)**2+si**2;if(den>1e-8){const ox=((1-co)*tx-si*ty)/den,oy=(si*tx+(1-co)*ty)/den;active='<g transform="translate('+ox+' '+oy+') rotate('+(q*angle*180/Math.PI)+') translate('+(-ox)+' '+(-oy)+')">'+vectorPath({...prev,clip:[],w:1.5/st.scale},st.prefix)+'</g>'}else active=vectorPath(prev,st.prefix)}
 $('#vDone').innerHTML=model.curves.slice(0,i+1).map(r=>vectorPath(r,st.prefix)).join('')+model.references.map(r=>vectorPath(r,st.prefix)).join('');$('#vActive').innerHTML=active;$('#vPoint').innerHTML='';
 return{readout:'旋转复制 · 第 '+(i+2)+' / '+N+' 个三角形 · 本次 φ = '+(Math.abs(q*angle)*180/Math.PI).toFixed(1)+'° · 三边长度不变'};
}
function constructionSkylineIntervals(points,x,height){
 const crossings=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];if((a[0]<=x&&x<b[0])||(b[0]<=x&&x<a[0]))crossings.push(a[1]+(x-a[0])/(b[0]-a[0])*(b[1]-a[1]))}crossings.sort((a,b)=>a-b);const spans=[];for(let i=0;i+1<crossings.length;i+=2){const lo=Math.max(0,crossings[i]),hi=Math.min(height,crossings[i+1]);if(hi>lo)spans.push([lo,hi])}return spans;
}
function constructionSkyline(e,p,ghost,guide){
 const st=constructionInit(e,ghost,guide);
 if(!st.skylineConstruction){const outline=st.m.paths.find(r=>r.s.length&&Math.max(...r.s)<.1&&constructionPoints(r.d).length>10);if(!outline)throw Error('Original skyline contour missing');const roof=constructionPoints(outline.d),last=roof.at(-1),first=roof[0],polygon=[...roof,[last[0],st.m.h],[first[0],st.m.h],first],partitions=st.m.paths.filter(r=>r!==outline);st.skylineConstruction={outline,polygon,partitions,grids:new Map()}}
 const model=st.skylineConstruction;
 if(p>=1){constructionFinal(st);return{readout:'原书轮廓与分割线 · 矩形面积近似（补充）：Aₙ = Σ hᵢ Δx'}}
 const grid=n=>{if(!model.grids.has(n)){const dx=st.m.w/n,rects=Array.from({length:n},(_,i)=>({x:i*dx,w:dx,spans:constructionSkylineIntervals(model.polygon,(i+.5)*dx,st.m.h)}));model.grids.set(n,rects)}return model.grids.get(n)};
 const rectsSVG=(n,count,part,opacity=1)=>{let svg='';for(let i=0;i<n&&i<=count;i++){const r=grid(n)[i],amount=i<count?1:part;if(amount<=0)continue;for(const[y0,y1]of r.spans)svg+='<rect x="'+r.x+'" y="'+y0+'" width="'+r.w*amount+'" height="'+(y1-y0)+'" fill="'+green+'" fill-opacity="'+(.12*opacity)+'" stroke="'+green+'" stroke-opacity="'+(.75*opacity)+'" stroke-width="'+(.65/st.scale)+'"/>'}return svg};
 let done=vectorPath(model.outline,st.prefix),active='',readout='';
 if(p<.75){const stage=Math.min(2,Math.floor(p/.25)),n=[32,64,128][stage],q=(p-stage*.25)/.25,v=q*n,count=Math.min(n,Math.floor(v)),part=v-count;
  // Start at the former 30% stage (32 columns): coarse 8/16-column
  // overhang rectangles have been omitted. The finer stages keep the original
  // geometric Riemann approximation of the actual printed polygon,
  // including overhangs; no invented analytic skyline function is used.
  active=rectsSVG(n,count,part);readout='矩形逼近（补充）· n = '+n+' · Δx = W/'+n+' · Aₙ = Σ hᵢ Δx · 已画 '+count+' / '+n+' 列';
 }else if(p<.86){const q=(p-.75)/.11;active=rectsSVG(128,128,0,1-q);readout='n = 128 · 对照原书轮廓 · 自动收起面积示意、保留原图';}
 else{const q=(p-.86)/.14,v=q*model.partitions.length,count=Math.min(model.partitions.length,Math.floor(v)),part=v-count;done+=model.partitions.slice(0,count).map(r=>vectorPath(r,st.prefix)).join('');if(count<model.partitions.length&&part>0)active=vectorPath(model.partitions[count],st.prefix,part);readout='自动补全原书分割线 · '+count+' / '+model.partitions.length+' 条 · Δx 越小，矩形近似越细';}
 $('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML='';return{readout};
}
function constructionUpdate(e,p,ghost,guide){const n=+e.page;if(n===20)return constructionSkyline(e,p,ghost,guide);if(n>=50&&n<=54)return constructionKoch(e,p,ghost,guide);if(n>=56&&n<=59)return constructionCircle(e,p,ghost,guide);if(n>=46&&n<=49)return constructionTriangle(e,p,ghost,guide);return null}
