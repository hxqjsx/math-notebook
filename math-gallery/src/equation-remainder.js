// Mathematical playback for three formerly flattened/source-only pages.
function erNum(v,n=4){return Number(v.toFixed(n)).toString().replace('-','−')}
function erSource(st,sourceIndex){const i=st.m.sourceIndexes?st.m.sourceIndexes.indexOf(sourceIndex):sourceIndex;return i>=0?st.m.paths[i]:null}
function erPoints(r){return Array.from(r.d.matchAll(/[ML]([-\d.]+) ([-\d.]+)/g),m=>[+m[1],+m[2]])}
function eqRemainderPlan(e,st){
 const n=+e.page;if(n!==85&&n!==114)return null;const curves=[],rs=st.m.paths;
 if(n===85){
  const ox=-.35,oy=612.5,scale=72;
  for(let i=0;i<26;i++){
   const r=erSource(st,i);if(r){const A=erPoints(r)[0],c=(oy-A[1])/scale;curves.push({r,t0:0,t1:(st.m.w-ox)/scale,math:x=>[x,c],eval:x=>[ox+scale*x,oy-scale*c],tex:'y=c,\\quad x=u',params:'c ≈ '+erNum(c)+' · 长横线',variable:'u',count:200})}
   const short=erSource(st,26+i);if(i<25&&short){const A=erPoints(short)[0],c=2*(oy-A[1])/scale,end=1+Math.sin(c)/2;curves.push({r:short,t0:0,t1:end,math:x=>[x,c/2],eval:x=>[ox+scale*x,oy-scale*c/2],tex:'y=\\frac c2,\\quad0\\le x\\le1+\\frac{\\sin c}{2}',params:'c ≈ '+erNum(c)+' · 当前终点 x = '+erNum(end),variable:'x',count:200})}
  }
  const boundary=erSource(st,51);if(boundary){const P=erPoints(boundary);curves.push({r:boundary,t0:(oy-P[0][1])/scale,t1:(oy-P.at(-1)[1])/scale,math:y=>[1+Math.sin(2*y)/2,y],eval:y=>[ox+scale*(1+Math.sin(2*y)/2),oy-scale*y],tex:'x=1+\\frac{\\sin(2y)}2,\\qquad c=2y',params:y=>'c = '+erNum(2*y)+' · 自动连接短横线终点，生成河岸边界',variable:'y',count:6000})}
  return{curves,refs:[],finalPaths:rs.filter((r,i)=>(st.m.sourceIndexes?.[i]??i)!==52),note:'长、短横线交替生成；每条线独立显示实际c。短线端点由sin(c)实时计算，最后按同一端点方程补出黑色河岸。'};
 }
 const ox=396.62,oy=624.3,scale=72,make=(source,t0,t1,math,tex,params,variable)=>{const r=erSource(st,source);if(r)curves.push({r,t0,t1,math,eval:t=>{const P=math(t);return[ox+scale*P[0],oy-scale*P[1]]},tex,params,variable,count:240})};
 for(let i=0;i<5;i++){const r=erSource(st,i);if(!r)continue;const c=(oy-erPoints(r)[0][1])/scale;make(i,0,-2.75,x=>[x,c],'y=c,\\quad-2.75\\le x\\le0,\\quad c>6','c ≈ '+erNum(c),'x')}
 for(let i=6;i<=14;i++){const r=erSource(st,i);if(!r)continue;const c=(ox-erPoints(r)[0][0])/scale;make(i,0,6,y=>[-c,y],'x=-c,\\quad0\\le y\\le6,\\quad c>2.75','c ≈ '+erNum(c),'y')}
 // The boundary and the two black reference lines are automatically completed.
 make(5,0,6,y=>[-2.75,y],'x=-2.75,\\quad0\\le y\\le6','区域分界线 · x = −2.75','y');
 for(const i of[15,16]){const r=erSource(st,i);if(!r)continue;const P=erPoints(r),A=[(P[0][0]-ox)/scale,(oy-P[0][1])/scale],B=[(P.at(-1)[0]-ox)/scale,(oy-P.at(-1)[1])/scale];
  if(i===15)make(i,A[1],B[1],y=>[A[0],y],'x=-1,\\quad y\\ge6','自动补全上方黑色竖线 · x = −1','y');
  else make(i,A[0],B[0],x=>[x,A[1]],'y=c,\\quad x\\le-2.75','自动补全左侧黑色横线 · c ≈ '+erNum(A[1]),'x');
 }
 return{curves,refs:[],finalPaths:rs.filter((r,i)=>(st.m.sourceIndexes?.[i]??i)!==17),note:'依原书区域条件分别生成水平线和竖直线；当前x或y由方程直接计算。最后自动补齐区域分界线及黑色参考线。'};
}

