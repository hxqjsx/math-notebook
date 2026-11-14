// Return the visible prefix of a source stroke. The original r.d remains the
// completed geometry, including its dash pattern, caps, clipping and masks.
function visibleStrokePrefix(r,fraction){
 if(!r.playParts)return null;
 const parts=r.playParts,lengths=r.playLengths,total=lengths.reduce((a,b)=>a+b,0),budget=Math.max(0,Math.min(1,fraction))*total;
 let remaining=budget,d='',point=parts[0]?.[0]||[0,0];
 const num=x=>Number(x.toFixed(4)),move=p=>'M'+num(p[0])+' '+num(p[1]),line=p=>'L'+num(p[0])+' '+num(p[1]);
 for(let k=0;k<parts.length;k++){
  const pts=parts[k];if(remaining<=0)break;d+=move(pts[0]);point=pts[0];
  if(remaining>=lengths[k]-1e-7){for(let i=1;i<pts.length;i++)d+=' '+line(pts[i]);remaining-=lengths[k];point=pts.at(-1);continue}
  for(let i=1;i<pts.length;i++){
   const a=pts[i-1],b=pts[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
   if(remaining>=length){d+=' '+line(b);remaining-=length;point=b}
   else{const t=length?remaining/length:0;point=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];d+=' '+line(point);remaining=0;break}
  }
 }
 return{d,point,total,budget};
}
// The root renderer should apply the returned prefix as a white stroke mask
// over the ORIGINAL full r.d. This preserves dash placement and exact terminal
// curves while revealing only visible parts, with no off-page waiting.
// nonAnimated records consume zero time and enter the completed layer in order.
