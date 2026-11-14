from pathlib import Path
import json,re
from build_qr_page import add_qr_links
root=Path(__file__).resolve().parent.parent
project=json.loads((root/'project.json').read_text(encoding='utf-8'))
version=str(project['version']);release_date=project['release_date']
for folder in ['dist','math-gallery/dist','tmp']:(root/folder).mkdir(parents=True,exist_ok=True)
s=(root/project['build_base']).read_text(encoding='utf-8');code=re.search(r'<script id="gallery-code">([\s\S]*?)</script>',s)[1]
# Keep one fullscreen implementation; old baseline handler is superseded below.
full_start=code.index("$('#fullBtn').onclick=async()=>")
full_end=code.index("document.addEventListener('visibilitychange'",full_start)
code=code[:full_start]+code[full_end:]
data=json.loads(re.search(r'<script id="gallery-data" type="application/json">([\s\S]*?)</script>',s)[1]);data.pop('notes',None);data.pop('images',None)
v=json.loads((root/'math-gallery/visible-vectors.json').read_text(encoding='utf-8'));spec={}
v['71']=json.loads((root/'math-gallery/p71-repaired.json').read_text(encoding='utf-8'))
repairs=json.loads((root/'math-gallery/equation-late-repairs.json').read_text(encoding='utf-8'));repairs.update(json.loads((root/'math-gallery/equation-remainder-repairs.json').read_text(encoding='utf-8')))
for page,repair in repairs.items():
 m=v[page];keep=set(repair.get('keepSourceIndexes',m['sourceIndexes']))-set(repair.get('dropSourceIndexes',[]))
 pairs=[(idx,r) for idx,r in zip(m['sourceIndexes'],m['paths']) if idx in keep]
 m['sourceIndexes']=[idx for idx,r in pairs];m['paths']=[r for idx,r in pairs]
heart=json.loads((root/'math-gallery/equation-late-heart-path.json').read_text(encoding='utf-8'));m=v['182'];keep=set(heart['keepSourceIndexes'])
pairs=[(idx,heart['path'] if idx==heart['sourceIndex'] else r) for idx,r in zip(m['sourceIndexes'],m['paths']) if idx in keep]
m['sourceIndexes']=[idx for idx,r in pairs];m['paths']=[r for idx,r in pairs]
# Remove rectangles belonging only to printed formula labels, not geometric masks.
notes=json.loads((root/'source/note-meta.json').read_text(encoding='utf-8'))
for page,m in v.items():
 rect=notes.get(page,{}).get('rect');kept=[];indices=[]
 for i,r in enumerate(m['paths']):
  remove=False
  if rect and r['f'] and min(r['f'])>.999 and 'C' not in r['d']:
   pts=[tuple(map(float,x)) for x in re.findall(r'[ML]([-\d.]+) ([-\d.]+)',r['d'])]
   if len(pts)in[4,5] and all(abs(a[0]-b[0])<.02 or abs(a[1]-b[1])<.02 for a,b in zip(pts,pts[1:]+pts[:1])):
    tx=rect[0]-36.8499;ty=m['h']-(rect[1]-36.85)-rect[3];x0,y0,x1,y1=r['box'];remove=(tx-2<=x0<=x1<=tx+rect[2]+2 and ty-2<=y0<=y1<=ty+rect[3]+2 and y1-y0<85)
  if not remove:kept.append(r);indices.append(m['sourceIndexes'][i])
 m['paths']=kept;m['sourceIndexes']=indices
# Remove only independently verified typography artifacts; all retained source IDs survive.
review_audit={}
for name in ['review-cleanup-early.json','review-cleanup-late.json','review-cleanup-extra.json']:
 file=root/'math-gallery'/name
 assert file.exists(), name
 for page,repair in json.loads(file.read_text(encoding='utf-8')).items():
  if not page.isdigit():continue
  m=v[page];drop=set(repair.get('dropSourceIndexes',[]));replace=repair.get('replacePaths',{})
  pairs=[(idx,replace.get(str(idx),r)) for idx,r in zip(m['sourceIndexes'],m['paths']) if idx not in drop]
  review_audit.setdefault(page,[]).extend(idx for idx in m['sourceIndexes'] if idx in drop)
  m['sourceIndexes']=[idx for idx,r in pairs];m['paths']=[r for idx,r in pairs]
  for key,value in repair.get('clipChanges',{}).items():
   if value is None:m['clips'].pop(key,None)
   else:m['clips'][key]=value
