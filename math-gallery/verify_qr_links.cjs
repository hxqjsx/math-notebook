const fs=require('fs'),vm=require('vm'),assert=require('assert');
const project=JSON.parse(fs.readFileSync('../project.json','utf8'));
const html=fs.readFileSync('../dist/index.html','utf8');
assert.equal(fs.readFileSync('../dist/'+project.offline_filename,'utf8'),html);
const links=[...html.matchAll(/<a href="(book|teacher)\.html" target="_blank" rel="noopener noreferrer">([^<]+)<\/a>/g)];
assert.deepEqual(links.map(m=>m[2]),['点这里了解《数学奇妙笔记本》','点这里关注胡小群老师']);
const pages={};
for(const name of ['book','teacher']){
 const page=fs.readFileSync('../dist/'+name+'.html','utf8');pages[name+'.html']=page;
 const sources=[...page.matchAll(/src="data:image\/jpeg;base64,([^"]+)"/g)];
 assert.equal(sources.length,1,name+' page must contain exactly one QR image');
 const bytes=Buffer.from(sources[0][1],'base64');assert(bytes.equals(fs.readFileSync('../assets/qr/'+name+'.jpg')),name+' original QR bytes');
 const other=name==='book'?'teacher':'book';assert(!bytes.equals(fs.readFileSync('../assets/qr/'+other+'.jpg')));
}
const payload=html.match(/<script id="qr-page-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
assert.deepEqual(JSON.parse(payload),pages);
const code=html.match(/<script id="qr-offline-links">([\s\S]*?)<\/script>/)[1];
for(const protocol of ['file:','https:']){
 const anchors=links.map(m=>({href:m[1]+'.html',getAttribute(){return this.href}}));const texts=[];
 const context={location:{protocol},document:{querySelector:()=>({textContent:payload}),querySelectorAll:()=>anchors},Blob:class{constructor(parts){texts.push(parts.join(''))}},URL:{createObjectURL(){return 'blob:qr-'+texts.length}}};
 vm.runInNewContext(code,context);
 if(protocol==='file:'){assert.deepEqual(texts,[pages['book.html'],pages['teacher.html']]);assert.deepEqual(anchors.map(a=>a.href),['blob:qr-1','blob:qr-2'])}
 else{assert.equal(texts.length,0);assert.deepEqual(anchors.map(a=>a.href),['book.html','teacher.html'])}
}
console.log('PASS independent book/teacher new-tab destinations, one matching original QR per page, and retained offline capability.');
