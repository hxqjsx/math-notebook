// Chapter 1: analytical constructions. Page images are embedded separately.
const linearModels=new Map();
function linearModel(key){
 if(linearModels.has(key))return linearModels.get(key);
 const model={key,bounds:[0,5.5,0,8.5],records:[],anchors:[],guides:[]};
 const add=(points,label='',fade=false)=>model.records.push({points,label,fade});
 const rows=Array.from({length:27},(_,i)=>7.25-i*.275);
 const horizontal=(a,b,ys=rows)=>ys.forEach(c=>add([[a,c],[b,c]],'c = '+c.toFixed(2)));
 if(key==='classic'){model.bounds=[-5.5,0,0,8.5];horizontal(-5.5,0);add([[-1,0],[-1,8.5]],'x = −1');}
 if(key==='tilted'){rows.forEach(c=>add([[0,c],[5.5,c-5.5/4]],'m = −1/4 · c = '+c.toFixed(2)));model.guides=[[[1,5],[5,5],[5,4]]];}
 if(key==='floating'){model.bounds=[-5.5,0,0,8.5];horizontal(-4.125,-1.375);model.guides=[[[-4.125,0],[-4.125,7.5]],[[-1.375,0],[-1.375,7.5]]];}
 if(key==='fireescape'){rows.forEach(c=>{add([[0,c],[5.5,c]],'水平线 · c = '+c.toFixed(2));add([[0,c],[5.5,c-.275]],'斜线 · c = '+c.toFixed(2))});}
 if(key==='intersections'){model.bounds=[-5.5,0,0,8.5];rows.forEach(c=>{add([[-5.5,-5+c],[0,6+c]],'斜率 2 · c = '+c.toFixed(2));add([[-5.5,5+c],[0,-6+c]],'斜率 −2 · c = '+c.toFixed(2))});}
 if(key==='symphony'){model.bounds=[0,11,0,17.5];for(let group=0;group<5;group++)for(let j=0;j<5;j++){const c=33-(group*7+j);add([[0,c/2],[11,c/2]],'第 '+(group+1)+' 组 · 第 '+(j+1)+' 条 · c = '+c)}}
 if(key==='halfempty'){model.bounds=[-5.5,0,0,8.5];horizontal(-5.5,0,Array.from({length:15},(_,i)=>3.9-i*3.9/14));add([[-1,3.9],[-1,8.5]],'x = −1');model.guides=[[[-5.5,3.9],[0,3.9]]];}
 if(key==='core'){rows.forEach(c=>add([[0,c],[2.75,3.625],[5.5,c]],'c = '+c.toFixed(2)));model.anchors=[[2.75,3.625]];}
 if(key==='convergence'){model.bounds=[-5.5,0,0,8.5];rows.forEach(c=>add([[0,c],[-4.25,c],[-5.25,0]],'c = '+c.toFixed(2)));model.anchors=[[-5.25,0]];}
 if(key==='herringbone'){
  for(let k=0;k<27;k++){const y=7.15-.275*k;add([[Math.min(3.3,k*.13),y],[5.5,y]],'横线 · 第 '+(k+1)+' 条')}
  for(let k=0;k<=20;k++){const x=k*.275;add([[x,7.15-Math.min(k*.275,3.85)],[x,0]],'竖线 · 第 '+(k+1)+' 条')}
 }
 if(key==='corners'){model.bounds=[-5.5,0,0,8.5];for(let k=0;k<27;k++){let c=k*.105;add([[-4.25-c,8.5],[-c,4.25],[-4.25-c,0]],'c = '+c.toFixed(2))}model.guides=[[[-5.5,4.25],[0,4.25]]];}
 if(key==='warp'){
  rows.forEach(c=>{let dx=1.5*Math.sqrt(Math.max(0,1-((c-3.625)/3.8)**2));add([[0,c],[2.75-dx,c],[2.75,3.625],[2.75+dx,c],[5.5,c]],'c = '+c.toFixed(2))});model.anchors=[[2.75,3.625]];
  model.guides=[Array.from({length:121},(_,i)=>{let a=i/120*2*Math.PI;return[2.75+1.5*Math.cos(a),3.625+3.8*Math.sin(a)]})];
 }
 if(key==='heist'){model.bounds=[-5.5,0,0,8.5];horizontal(-5.5,0);model.diamond=[[0,3.625],[-2.75,7.45],[-5.5,3.625],[-2.75,0],[0,3.625]];}
 if(key==='divergence'){for(let k=0;k<38;k++){const c=-3+k*13.25/37;add([[0,c],[2.75,6.37],[5.5,c]],'c = '+c.toFixed(2))}model.anchors=[[2.75,6.37]];}
 if(key==='ladder'){
  model.bounds=[-6.5,0,0,8.5];const ys=Array.from({length:31},(_,i)=>8.4-i*.28);
  ys.forEach(c=>add([[-3.5-.08*(c+25),c],[-.75-.08*(c+25),c]],'c = '+c.toFixed(2)+' · 长度 = 2.75'));
  model.guides=[[[-5.5,0],[-6.18,8.5]],[[-2.75,0],[-3.43,8.5]]];
 }
 if(key==='crease'){rows.forEach((c,k)=>{const a=4.95-.14*k;add([[0,c],[a,c],[a+.05,c-.05],[5.5,c-.05]],'k = '+k+' · 转折位置 '+a.toFixed(2))});}
 if(key==='fading'){rows.forEach(c=>add([[0,c],[5.5,c]],'c = '+c.toFixed(2)+' · 每行 50 段',true));}
 if(key==='linearcurve'){
  model.bounds=[0,7.5,0,7.5];for(let k=0;k<32;k++){const c=7.25-k*7.25/31;add([[0,c],[Math.sqrt(Math.max(0,7.25**2-c*c)),0]],'c = '+c.toFixed(2)+' · L = 7.25')}
 }
 const [xmin,xmax,ymin,ymax]=model.bounds,scale=Math.min(550/(xmax-xmin),330/(ymax-ymin));
 model.project=([x,y])=>[360+(x-(xmin+xmax)/2)*scale,220-(y-(ymin+ymax)/2)*scale];
 model.frame={x:360-(xmax-xmin)*scale/2,y:220-(ymax-ymin)*scale/2,w:(xmax-xmin)*scale,h:(ymax-ymin)*scale};
 model.screen=model.records.map(r=>({...r,points:r.points.map(model.project)}));
 model.prefix=[''];for(const r of model.screen)model.prefix.push(model.prefix.at(-1)+linearStroke(r,1,green).svg);
 linearModels.set(key,model);return model;
}
function partialPolyline(points,fraction){
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);
 let remaining=Math.max(0,Math.min(1,fraction))*total,out=[points[0]];
 for(let i=0;i<lengths.length;i++){if(remaining>=lengths[i]){out.push(points[i+1]);remaining-=lengths[i]}else{const q=lengths[i]===0?0:remaining/lengths[i];out.push([points[i][0]+(points[i+1][0]-points[i][0])*q,points[i][1]+(points[i+1][1]-points[i][1])*q]);break}}
 return out;
}
function linearStroke(record,fraction,color){
 const points=partialPolyline(record.points,fraction);
 if(!record.fade)return{svg:line(points,color,1.15),point:points.at(-1)};
 const [a,b]=record.points;let svg='';
 for(let j=0;j<50&&j/50<fraction;j++){const lo=j/50,hi=Math.min(fraction,(j+1)/50),lerp=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];svg+=line([lerp(lo),lerp(hi)],color,1.2,'opacity="'+((j+1)/50)**2+'"')}
 return{svg,point:points.at(-1)};
}
function drawLinear(key,p,ghost,guide){
 if(key==='skyline')return drawSkyline(p,ghost,guide);
 const m=linearModel(key),f=m.frame,N=m.screen.length,phase=key==='heist'?Math.min(1,p/.5):p,v=phase*N,done=Math.min(N,Math.floor(v)),part=v-done;
 let svg='<defs><clipPath id="linearClip"><rect x="'+f.x+'" y="'+f.y+'" width="'+f.w+'" height="'+f.h+'"/></clipPath></defs><g clip-path="url(#linearClip)">';
 if(ghost)svg+='<g opacity=".12">'+m.prefix[N]+'</g>';
 svg+=m.prefix[done];
 let readout=done===N?'已完成 '+N+' 条路径':'第 '+(done+1)+' / '+N+' 条 · '+m.screen[done].label;
 if(done<N&&part>0){const stroke=linearStroke(m.screen[done],part,green);svg+=stroke.svg+dot(stroke.point,red,3.2)}
 if(key==='heist'&&p>=.5){
  const q=(p-.5)/.5,diamond=m.diamond.map(m.project);
  if(q>0){svg+='<defs><clipPath id="diamondSweep"><rect x="'+f.x+'" y="'+f.y+'" width="'+f.w+'" height="'+(f.h*Math.max(0,(q-.25)/.75))+'"/></clipPath></defs><path d="'+path(diamond)+'" fill="'+paper+'" clip-path="url(#diamondSweep)"/>';
   if(q<1||guide)svg+=line(partialPolyline(diamond,Math.min(1,q/.25)),gold,1.4);
  }
  readout=p===.5?'第一步完成 · 点击继续第二步':p===1?'第二步完成 · 菱形留白':'第二步 · '+(q<.25?'连接菱形四个顶点':'把菱形内部涂白');
 }else if(key==='heist')readout='第一步 · '+readout;
 if(guide){m.guides.forEach(pts=>svg+=line(pts.map(m.project),gold,.9,'stroke-dasharray="4 4"'));if(key==='linearcurve'&&done<N){const [a,b]=m.screen[done];svg+=line([a,m.project([0,0]),b],gold,1,'stroke-dasharray="4 4"')}}
 m.anchors.forEach(pt=>svg+=dot(m.project(pt),gold,3.5));
 svg+='</g>';return{svg,readout};
}
// Digitized illustrative roofline from printed p.20, without an invented analytic f.
const roofPoints=[[34,538],[59,538],[59,556],[68,556],[68,521],[102,521],[102,551],[128,551],[144,538],[144,496],[170,496],[170,530],[187,530],[187,560],[204,560],[204,513],[230,513],[230,530],[247,530],[247,555],[264,555],[258,445],[271,445],[265,424],[277,420],[277,373],[286,373],[286,420],[302,424],[296,445],[308,445],[306,555],[323,555],[323,522],[340,522],[340,500],[357,500],[357,509],[374,509],[374,470],[399,470],[399,538],[417,538],[417,522],[434,522],[434,565],[450,565],[450,497],[459,497],[459,445],[468,445],[468,497],[477,497],[477,538],[497,538],[497,522],[513,522]];
function roofHeight(x){let ys=[];for(let i=1;i<roofPoints.length;i++){const[a,b]=[roofPoints[i-1],roofPoints[i]];if(a[0]!==b[0]&&x>=Math.min(a[0],b[0])&&x<=Math.max(a[0],b[0]))ys.push(a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]))}return 757-Math.min(...ys)}
function drawSkyline(p,ghost,guide){
 const stage=Math.min(3,Math.floor(p*4)),n=[8,16,32,64][stage],v=p===1?n:(p*4-stage)*n,done=Math.floor(v),part=v-done,sx=1.05,sy=.72,left=108,base=383,w=479*sx;
 const project=([x,y])=>[left+(x-34)*sx,base-(757-y)*sy];
 let svg=line(roofPoints.map(project),ghost?'#a7b4a3':'#c6cdbf',1.2),area=0;
 for(let i=0;i<=done&&i<n;i++){
  const h=roofHeight(34+(i+.5)*479/n)*sy,amount=i<done?1:part,x=left+i*w/n;
  if(amount>0)svg+='<rect x="'+x+'" y="'+(base-h)+'" width="'+(w/n*amount)+'" height="'+h+'" fill="'+green+'" fill-opacity=".08" stroke="'+(i===done?gold:green)+'" stroke-width=".8"/>';
  area+=h*w/n*(i<done?1:part);
 }
 if(guide)svg+=line([[left,base],[left+w,base]],gold,1.2);
 return{svg,readout:'第 '+(stage+1)+' / 4 阶段 · n = '+n+' · 已生成 '+Math.min(n,done)+' 个矩形'};
}