(root/'math-gallery/review-cleanup-applied.json').write_bytes(json.dumps(review_audit,ensure_ascii=False,indent=2).encode('utf-8'))
for p in ['text-ch2-6.json','text-ch7-9.json','text-ch10-12.json']:spec.update(json.loads((root/'math-gallery/src'/p).read_text(encoding='utf-8')))
spec['61']['tex']=r'\begin{array}{l}y=c,\quad 0\le x\le0.194k\\(x-0.194k)^2+(y-c+0.14)^2=0.14^2\end{array}'
for e in json.loads((root/'math-gallery/src/chapter1.json').read_text(encoding='utf-8')):
 n=e['page'];spec[n]=dict(tex=e['formula'],description=e['rule'],mode='curve' if n in ['2','3','4','5','6','7','8','12','16','17','18'] else 'mask' if n=='14' else 'construction',parameter='改变 c，保持同一组方程' if n not in ['11','13','19','20'] else '按原书依次连接、分割或缩短线段')
spec['7']['tex']=r'y=\frac c2';spec['7']['description']='连续画5条横线，留空2行后重复；每组最后自动补上原图的短竖线。'
spec['20'].update(tex=r'A_n\approx\sum_{i=1}^{n}f(\xi_i)\,\Delta x_i',description='用矩形分割原书的城市轮廓；矩形越细，对轮廓下方面积的逼近越精细。上式为对应黎曼和的讲解表达。',parameter='n 表示当前矩形数量；轮廓直接取自原图')
spec['17']['parameter']='k 从底部向上编号；aₖ=4.95−0.14k'
spec['19']['description']='从 (0,c) 向斜下方画长为7.25的线段，使另一端落在底部横线；端点坐标式由勾股定理补充。'
assert len(spec)==174
numeric={}
for part in ['numeric-params-ch1.json','numeric-params-ch2-6.json','numeric-params-ch7-12.json','numeric-params-ch10.json']:
 p=root/'math-gallery/src'/part
 if p.exists():numeric.update(json.loads(p.read_text(encoding='utf-8')))
for page in numeric.values():
 if not page.get('records'):
  page['unresolved']=True
  page.setdefault('displayNote',page.get('note','原书没有给出具体参数值，暂不显示未经核定的数值。'))
