const fs=require('fs'),vm=require('vm'),assert=require('assert');const html=fs.readFileSync('../数学奇妙笔记本_全书动态版_离线.html','utf8'),code=fs.readFileSync('check-semantic.js','utf8');
const elements={};function get(k){if(!elements[k]){let html='';elements[k]={textContent:'',get innerHTML(){return html},set innerHTML(v){html=v;if(k==='#drawing')for(const x of ['#vDone','#vActive','#vPoint'])if(elements[x])elements[x].innerHTML=''},insertAdjacentHTML(_,v){html+=v},value:'1',checked:false,disabled:false,open:false,matches:()=>false,closest:()=>null,setAttribute(){},focus(){},showModal(){this.open=true},close(){this.open=false}}}return elements[k]}
get('#gallery-data').textContent=html.match(/<script id="gallery-data" type="application\/json">([\s\S]*?)<\/script>/)[1];get('#vector-data').textContent=html.match(/<script id="vector-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
const c={console:{log(){},warn(){},error(){}},Math,JSON,Number,Array,Map,Set,document:{compatMode:'CSS1Compat',querySelector:get,addEventListener(){},title:'',hidden:false},location:{hash:''},history:{replaceState(){}},cancelAnimationFrame(){},requestAnimationFrame(){return 1},setTimeout(){}};vm.createContext(c);
const katexSource=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(x=>x.includes('renderToString')&&x.length>100000);vm.runInContext(katexSource,c);vm.runInContext(code,c);const run=s=>vm.runInContext(s,c),goPage=n=>run('go(entries.findIndex(e=>+e.page==='+n+'))');



goPage(2);assert(get('#footerPrev').disabled);assert(get('#prev').disabled);assert.equal(get('#chapterPosition').textContent,'1 / 19 幅');
get('#footerNext').onclick();assert.equal(run('entries[index].page'),'3');assert(!get('#footerPrev').disabled);assert.equal(get('#chapterPosition').textContent,'2 / 19 幅');
get('#prev').onclick();assert.equal(run('entries[index].page'),'2');assert(get('#footerPrev').disabled);
goPage(23);assert.equal(get('#footerChapter').textContent,'第2章 · 抛物线：运动的余迹');assert.equal(get('#chapterPosition').textContent,'1 / 17 幅');
run('go(entries.length-1)');assert(get('#footerNext').disabled);assert(get('#next').disabled);get('#footerPrev').onclick();assert(!get('#footerNext').disabled);
console.log('PASS top and bottom navigation, chapter position, chapter heading and disabled boundary states.');
