// Local rigid transformations reconstructed from the printed source groups.
// Each moving unit remains a complete source shape; no replacement artwork is
// drawn. At completion, source order, clipping and all reference lines are exact.
// p.111 is deliberately not handled: the printed clockwise angles disagree with
// the directions of the four source groups. p.114 states regional line equations.
function localTransformInit(e,ghost,guide){const key=e.id+ghost+guide;if(!vectorState||vectorState.key!==key)startVector(e,ghost,guide);return vectorState}
function localTransformPaths(st,records,unclip=false){return records.map(r=>vectorPath(unclip?{...r,clip:[]}:r,st.prefix)).join('')}
function localTransformSet(st,done,active='',points=''){$('#vDone').innerHTML=done;$('#vActive').innerHTML=active;$('#vPoint').innerHTML=points;st.done=0}
function localTransformFinish(st,readout){localTransformSet(st,localTransformPaths(st,st.m.paths));st.done=st.m.paths.length;return{readout}}
function localTransformRotate(st,records,angle,C){return '<g transform="rotate('+angle+' '+C[0]+' '+C[1]+')">'+localTransformPaths(st,records,true)+'</g>'}
function localTransformPoint(st,C){return '<circle cx="'+C[0]+'" cy="'+C[1]+'" r="'+(2.8/st.scale)+'" fill="'+gold+'"/>'}
function localTransformEase(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)}
function localTransformCorner(e,p,ghost,guide){
 const st=localTransformInit(e,ghost,guide),a=st.m.paths;
 if(p>=1)return localTransformFinish(st,'左上角旋转90°完成 · 白色直角三角形遮盖完成');
 // Source indices 26–33 are the white square and its six vertical rulings;
 // 34–35 are the separate triangular white cover, applied only afterwards.
 const turn=localTransformEase(Math.min(1,p/.7)),cover=localTransformEase((p-.7)/.3),C=[99.64,103.185];
 let active=localTransformRotate(st,a.slice(26,34),-90*(1-turn),C);
 if(cover>0)active+='<g transform="translate(.85 4.39) scale('+cover+') translate(-.85 -4.39)">'+localTransformPaths(st,a.slice(34))+'</g>';
 localTransformSet(st,localTransformPaths(st,a.slice(0,26)),active,guide?localTransformPoint(st,C):'');
 return{readout:p<.7?'左上角整块旋转 · α = '+(90*turn).toFixed(1)+'° / 90°':'旋转完成 · 用白色直角三角形遮盖左上角 · '+Math.round(cover*100)+'%'};
}
function localTransformStreet(e,p,ghost,guide){
 const st=localTransformInit(e,ghost,guide),a=st.m.paths;
 if(p>=1)return localTransformFinish(st,'黑线左侧整体旋转完成 · 分段边界已自动补全');
 const left=a.filter((r,i)=>i<50&&i%2===1),right=a.filter((r,i)=>i<50&&i%2===0),C=[72.58,94.33],theta=Math.atan(.5)*180/Math.PI,q=localTransformEase(p/.9);
 // The source has slope −1/2 on the left. Its inverse rigid rotation restores
 // horizontal rulings; the book itself does not specify a numerical angle.
 let active=localTransformRotate(st,left,theta*(1-q),C);
 if(p>.9)active+=a.slice(50).map(r=>vectorPath(r,st.prefix,Math.min(1,(p-.9)/.1))).join('');
 localTransformSet(st,localTransformPaths(st,right),active,guide?localTransformPoint(st,C):'');
 return{readout:p<.9?'黑线左侧整体旋转 · 当前转角 '+(theta*q).toFixed(1)+'°（由原图线条方向还原）':'自动补全边界 · x = 1；y = −(7.25/4)(x − 5)'};
}
function localTransformDetour(e,p,ghost,guide){
 const st=localTransformInit(e,ghost,guide),a=st.m.paths;
 if(p>=1)return localTransformFinish(st,'y = c · 中间部分顺时针旋转26.5° · 底部向左平移完成');
 const turn=localTransformEase(p/.65),move=localTransformEase((p-.65)/.35),C=[324.85,250.05],dx=79.97*(1-move);
 let active=localTransformRotate(st,a.slice(12,30),-26.5*(1-turn),C);
 active+='<g transform="translate('+dx+' 0)">'+localTransformPaths(st,a.slice(30,61),true)+'</g>';
 localTransformSet(st,localTransformPaths(st,a.slice(0,12)),active,guide?localTransformPoint(st,C):'');
 return{readout:p<.65?'y = c · 中间部分整块顺时针旋转 · α = '+(26.5*turn).toFixed(1)+'° / 26.5°':'中间旋转完成 · 底部整体向左平移 · '+Math.round(move*100)+'%'};
}
function localTransformSouthwest(e,p,ghost,guide){
 const st=localTransformInit(e,ghost,guide),C=[st.m.w/2,st.m.h/2];
 if(p>=1)return localTransformFinish(st,'整页绕页面中心顺时针旋转135°完成');
 const q=localTransformEase(p);
 // All visible page artwork is in the first source group. Subsequent records
 // are clipped printer-overflow slivers; they return unchanged in the final frame.
 localTransformSet(st,'',localTransformRotate(st,st.m.paths.slice(0,27),-135*(1-q),C),guide?localTransformPoint(st,C):'');
 return{readout:'整页绕页面中心顺时针旋转 · α = '+(135*q).toFixed(1)+'° / 135°'};
}
function localTransformRadiation(e,p,ghost,guide){
 const st=localTransformInit(e,ghost,guide),ends=[43,115,182,240,315,367],C=[-.35,290.2];
 if(p>=1)return localTransformFinish(st,'k = 0, 1, 2, 3, 4, 5 · 绕左侧边缘中点顺时针旋转30k°');
 const v=Math.min(5-1e-9,p*5),i=Math.floor(v)+1,q=localTransformEase(v-Math.floor(v)),from=ends[i-1],to=ends[i],angle=i*30;
 const done=localTransformPaths(st,st.m.paths.slice(0,from)),active=localTransformRotate(st,st.m.paths.slice(from,to),-angle*(1-q),C);
 localTransformSet(st,done,active,guide?localTransformPoint(st,C):'');
 return{readout:'第 '+(i+1)+' / 6 组 · k = '+i+' · 顺时针转角 α = '+(angle*q).toFixed(1)+'° → '+angle+'°'};
}
function localTransformSideways(e,p,ghost,guide){
 const st=localTransformInit(e,ghost,guide),C=[st.m.w/2,st.m.h/2],body=localTransformPaths(st,st.m.paths.slice(0,17),true);
 if(p>=1)return localTransformFinish(st,'翻转完成 · 整页逆时针旋转90°完成');
 let transform,readout;
 if(p<.4){const q=localTransformEase(p/.4),sx=1-2*q;transform='scale('+(-sx)+' 1) rotate(90)';readout='整页翻转 · '+Math.round(q*100)+'%'}
 else{const q=localTransformEase((p-.4)/.6);transform='rotate('+(90*(1-q))+')';readout='翻转完成 · 整页逆时针旋转 · α = '+(90*q).toFixed(1)+'° / 90°'}
 const active='<g transform="translate('+C.join(' ')+') '+transform+' translate('+(-C[0])+' '+(-C[1])+')">'+body+'</g>';
 localTransformSet(st,'',active,guide?localTransformPoint(st,C):'');return{readout};
}
function localTransformReptiles(e,p,ghost,guide){
 const st=localTransformInit(e,ghost,guide),a=st.m.paths;
 if(p>=1)return localTransformFinish(st,'完整爬行动物图形的旋转与重复铺排完成');
 if(!st.localReptiles){
  const black=a.findLast(r=>r.s.length&&Math.max(...r.s)<.1),B=[(black.box[0]+black.box[2])/2,(black.box[1]+black.box[3])/2];
  const records=a.map((r,index)=>({r,index,C:[(r.box[0]+r.box[2])/2,(r.box[1]+r.box[3])/2]})).filter(x=>x.r!==black);
  records.sort((x,y)=>Math.hypot(x.C[0]-B[0],x.C[1]-B[1])-Math.hypot(y.C[0]-B[0],y.C[1]-B[1]));
  st.localReptiles={black,B,records};
 }
 const m=st.localReptiles,N=m.records.length,v=p*N,n=Math.min(N-1,Math.floor(v)),q=localTransformEase(v-n),cur=m.records[n];
 // The three printed orientations are kept as three distinct source shapes:
 // do not pretend the hand-adjusted outlines are one perfectly congruent tile.
 const targetAngle=[-120,120,0][cur.index%3],C=[m.B[0]+q*(cur.C[0]-m.B[0]),m.B[1]+q*(cur.C[1]-m.B[1])];
 let moving='<g transform="translate('+C.join(' ')+') rotate('+(-targetAngle*(1-q))+') translate('+(-cur.C[0])+' '+(-cur.C[1])+')">'+localTransformPaths(st,[cur.r],true)+'</g>';
 if(cur.r.clip.length)moving='<g clip-path="url(#'+st.prefix+cur.r.clip[0]+')">'+moving+'</g>';
 const done=localTransformPaths(st,m.records.slice(0,n).map(x=>x.r));
 localTransformSet(st,done,moving+localTransformPaths(st,[m.black]),guide?localTransformPoint(st,m.B):'');
 return{readout:'完整爬行动物旋转、平移与铺排 · 已放置 '+n+' / '+N+' 个 · 当前第 '+(n+1)+' 个'};
}
function localTransformationUpdate(e,p,ghost,guide){
 switch(+e.page){
  case 108:return localTransformCorner(e,p,ghost,guide);
  case 109:return localTransformStreet(e,p,ghost,guide);
  case 110:return localTransformDetour(e,p,ghost,guide);
  case 112:return localTransformSouthwest(e,p,ghost,guide);
  case 113:return localTransformRadiation(e,p,ghost,guide);
  case 115:return localTransformSideways(e,p,ghost,guide);
  case 116:return localTransformReptiles(e,p,ghost,guide);
  default:return null;
 }
}