if '2' in numeric:numeric['2']['records']['26']={'text':'x = −1 · 补充竖线','equation':'x=-1'}
modules=['visible-playback.js','construction-engines.js','transform-engines.js','local-transform-engines.js','late-construction-engines.js','book-construction-engines.js','special-curves-engines.js','equation-engine.js','equation-lines.js','equation-first-masks.js','equation-parametric.js','equation-parabolas.js','equation-functions.js','equation-polar.js','equation-mixed.js','equation-remainder.js','equation-late.js','equation-construction-state.js','equation-melting.js','equation-book185.js','equation-conic-constructions.js']
engine=(root/'math-gallery/src/vectors.js').read_text(encoding='utf-8')
engine=engine.replace("function vectorPath(r,prefix,partial=1,extra=''){", "function vectorPath(r,prefix,partial=1,extra=''){if(partial<1&&r.s.length&&!r.f.length){const traced=equationSourcePrefix(r,partial);r={...r,d:traced.d,playParts:undefined,playLengths:undefined};partial=1;}")
# Never spend time drawing outside clipping rectangles; preserve original d at completion.
engine=engine.replace("const stroke=vectorColor(r.s)", "const visible=partial<1&&r.s.length?visibleStrokePrefix(r,partial):null;\n const stroke=vectorColor(r.s)")
engine=engine.replace("if(partial<1&&r.s.length&&!dash)","if(partial<1&&r.s.length&&!dash&&!visible)")
engine=engine.replace("if(partial<1&&dash){", "if(visible){const mid=prefix+'visibleReveal';s='<defs><mask id=\"'+mid+'\" maskUnits=\"userSpaceOnUse\" x=\"-10000\" y=\"-10000\" width=\"20000\" height=\"20000\"><path d=\"'+visible.d+'\" fill=\"none\" stroke=\"white\" stroke-width=\"'+(r.w+1)+'\"/></mask></defs><g mask=\"url(#'+mid+')\">'+s+'</g>'}\n if(partial<1&&dash&&!visible){")
engine=engine.replace("const [x0,y0,x1,y1]=r.box", "const [x0,y0,x1,y1]=r.visibleBox||r.box")
# Replace progress accounting with zero-time static records within the book's stages.
a=engine.index('function vectorPosition(');b=engine.index('function vectorFrame(',a)
engine=engine[:a]+'''function vectorPosition(e,p){const m=bookVectors[e.vectorPage],N=m.paths.length,stops=e.timeline||(e.vectorSplitAt?[[e.key==='heist'?.5:.4,e.vectorSplitAt],[1,N]]:[[1,N]]);if(p>=1)return{done:N,part:0,N};let startP=0,startN=0,endP=1,endN=N;for(const row of stops){[endP,endN]=row;if(p<=endP)break;startP=endP;startN=endN}const indices=[];for(let i=startN;i<endN;i++)if(!m.paths[i].nonAnimated)indices.push(i);const t=Math.max(0,Math.min(1,(p-startP)/Math.max(1e-9,endP-startP))),at=t*indices.length,k=Math.floor(at+1e-9);let done=k>=indices.length?endN:indices[k];while(done<N&&m.paths[done].nonAnimated)done++;return{done,part:Math.max(0,at-k),N}}\n'''+engine[b:]
engine=engine.replace("if(e.kochRule)return updateKoch(e,p,ghost,guide);", "const analytic=equationUpdate(e,p,ghost,guide);if(analytic)return analytic;const made=constructionUpdate(e,p,ghost,guide)||localTransformationUpdate(e,p,ghost,guide)||transformationUpdate(e,p,ghost,guide)||lateConstructionUpdate(e,p,ghost,guide)||bookConstructionUpdate(e,p,ghost,guide)||specialCurvesUpdate(e,p,ghost,guide);if(made)return{...made,numericConstruction:true};")
engine=engine.replace("return{readout:stage+", "return{numericRecord:r,numericFraction:part,readout:stage+")
engine=engine.replace("if(el&&el.getTotalLength){const pt=el.getPointAtLength(el.getTotalLength()*part);$('#vPoint').innerHTML=dot([pt.x,pt.y],red,3.1/st.scale)}", "const prefix=visibleStrokePrefix(r,part);if(prefix){$('#vPoint').innerHTML=dot(prefix.point,red,3.1/st.scale)}else if(el&&el.getTotalLength){const pt=el.getPointAtLength(el.getTotalLength()*part);$('#vPoint').innerHTML=dot([pt.x,pt.y],red,3.1/st.scale)}")
engine=engine.replace("mode+' · '+done+' / '+N+' 条路径'", "mode+' · '+(r?.aux?'补充线':e.parameter+' · 第 '+(done+1)+' 组')")
# Insert an actual independent-variable sweep for explicit y(x) / x(y) functions.
engine=engine.replace("}else{active=vectorPath(r,st.prefix,part,'data-active-path=\"true\"');", "}else{active=vectorPath(r,st.prefix,part,'data-active-path=\"true\"');")
start=code.index('// Fidelity contract:');end=code.index('function hasStages()',start)
code=code[:start]+engine+'\n'+''.join((root/'math-gallery/src'/f).read_text(encoding='utf-8')+'\n' for f in modules)+code[end:]
# Map every old path-count breakpoint to the retained source-index positions.
patch="""const textSpecs=TEXTSPEC;for(const e of entries){Object.assign(e,textSpecs[e.page]);const m=bookVectors[e.vectorPage],indices=m.sourceIndexes,map=k=>indices.filter(i=>i<k).length;if(e.timeline){let old=0;e.timeline=e.timeline.map(([p,k])=>[p,map(k)]).filter(([p,k],i,a)=>i===0||k!==a[i-1][1]);if(e.timeline.at(-1)[0]!==1)e.timeline.at(-1)[0]=1}if(e.vectorSplitAt)e.vectorSplitAt=map(e.vectorSplitAt);if(['108','145','157'].includes(e.page))delete e.vectorSplitAt;e.method=({curve:'方程作图',rotation:'旋转复制',iteration:'逐步迭代',mask:'分步遮挡',tiling:'重复镶嵌',construction:'几何构造',random:'随机规则'})[e.mode]||'按书构造';e.semanticNote=e.mode==='random'?'随机位置沿用原书样本，便于与静态图案对照。':e.mode==='curve'?'未列出具体数值的参数按图中组次显示；曲线点位与取景按原书校准。':'';if(e.page==='111')e.semanticNote='四组直线按原书文字依次顺时针旋转30°、120°、210°、300°；当前角度与动画同步，完成时保留原书图案。';if(e.page==='190')e.semanticNote='原书方向描述与图示朝向存在差异。本页保留原图，以逐级平移和连接展示台阶构造，供对照核查。';e.duration=Math.max(22,Math.min(e.duration,45))}
""".replace('TEXTSPEC',json.dumps(spec,ensure_ascii=False,separators=(',',':')))
# textSpecs initialization must follow the bookVectors declaration, but precede initial go.
initial=code.index('let initial=entries.findIndex')
numeric_code='const numericParameters='+json.dumps(numeric,ensure_ascii=False,separators=(',',':'))+';\n'+(root/'math-gallery/src/numeric-parameter-ui.js').read_text(encoding='utf-8')+'''\nfor(const e of entries){const durations={150:50,151:60,152:65,153:70,154:75,155:60,156:65,157:55,158:70,159:60,160:55,161:60,162:65,163:70,164:95};if(durations[e.page])e.duration=durations[e.page];const np=numericParameters[e.page];if(np&&!["111","190"].includes(e.page)){e.semanticNote=np.displayNote||(Number(e.page)<20?np.note:'')||"当前参数与正在绘制的曲线对应；≈表示按原图校准的近似值。"}}\n'''
code=code[:initial]+patch+(root/'math-gallery/src/semantic-ui.js').read_text(encoding='utf-8')+'\n'+numeric_code+(root/'math-gallery/src/review-ui.js').read_text(encoding='utf-8')+'\n'+(root/'math-gallery/src/mobile-toc.js').read_text(encoding='utf-8')+'\n'+code[initial:]
code=code.replace("$('#readout').textContent=r.readout;", "$('#readout').textContent=r.readout;updateNumericParameter(e,progress,r);")
s=re.sub(r'(<script id="gallery-code">)[\s\S]*?(</script>)',lambda m:m[1]+code+m[2],s,count=1)
for id,obj in [('gallery-data',data),('vector-data',v)]:s=re.sub(r'(<script id="'+id+r'" type="application/json">)[\s\S]*?(</script>)',lambda m:m[1]+json.dumps(obj,ensure_ascii=False,separators=(',',':'))+m[2],s,count=1)
s=s.replace('<p class="motion-note" id="hint">','<div class="live-equation"><div class="formula-label" id="parameterLabel">当前正在绘制</div><div id="currentParameter"></div><div id="liveMath"></div><div id="parameterInfo"></div></div><p class="motion-note" id="hint">')
s=s.replace('</head>','<style>#currentParameter{font-size:18px;line-height:1.45;font-weight:600;color:var(--green);margin:5px 0 8px;overflow-wrap:anywhere;font-variant-numeric:tabular-nums;user-select:text}#currentParameter:empty{display:none}</style></head>',1)
s,n=re.subn(r'(<span class="canvas-step" id="readout"></span>)(<span class="canvas-corner" id="corner">[^<]*</span>)</div>',r'</div><div class="canvas-readout">\1\2</div>',s,count=1)
assert n==1, 'Expected one dynamic readout below the canvas'
s=s.replace('</head>', '<style>.canvas-readout{display:flex;align-items:flex-start;gap:12px;padding:10px 14px;min-height:3em;border:1px solid var(--line);border-top:0;background:var(--canvas)}.canvas-readout #readout{position:static;flex:1;min-width:0;max-width:none;overflow-wrap:anywhere;line-height:1.55}.canvas-readout #corner{position:static;flex:none;white-space:nowrap}</style></head>',1)
s=s.replace('</head>', '''<style id="semantic-style">.original{padding:0;background:var(--canvas);height:320px;overflow:hidden;border:1px solid var(--line)}.original:hover{background:var(--canvas)}.original>svg{display:block;width:100%;height:100%}.formula{font-size:15px;user-select:text}.formula .katex-display{margin:.4em 0;text-align:left}.formula .katex-display>.katex,#liveMath .katex-display>.katex{text-align:left}#liveMath .katex-display{text-align:left}.live-equation{border:1px solid var(--line);border-bottom:0;padding:11px 16px;background:#eeeede;min-height:72px}#liveMath{overflow-x:auto;max-height:135px;font-size:13px}#parameterInfo{font-size:11px;color:var(--green);margin-top:5px}.live-equation .formula-label{margin:0;font-size:10px}.canvas-step{font-size:11px;max-width:calc(100% - 90px)}#zoomContent svg{background:var(--canvas)}@media(max-width:700px){.original{height:300px}.formula{font-size:14px}.live-equation{padding:10px}#liveMath{font-size:12px}}\n</style></head>''',1)
s=s.replace('</head>', '<style id="review-ui-style">'+(root/'math-gallery/src/review-ui.css').read_text(encoding='utf-8')+'</style></head>',1)
# v19: relocate the original controls so all existing handlers and edge states survive.
previous='<button class="prevnext" id="prev">← 上一幅</button>'
following='<button class="prevnext" id="next">下一幅 →</button>'
assert s.count(previous)==1 and s.count(following)==1
s=s.replace(previous,'<div class="footer-chapter" id="footerChapter" aria-label="当前章节"></div>',1).replace(following,'',1)
page_marker='<div class="page-marker"><span>原书</span><i id="page"></i></div>'
assert s.count(page_marker)==1
s=s.replace(page_marker,'<div class="heading-actions"><nav class="figure-navigation" aria-label="切换图案">'+previous+following+'</nav>'+page_marker+'</div>',1)
# v20: retain top controls and add a clearly grouped chapter browser at the foot.
footer_label='<div class="footer-chapter" id="footerChapter" aria-label="当前章节"></div>'
footer_heading='<div class="footer-chapter-head"><div><div class="footer-label">本章图案</div><h2 class="footer-chapter" id="footerChapter" aria-label="当前章节"></h2></div><span class="chapter-position" id="chapterPosition"></span></div>'
assert s.count(footer_label)==1
s=s.replace(footer_label,footer_heading,1)
samples_end='<nav class="samples" id="samples" aria-label="本章图案"></nav></div>'
assert s.count(samples_end)==1
footer_buttons='<nav class="footer-turning" aria-label="底部切换图案"><button class="prevnext" id="footerPrev">← 上一幅</button><button class="prevnext" id="footerNext">下一幅 →</button></nav>'
s=s.replace(samples_end,'<nav class="samples" id="samples" aria-label="本章图案"></nav>'+footer_buttons+'</div>',1)
s=s.replace('原图校准版','构造校订版')
s=s.replace('<html lang="zh-CN">',f'<html lang="zh-CN" data-gallery-version="{version}">')
s=s.replace('<div class="header-tools">',f'<div class="header-tools"><span class="version-badge">修订版 v{version} · {release_date}</span>',1)
s=s.replace('全12章 · 174个图案页面 · 构造校订版',f'全12章 · 174个图案页面 · 修订版 v{version}（{release_date}）')
s=add_qr_links(s,root,version)
# Every delivery has identical UTF-8 bytes, including on Windows.
payload=s.encode('utf-8')
outputs=[root/project['canonical_filename'],root/project['offline_filename'],root/'dist/index.html',root/'dist'/project['offline_filename'],root/'math-gallery/dist/index.html']
for out in outputs:out.write_bytes(payload)
(root/'math-gallery/check-semantic.js').write_bytes(code.encode('utf-8'))
(root/'math-gallery/semantic-data.json').write_bytes(json.dumps(data,ensure_ascii=False).encode('utf-8'))
(root/'math-gallery/semantic-specs.json').write_bytes(json.dumps(spec,ensure_ascii=False).encode('utf-8'))
print(len(payload),'bytes · v'+version)
