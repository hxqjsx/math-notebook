// A parameter value belongs to a particular printed curve, not to the overall
// animation percentage. Source indices survive visibility filtering and clips.
let numericDisplayKey='',numericEquationKey='';
function numericSequence(records,t){if(!records?.length||t<0||t>=1)return null;const v=t*records.length,k=Math.floor(v);return{record:records[k],fraction:v-k}}
function numericConstructSelection(e,p){
 const st=vectorState,n=+e.page;if(!st||p>=1)return null;
 if(n===64&&p<.32)return numericSequence(st.bcCircularPatch?.base,p/.32);
 if(n===145&&p<.3)return numericSequence(st.bcWhiteLeaves?.base,p/.3);
 if(n===181&&p>=.12&&p<.94){const m=st.bcBelly,v=(p-.12)/.82*m.rows.length,k=Math.floor(v),row=m.rows[k];return{record:row.lines[0]||row.curves[0],fraction:v-k}}
 if(n===167&&p>=.12){const m=st.latePlan,v=(p-.12)/.88*(m.lines.length+1),k=Math.floor(v);if(k<m.lines.length)return{record:m.lines[k],fraction:v-k}}
 if(n===185&&p<.68){const m=st.latePlan,v=p/.68*(m.curves.length+1),k=Math.floor(v);if(k<m.curves.length)return{record:m.curves[k],fraction:v-k}}
 if(n===61&&p<.94){const m=st.scYoyo,v=p/.94*m.pairs.length,k=Math.floor(v);return{record:m.pairs[k].line,fraction:v-k}}
 if((n===66||n===70)&&p<.94){const m=st.scJoined,v=p/.94*m.groups.length,k=Math.floor(v);return{record:m.groups[k].arc,fraction:v-k}}
 if(n===65){if(p<.6)return numericSequence(st.scBird?.lines,p/.6);if(p<.85)return{record:st.scBird?.bend,fraction:(p-.6)/.25}}
 if(n===74&&p<.94)return numericSequence(st.scCups?.curves.map(x=>x.r),p/.94);
 if(n===75&&p<.94)return numericSequence(st.scSynth?.g,p/.94);
 if(n===88&&p<.94)return numericSequence(st.scLimit?.g,p/.94);
 return null;
}
function numericRecordValue(e,selection){
 if(!selection?.record)return null;
 const m=bookVectors[e.vectorPage],index=m.paths.indexOf(selection.record),sourceIndex=m.sourceIndexes[index],page=numericParameters[e.page];
 let record=page?.records?.[sourceIndex];if(!record)return null;
 if(record.segments){const f=selection.fraction||0;record=record.segments.find(s=>f>=s.from&&f<s.to)||record.segments.at(-1)}
 const samples=record.samples||record.tSamples;
 if(samples?.length){const variable=record.variable||'t',t=numericSample(samples,selection.fraction||0),prefix=/随当前描点变化/.test(record.text)?'':record.text+' · ';record={...record,text:prefix+variable+' ≈ '+numericDecimal(t,3),displayNote:variable+' 由当前描点在原方程上的位置确定，随轨迹前进、暂停和倒拖同步更新。'}}
 return record;
}
function numericDecimal(v,digits=3){return Number(v.toFixed(digits)).toString().replace('-', '−')}
function numericSample(samples,f){const fraction=s=>Array.isArray(s)?s[0]:s.fraction,value=s=>Array.isArray(s)?s[1]:s.t;let lo=0,hi=samples.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(fraction(samples[mid])<=f)lo=mid;else hi=mid-1}const a=samples[lo],b=samples[Math.min(lo+1,samples.length-1)],q=fraction(b)>fraction(a)?Math.max(0,Math.min(1,(f-fraction(a))/(fraction(b)-fraction(a)))):0;return value(a)+(value(b)-value(a))*q}
// Presentation only: do not change the drawing result, point or canvas readout.
function numericLowerDisplay(e,p,live,selection,value,current){
 const plan=vectorState?._equationPlan,end=plan?.mainEnd??(plan?.refs?.length?.92:1);
 if(plan?.curves?.length&&(p<end||p>=1)){
  const N=plan.curves.length,i=p>=1?N-1:Math.min(N-1,Math.floor(Math.max(0,p)/end*N)),curve=plan.curves[i];
  const samples=[.137,.613,.877].map(q=>{const t=curve.t0+(curve.t1-curve.t0)*q;return String(typeof curve.params==='function'?curve.params(t):curve.params||'').split(' · ').map(s=>s.trim()).filter(Boolean)});
  const fixed=samples[0].filter(part=>samples.every(parts=>parts.includes(part)));
  return{text:(fixed.join(' · ')||'按当前方程绘制')+(p>=1?' · 全部完成':''),equation:typeof curve.tex==='string'?curve.tex:e.tex,detail:live?.detail||current.detail};
 }
 // Construction counters and curve-family parameters change in discrete steps.
 // Motion coordinates, scan fractions, radii and rotation/scale progress stay on canvas.
 const refs=plan?.refs||[],ref=p>=end&&p<1?refs[Math.min(refs.length-1,Math.floor((p-end)/(1-end)*refs.length))]:null;
 const source=(ref?numericRecordValue(e,{record:ref,fraction:0})?.text:'')||value?.text||live?.values||current.text||'';
 const fixed=source.split(' · ').map(s=>s.trim()).filter(part=>
  /^(?:c|c\/c₁|n|N|k|m|σ)\s*(?:[=≈]|从|为)/.test(part)||
  /^(?:第\s*\d+|已保留\s*\d+|目标角|补充|自动补|全部完成|构造完成|横线与螺线)/.test(part)||
  ((ref||selection?.record?.aux)&&/^[xy]\s*=/.test(part)));
 return{text:p>=1?'全部完成':fixed.join(' · ')||'按当前构造绘制',equation:e.tex,detail:e.parameter||e.description};
}
function updateNumericParameter(e,p,result){
 const selection=result.numericRecord?{record:result.numericRecord,fraction:result.numericFraction}:result.numericConstruction?numericConstructSelection(e,p):null;
 const value=numericRecordValue(e,selection),page=numericParameters[e.page];
 let label=p===1?'绘制完成':p===0?'准备绘制':'当前正在绘制',text='',detail='',equation=e.tex;
 let live=result.live;
 if(!live&&result.numericConstruction)live=eqConstructionState(e,p,result,vectorState);
 if(!live&&result.numericRecord)live=eqSourceLive(e,result.numericRecord,result.numericFraction||0,result.numericRecord.aux?'自动补全原图辅助线':'当前曲线');
 if(!live&&p>=1&&vectorState?.m.paths.length)live=eqSourceLive(e,vectorState.m.paths.at(-1),1,'完整图案');
 if(live){text=live.values;equation=live.tex;detail=live.detail||'';const plan=vectorState?._equationPlan;$('#fineNote').textContent=plan?.note||((e.page==='111'||e.page==='190')?e.semanticNote:'动画中的方程、参数与当前描点同步；原书未注明的绘图尺度已按图案校准。')}
 else if(p===1){text='全部完成';detail='所有曲线及补充线均已画完。'}
 else if(value){text=value.text;detail=value.displayNote||(value.relativeC!==undefined?'以本图第一条曲线的参数 c₁ 为基准，显示 c/c₁ 的比例。':value.approximate?'数值由原图校准，使用近似值。':/补齐|辅助|补充/.test(text)?'正在自动完成原书的补充线。':'参数在本条线绘制过程中保持不变，换下一条时更新。');if(value.equation&&!value.approximate){equation=value.equation.replaceAll('−','-');if(Number.isFinite(value.c)){const c=value.c<0?'('+value.c+')':String(value.c);equation=equation.replace(/(?<![A-Za-z\\])c(?![A-Za-z_])/g,c)}}}
 else if(selection?.record?.aux){text='补充原图辅助线';detail='主图参数绘制已完成，正在自动补线。'}
 else if(result.numericConstruction){label='当前构造';text=result.readout;detail=''}
 else if(selection&&page?.unresolved){text='当前参数尚待核定';detail=page.displayNote||'原书未列出此处具体参数取值，暂不显示未经核定的数值。'}
 else{text=result.readout;detail=''}
 ({text,detail,equation}=numericLowerDisplay(e,p,live,selection,value,{text,detail,equation}));
 const key=e.page+'|'+label+'|'+text+'|'+detail+'|'+equation;
 if(key!==numericDisplayKey){numericDisplayKey=key;$('#parameterLabel').textContent=label;$('#currentParameter').textContent=text;$('#parameterInfo').textContent=detail;}
 if(numericEquationKey!==equation){numericEquationKey=equation;$('#liveMath').innerHTML=katex.renderToString(equation,{displayMode:true,throwOnError:false});}
}
