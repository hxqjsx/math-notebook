// Original PDF vector paths, with progressive strokes and verified similarity transforms.
const bookVectors=JSON.parse($('#vector-data').textContent);
let vectorState=null;
function vectorWhite(a){return a.length>0&&Math.min(...a)>.95}
function vectorColor(a){return !a.length?'none':vectorWhite(a)?paper:Math.max(...a)<.25?'#254c42':green}
function vectorPath(r,prefix,partial=1,extra=''){
 const white=vectorWhite(r.s)||vectorWhite(r.f),stroke=vectorColor(r.s),fill=vectorColor(r.f);
 let s='<path d="'+r.d+'" stroke="'+stroke+'" fill="'+fill+'" fill-rule="evenodd" stroke-width="'+Math.max(r.w,.75)+'" opacity="'+(r.o*(r.f.length?partial:1))+'" stroke-linejoin="round"'+(partial<1&&r.s.length?' pathLength="1" stroke-dasharray="'+partial+' 1"':'')+' '+extra+'/>';
 for(const id of r.clip)s='<g clip-path="url(#'+prefix+id+')">'+s+'</g>';
 return s;
}
function vectorPosition(e,p){const m=bookVectors[e.vectorPage],N=m.paths.length,k=e.vectorSplitAt;const v=k?(p<.4?p/.4*k:k+(p-.4)/.6*(N-k)):p*N;return {done:Math.min(N,Math.floor(v+1e-9)),part:v-Math.floor(v+1e-9),N}}
function startVector(e,ghost,guide){
 const m=bookVectors[e.vectorPage],prefix='v'+e.vectorPage+'-';let box=e.chapter.startsWith('第8章')?[0,0,m.w,m.h]:m.paths.reduce((b,r)=>[Math.min(b[0],Math.max(0,r.box[0])),Math.min(b[1],Math.max(0,r.box[1])),Math.max(b[2],Math.min(m.w,r.box[2])),Math.max(b[3],Math.min(m.h,r.box[3]))],[m.w,m.h,0,0]);const scale=Math.min(560/Math.max(1,box[2]-box[0]),330/Math.max(1,box[3]-box[1])),tx=360-(box[0]+box[2])*scale/2,ty=220-(box[1]+box[3])*scale/2;
 let defs='<clipPath id="'+prefix+'page"><rect width="'+m.w+'" height="'+m.h+'"/></clipPath>';
 for(const [id,d]of Object.entries(m.clips))defs+='<clipPath id="'+prefix+id+'"><path d="'+d+'"/></clipPath>';
 $('#drawing').innerHTML='<defs>'+defs+'</defs><g transform="translate('+tx+' '+ty+') scale('+scale+')"><g clip-path="url(#'+prefix+'page)">'+(ghost?'<g opacity=".12">'+m.paths.map(r=>vectorPath(r,prefix)).join('')+'</g>':'')+'<g id="vDone"></g><g id="vActive"></g><g id="vPoint"></g></g>'+(guide?'<rect width="'+m.w+'" height="'+m.h+'" fill="none" stroke="'+gold+'" stroke-width="1" stroke-dasharray="5 5"/>':'')+'</g>';
 vectorState={key:e.id+ghost+guide,m,prefix,scale,done:0,ghost,guide};
}
function updateVector(e,p,ghost,guide){
 const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);
 const st=vectorState,{done,part,N}=vectorPosition(e,p),r=st.m.paths[done];
 if(done<st.done){$('#vDone').innerHTML='';st.done=0}
 if(done>st.done){let out='';for(let i=st.done;i<done;i++)out+=vectorPath(st.m.paths[i],st.prefix);$('#vDone').insertAdjacentHTML('beforeend',out);st.done=done}
 let active='',point='',mode='逐笔描绘';
 if(r&&part>0){
  if(e.motion&&r.motion&&done>0){const m=r.motion,prev=st.m.paths[done-1],cx=m.c[0]+part*(m.t[0]-m.c[0]),cy=m.c[1]+part*(m.t[1]-m.c[1]);active='<g transform="translate('+cx+' '+cy+') rotate('+(part*m.a*180/Math.PI)+') scale('+(1+part*(m.s-1))+') translate('+(-m.c[0])+' '+(-m.c[1])+')">'+vectorPath({...prev,clip:[]},st.prefix)+'</g>';mode='旋转 / 缩放复制';if(guide)point='<path d="M'+m.c.join(' ')+' L'+m.t.join(' ')+'" stroke="'+gold+'" fill="none" stroke-width="1"/>';
  }else{active=vectorPath(r,st.prefix,part,'data-active-path="true"');mode=vectorWhite(r.f)||vectorWhite(r.s)?'涂白遮挡':r.f.length?'填充形状':'逐笔描绘'}
 }
 $('#vActive').innerHTML=active;$('#vPoint').innerHTML=point;
 if(r&&part>0&&!r.f.length&&!(e.motion&&r.motion)){
  const el=$('#vActive [data-active-path]');if(el&&el.getTotalLength){const pt=el.getPointAtLength(el.getTotalLength()*part);$('#vPoint').innerHTML=dot([pt.x,pt.y],red,3.1/st.scale)}
 }
 const stage=e.vectorSplitAt?(p<.4?'第一步 · ':p===.4?'第一步完成 · 点击继续第二步 · ':'第二步 · '):'';
 return {readout:stage+(p===1?'已完成 '+N+' 条原书路径':mode+' · '+done+' / '+N+' 条路径')};
}