// p128 is a stack of actual semitransparent mathematical strokes, not a scan
// over the 683 rectangles produced by PDF transparency flattening. The ink RGB
// values invert the source print compositing at alpha=.5; linewidths are the
// source's exact 5,3,1,.5 pt. Vertical crossing colors are calibrated separately
// because PDF print blending is not the browser's linear RGB blend. Alpha is
// evaluated in the print-gray domain before vectorColor maps the composited
// result to the site palette; the mapped rectangles are consequently opaque.
const erWidths=[5,3,1,.5],erHorizontalGray=[.98,.956,.935,.922],erHorizontalInk=[.96,.932,.914,.909];
const erVerticalTarget=[
 [.871,.854,.836,.816,.809],
 [.565,.555,.544,.537,.533],
 [.385,.385,.376,.376,.366],
 [.289,.282,.284,.276,.277]
];
function erRectangle(x,y,w,h,ink,alpha=.5,previous=1){const composite=Math.round((alpha*ink+(1-alpha)*previous)*1e12)/1e12;return'<rect x="'+x+'" y="'+y+'" width="'+Math.max(0,w)+'" height="'+Math.max(0,h)+'" fill="'+vectorColor([composite])+'" fill-opacity="1" data-print-alpha="'+alpha+'"/>'}
function erPrintRows(st){
 if(st._erPrintRows)return st._erPrintRows;
 const rows=[];for(let i=0;i<21;i++){const r=erSource(st,i*4);if(r)rows.push((r.box[1]+r.box[3])/2)}
 // The original page's lower explanatory paragraph hides this horizontal row;
 // its tiny intersections with the vertical reference remain in the source.
 const intersections=[511.53,...rows],cuts=[-8.5,603.78];for(const y of intersections)for(const w of erWidths)cuts.push(y-w/2,y+w/2);cuts.sort((a,b)=>a-b);
 const bands=[];for(let i=1;i<cuts.length;i++){const lo=cuts[i-1],hi=cuts[i];if(hi-lo<1e-8)continue;const y=(lo+hi)/2;let h=0,extra=false;for(const center of intersections){const d=Math.abs(y-center);for(let j=0;j<4;j++)if(d<erWidths[j]/2){h=j+1;extra=center===511.53}}bands.push({lo,hi,h,extra})}
 const horizontal=(row,j,x)=>erRectangle(0,row-erWidths[j]/2,Math.max(0,Math.min(st.m.w,396.5,x)),erWidths[j],erHorizontalInk[j],.5,j?erHorizontalGray[j-1]:1);
 const vertical=(j,y)=>{let svg='';const width=erWidths[j];for(const b of bands){const lo=Math.max(b.lo,y),hi=Math.min(b.hi,st.m.h);if(hi<=lo||hi<=0)continue;const current=erVerticalTarget[j][b.h],previous=j?erVerticalTarget[j-1][b.h]:b.extra?1:b.h?erHorizontalGray[b.h-1]:1,ink=2*current-previous;svg+=erRectangle(324.5-width/2,Math.max(0,lo),width,hi-Math.max(0,lo),ink,.5,previous)}return svg};
 const strokes=[];for(const y of rows)for(let j=0;j<4;j++)strokes.push({y,j,full:horizontal(y,j,st.m.w)});const prefixes=[''];for(const stroke of strokes)prefixes.push(prefixes.at(-1)+stroke.full);
 return st._erPrintRows={rows,bands,horizontal,vertical,strokes,prefixes};
}
function eqRemainderUpdate(e,p,ghost,guide){
 if(+e.page!==128)return null;const st=vectorState,m=st.m,model=erPrintRows(st),oy=612.51,ox=396.5,scale=72,alpha=.5,mainEnd=.87;let done='',active='',point='',tex='',values='',detail='',readout='';
 if(p>=1){done=m.paths.map(r=>vectorPath(r,st.prefix)).join('');tex='y=c,\\quad w/w_0\\in\\{5,3,1,0.5\\},\\quad\\alpha=0.5';values='四种线宽全部叠加完成 · 透明度 50%';detail='完成图与左侧原书图案使用完全相同的路径。';readout='已完成 · 方程与参数同步'}
 else if(p<mainEnd){const v=p/mainEnd*model.strokes.length,i=Math.min(model.strokes.length-1,Math.floor(v)),f=v-i,S=model.strokes[i],x=Math.min(m.w,396.5)*f,c=(oy-S.y)/scale,w=erWidths[S.j];done=model.prefixes[i];active=model.horizontal(S.y,S.j,x);point=dot([x,S.y],red,3/st.scale);tex='y=c,\\quad x=u,\\quad w=k\\,w_0,\\quad\\alpha=0.5';values='c ≈ '+erNum(c)+' · u = '+erNum((x-ox)/scale)+' · k = '+w+' · w₀ = 1 pt · w = '+w+' pt · 透明度 50%';detail='第 '+(Math.floor(i/4)+1)+' / '+model.rows.length+' 条横线，第 '+(S.j+1)+' / 4 层。当前自变量u决定笔迹末端；k实际控制笔迹宽度；先按50%透明度计算印刷叠色，再用网页配色显示。';readout='y=c · 叠加 '+w+' 倍线宽'}
 else{const v=(p-mainEnd)/(1-mainEnd)*4,j=Math.min(3,Math.floor(v)),f=v-j,y=m.h*(1-f),w=erWidths[j];done=model.prefixes.at(-1);for(let k=0;k<j;k++)done+=model.vertical(k,0);active=model.vertical(j,y);point=dot([324.5,y],red,3/st.scale);tex='x=-1,\\quad y=u,\\quad w=k\\,w_0,\\quad\\alpha=0.5';values='u = '+erNum((oy-y)/scale)+' · k = '+w+' · w₀ = 1 pt · w = '+w+' pt · 透明度 50%';detail='最后以同样四种线宽连续补全黑色竖线；交点先按50%透明度计算印刷叠色，再用网页配色显示；笔迹宽度和扫描位置实时控制当前图形。';readout='自动补全 x=−1 的透明叠层'}
 $('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=point;return{readout,live:{tex,values,detail},equationDriven:true};
}
