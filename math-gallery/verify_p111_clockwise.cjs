const fs=require('fs'),vm=require('vm'),assert=require('assert');const html=fs.readFileSync('../数学奇妙笔记本_全书动态版_离线.html','utf8'),code=fs.readFileSync('check-semantic.js','utf8');
const elements={};function get(k){if(!elements[k]){let html='';elements[k]={textContent:'',get innerHTML(){return html},set innerHTML(v){html=v;if(k==='#drawing')for(const x of ['#vDone','#vActive','#vPoint'])if(elements[x])elements[x].innerHTML=''},insertAdjacentHTML(_,v){html+=v},value:'1',checked:false,disabled:false,open:false,matches:()=>false,closest:()=>null,setAttribute(){},focus(){},showModal(){this.open=true},close(){this.open=false}}}return elements[k]}
get('#gallery-data').textContent=html.match(/<script id="gallery-data" type="application\/json">([\s\S]*?)<\/script>/)[1];get('#vector-data').textContent=html.match(/<script id="vector-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const c={console,Math,JSON,Number,Array,Map,Set,document:{compatMode:'CSS1Compat',querySelector:get,addEventListener(){},title:'',hidden:false},location:{hash:''},history:{replaceState(){}},cancelAnimationFrame(){},requestAnimationFrame(){return 1},setTimeout(){}};vm.createContext(c);
const katexSource=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(x=>x.includes('renderToString')&&x.length>100000);vm.runInContext(katexSource,c);vm.runInContext(code,c);const run=s=>vm.runInContext(s,c),goPage=n=>run('go(entries.findIndex(e=>+e.page==='+n+'))');

goPage(111);
for(let k=0;k<4;k++){
 let previous=-Infinity;
 for(const q of [0,.1,.5,.9,.999999]){
  run('seek('+((k+q)/4)+')');
  const angle=Number(get('#vActive').innerHTML.match(/rotate\(([-.0-9]+)/)[1]);
  assert(angle>previous,'p111 must rotate clockwise');previous=angle;
 }
}
run('seek(1)');assert.equal(get('#vDone').innerHTML,run('vectorState.m.paths.map(r=>vectorPath(r,vectorState.prefix)).join("")'));
console.log('PASS: p111 all four groups clockwise; final original geometry preserved.');
