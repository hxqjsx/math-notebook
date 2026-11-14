// Fidelity contract: every printed artwork path is part of the final frame.
// Formula text is shown separately. Printed reference lines are never optional guides.
const bookVectors=JSON.parse($('#vector-data').textContent);
let vectorState=null;
function vectorWhite(a){return a.length>0&&Math.min(...a)>.999}
function vectorColor(a){
 if(!a.length)return 'none';if(vectorWhite(a))return paper;
 const g=a.reduce((s,x)=>s+x,0)/a.length;if(g<.1)return '#254c42';
 const t=Math.min(1,(1-g)/.216),base=[251,250,245],ink=[23,107,88];return 'rgb('+base.map((b,i)=>Math.round(b+(ink[i]-b)*t)).join(',')+')';
}
function vectorPath(r,prefix,partial=1,extra=''){
 const stroke=vectorColor(r.s),fill=vectorColor(r.f),dash=r.dash?.length?' stroke-dasharray="'+r.dash.join(' ')+'" stroke-dashoffset="'+(r.phase||0)+'"':'';
 let attrs='stroke="'+stroke+'" fill="'+fill+'" fill-rule="'+(r.rule||'nonzero')+'" stroke-width="'+r.w+'" stroke-opacity="'+r.o+'" fill-opacity="'+(r.fo??1)+'" stroke-linecap="'+(['butt','round','square'][r.cap||0])+'" stroke-linejoin="'+(['miter','round','bevel'][r.join||0])+'"';
 if(partial<1&&r.s.length&&!dash)attrs+=' pathLength="1" stroke-dasharray="'+partial+' 1"';else attrs+=dash;
 let s='<path d="'+r.d+'" '+attrs+' '+extra+'/>';
 if(partial<1&&dash){const mid=prefix+'dashReveal';s='<defs><mask id="'+mid+'" maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000"><path d="'+r.d+'" fill="none" stroke="white" stroke-width="'+(r.w+2)+'" pathLength="1" stroke-dasharray="'+partial+' 1"/></mask></defs><g mask="url(#'+mid+')">'+s+'</g>'}
 if(partial<1&&r.f.length){const [x0,y0,x1,y1]=r.box,id=prefix+'fillReveal',horizontal=x1-x0>=y1-y0;s='<defs><clipPath id="'+id+'"><rect x="'+(x0-.01)+'" y="'+(y0-.01)+'" width="'+((x1-x0+.02)*(horizontal?partial:1))+'" height="'+((y1-y0+.02)*(horizontal?1:partial))+'"/></clipPath></defs><g clip-path="url(#'+id+')">'+s+'</g>'}
 for(const id of r.clip)s='<g clip-path="url(#'+prefix+id+')">'+s+'</g>';
 if(r.eraseMask)s='<g mask="url(#'+prefix+r.eraseMask+')">'+s+'</g>';
 return s;
}
function vectorPosition(e,p){const m=bookVectors[e.vectorPage],N=m.paths.length,stops=e.timeline||(e.vectorSplitAt?[[e.key==='heist'?.5:.4,e.vectorSplitAt],[1,N]]:[[1,N]]);let startP=0,startN=0,v=N;for(const[endP,endN]of stops){if(p<=endP){v=startN+(p-startP)/(endP-startP)*(endN-startN);break}startP=endP;startN=endN}const done=Math.min(N,Math.floor(v+1e-9));return{done,part:Math.max(0,v-done),N}}
function vectorFrame(e){const m=bookVectors[e.vectorPage];let box=(e.chapter.startsWith('第1章')&&e.page!=='20')||e.chapter.startsWith('第8章')?[0,0,m.w,m.h]:m.paths.reduce((b,r)=>[Math.min(b[0],Math.max(0,r.box[0])),Math.min(b[1],Math.max(0,r.box[1])),Math.max(b[2],Math.min(m.w,r.box[2])),Math.max(b[3],Math.min(m.h,r.box[3]))],[m.w,m.h,0,0]);const scale=Math.min(560/Math.max(1,box[2]-box[0]),330/Math.max(1,box[3]-box[1]));return{box,scale,tx:360-(box[0]+box[2])*scale/2,ty:220-(box[1]+box[3])*scale/2}}
function startVector(e,ghost,guide){
 const m=bookVectors[e.vectorPage],prefix='v'+e.vectorPage+'-',{scale,tx,ty}=vectorFrame(e);
 let defs='<clipPath id="'+prefix+'page"><rect width="'+m.w+'" height="'+m.h+'"/></clipPath>';
 for(const [id,d]of Object.entries(m.clips))defs+='<clipPath id="'+prefix+id+'"><path d="'+d+'" clip-rule="'+(m.clipRules?.[id]||'nonzero')+'"/></clipPath>';
 for(const [id,paths]of Object.entries(m.eraseMasks||{})){defs+='<mask id="'+prefix+id+'" maskUnits="userSpaceOnUse" x="0" y="0" width="'+m.w+'" height="'+m.h+'"><rect width="'+m.w+'" height="'+m.h+'" fill="white"/>'+paths.map(r=>'<path d="'+r.d+'" fill="'+(r.f.length?'black':'none')+'" stroke="'+(r.s.length?'black':'none')+'" stroke-width="'+r.w+'"/>').join('')+'</mask>'}
 $('#drawing').innerHTML='<defs>'+defs+'</defs><g transform="translate('+tx+' '+ty+') scale('+scale+')"><g clip-path="url(#'+prefix+'page)">'+(ghost?'<g opacity=".12">'+m.paths.map(r=>vectorPath(r,prefix)).join('')+'</g>':'')+'<g id="vDone"></g><g id="vActive"></g><g id="vPoint"></g></g>'+(guide?'<rect width="'+m.w+'" height="'+m.h+'" fill="none" stroke="'+gold+'" stroke-width="1" stroke-dasharray="5 5"/>':'')+'</g>';
 vectorState={key:e.id+ghost+guide,m,prefix,scale,done:0,ghost,guide};
}
function updateKoch(e,p,ghost,guide){
 const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);const st=vectorState;
 if(!st.levels)st.levels=st.m.paths.map(r=>{const pts=Array.from(r.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g),m=>[+m[1],+m[2]]);return Array.from({length:6},(_,lev)=>pts.filter((_,i)=>i%(4**(5-lev))===0))});
 let svg='',v=p*5,level=Math.min(4,Math.floor(v)),part=p===1?1:v-level;
 st.m.paths.forEach((r,k)=>{if(p===1){svg+=vectorPath(r,st.prefix);return}const prev=st.levels[k][level],next=st.levels[k][level+1],out=[];for(let i=0;i<next.length;i++){let seg=Math.min(prev.length-2,Math.floor(i/4)),j=i-seg*4,t=[0,1/3,.5,2/3,1][j],a=prev[seg],b=prev[seg+1],base=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];out.push([base[0]+(next[i][0]-base[0])*part,base[1]+(next[i][1]-base[1])*part])}svg+=vectorPath({...r,d:path(out)},st.prefix)});
 $('#vDone').innerHTML=svg;$('#vActive').innerHTML='';$('#vPoint').innerHTML='';
 return{readout:p===1?'第5次迭代完成 · 四重雪花与原图一致':'第'+level+' → '+(level+1)+'次迭代 · 同时替换每条边的中间三分之一'};
}
function updateVector(e,p,ghost,guide){
 if(e.kochRule)return updateKoch(e,p,ghost,guide);
 const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);
 const st=vectorState,{done,part,N}=vectorPosition(e,p),r=st.m.paths[done];
 if(done<st.done){$('#vDone').innerHTML='';st.done=0}
 if(done>st.done){let out='';for(let i=st.done;i<done;i++)out+=vectorPath(st.m.paths[i],st.prefix);$('#vDone').insertAdjacentHTML('beforeend',out);st.done=done}
 let active='',point='',mode=r?.aux?'自动补全原图线条':'逐笔描绘';
 if(r&&part>0){
  if(e.motion&&r.motion&&done>0){const m=r.motion,prev=st.m.paths[done-1],cx=m.c[0]+part*(m.t[0]-m.c[0]),cy=m.c[1]+part*(m.t[1]-m.c[1]);active='<g transform="translate('+cx+' '+cy+') rotate('+(part*m.a*180/Math.PI)+') scale('+(1+part*(m.s-1))+') translate('+(-m.c[0])+' '+(-m.c[1])+')">'+vectorPath({...prev,clip:[]},st.prefix)+'</g>';mode='旋转 / 缩放复制';if(guide)point='<path d="M'+m.c.join(' ')+' L'+m.t.join(' ')+'" stroke="'+gold+'" fill="none" stroke-width="1"/>';
  }else{active=vectorPath(r,st.prefix,part,'data-active-path="true"');if(!r.aux)mode=vectorWhite(r.f)||vectorWhite(r.s)?'涂白遮挡':r.f.length?'填充形状':'逐笔描绘'}
 }
 $('#vActive').innerHTML=active;$('#vPoint').innerHTML=point;
 if(r&&part>0&&!r.f.length&&!(e.motion&&r.motion)){const el=$('#vActive [data-active-path]');if(el&&el.getTotalLength){const pt=el.getPointAtLength(el.getTotalLength()*part);$('#vPoint').innerHTML=dot([pt.x,pt.y],red,3.1/st.scale)}}
 const split=e.key==='heist'?.5:.4,stage=e.vectorSplitAt?(p<split?'第一步 · ':p===split?'第一步完成 · 点击继续第二步 · ':'第二步 · '):'';
 return{readout:stage+(p===1?'已完成 · 原图全部线条':mode+' · '+done+' / '+N+' 条路径')};
}
