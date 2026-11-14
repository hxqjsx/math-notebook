// P91/P95: x=sin(1/y), evaluated at the actual displayed y. Source graphics
// use a large vertical scale to reveal the oscillation near y=0.
function eqBoundaryUpdate(e,p,ghost,guide){
 const n=+e.page;if(n!==91&&n!==95)return null;
 const result=scBoundary(e,p,ghost,guide),st=vectorState,m=st.scBoundary;
 if(p>=.3){let live=eqConstructionState(e,p,result,st);if(n===95&&p<1){const v=(p-.3)/.7*m.rows.length,i=Math.min(m.rows.length-1,Math.floor(v)),q=v-i,P=scPoints(m.rows[i].d);if(P.length===2){let A=P[0],B=P[1];if(Math.abs(A[1]-B[1])>.1&&A[0]>50)[A,B]=[B,A];live=ecLine(A,B,q,'连接页面端点与极值点')}}return{...result,live,numericConstruction:true};}
 const q=p/.3,scale=n===91?3600:1440,y0=n===91?614.58:448.3;let active='',mark='',states=[];
 for(let i=0;i<m.boundary.length;i++){
  const r=m.boundary[i],X0=n===91?(i===0?71.29:323.29):72,sign=n===91&&i===1?-1:1,Y0=Math.max(0,r.box[1]),Y1=Math.min(st.m.h,r.box[3]),Y=Y0+(Y1-Y0)*q,y=(y0-Y)/scale,t0=scale/(y0-Y0),t1=1/y,N=Math.max(1,Math.ceil(Math.abs(t1-t0)/.018)),P=Array.from({length:N+1},(_,j)=>{const t=t0+(t1-t0)*j/N;return[X0+sign*14.4*Math.sin(t),y0-scale/t]});
  active+=vectorPath({...r,d:path(P)},st.prefix);mark+=dot(P.at(-1),red,2.5/st.scale);states.push({y,x:Math.sin(1/y),point:P.at(-1)});
 }
 $('#vDone').innerHTML='';$('#vActive').innerHTML=active;$('#vPoint').innerHTML=mark;
 const s=states[0],live={tex:'x=\\sin(1/y),\\qquad y=t>0',values:'y = '+ecN(s.y,6)+' · 1/y = '+ecN(1/s.y,4)+' · x = '+ecN(s.x,6),detail:'黑色边界按实际 y 逐点计算；y 趋近 0 时，摆动越来越密。数值为函数原始坐标；页面按原图比例缩放'+(n===91?'并镜像放置第二条边界。':'和平移。'),point:s.point};
 return{readout:'先生成 x=sin(1/y) · 当前 y = '+ecN(s.y,6),live,numericConstruction:true};
}
