const fs=require('fs'),vm=require('vm'),assert=require('assert');const html=fs.readFileSync('../数学奇妙笔记本_全书动态版_离线.html','utf8'),code=fs.readFileSync('check-semantic.js','utf8');
const elements={};function get(k){if(!elements[k]){let html='';elements[k]={textContent:'',get innerHTML(){return html},set innerHTML(v){html=v;if(k==='#drawing')for(const x of ['#vDone','#vActive','#vPoint'])if(elements[x])elements[x].innerHTML=''},insertAdjacentHTML(_,v){html+=v},value:'1',checked:false,disabled:false,open:false,matches:()=>false,closest:()=>null,setAttribute(){},focus(){},showModal(){this.open=true},close(){this.open=false}}}return elements[k]}
get('#gallery-data').textContent=html.match(/<script id="gallery-data" type="application\/json">([\s\S]*?)<\/script>/)[1];get('#vector-data').textContent=html.match(/<script id="vector-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const c={console:{log(){},warn(){},error(){}},Math,JSON,Number,Array,Map,Set,document:{compatMode:'CSS1Compat',querySelector:get,addEventListener(){},title:'',hidden:false},location:{hash:''},history:{replaceState(){}},cancelAnimationFrame(){},requestAnimationFrame(){return 1},setTimeout(){}};vm.createContext(c);
const katexSource=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(x=>x.includes('renderToString')&&x.length>100000);vm.runInContext(katexSource,c);vm.runInContext(code,c);const run=s=>vm.runInContext(s,c),goPage=n=>run('go(entries.findIndex(e=>+e.page==='+n+'))');



for(const n of [2,3,60,131,132,135,150,154]){
 goPage(n);const plan=run('vectorState._equationPlan'),end=plan.mainEnd??(plan.refs.length?.92:1),N=plan.curves.length;
 const values=[];
 for(const k of [0,Math.min(1,N-1)]){
  const frames=[];
  for(const q of [.2,.7]){
   run('seek('+((k+q)/N*end)+')');frames.push({lower:get('#currentParameter').textContent,tex:get('#liveMath').innerHTML,canvas:get('#readout').textContent});
  }
  assert.equal(frames[0].lower,frames[1].lower,'lower continuous value p'+n);
  assert.equal(frames[0].tex,frames[1].tex,'lower equation changes continuously p'+n);
  assert.notEqual(frames[0].canvas,frames[1].canvas,'canvas must retain continuous values p'+n);
  values.push(frames[0].lower);
 }
 if([2,3,60,131,132,135,150,154].includes(n)&&N>1)assert.notEqual(values[0],values[1],'discrete parameter should change p'+n);
}
goPage(132);run('seek(.01)');assert(get('#currentParameter').textContent.includes('c = '));assert(!/[θxy]\s*=/.test(get('#currentParameter').textContent));assert(get('#readout').textContent.includes('θ = '));
console.log('PASS lower text and equation stay fixed within a curve; c and discrete λ change between curves; canvas retains continuous x/y/θ/t.');
