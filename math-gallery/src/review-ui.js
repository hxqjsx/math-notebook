// Fullscreen labels follow actual browser state, including an Escape exit.
function syncFullscreenButton(){
 const on=Boolean(document.fullscreenElement||document.webkitFullscreenElement),button=$('#fullBtn');
 button.textContent=on?'退出全屏':'全屏';
 button.setAttribute('aria-pressed',String(on));
 button.setAttribute('aria-label',on?'退出全屏':'进入全屏');
 button.title=on?'退出全屏（也可按 Esc）':'进入全屏';
}
$('#fullBtn').onclick=async()=>{
 const button=$('#fullBtn');button.disabled=true;
 try{
  if(document.fullscreenElement||document.webkitFullscreenElement){
   const exit=document.exitFullscreen||document.webkitExitFullscreen;
   if(!exit)throw new Error('Fullscreen exit unavailable');
   await exit.call(document);
  }else{
   const root=document.documentElement,enter=root.requestFullscreen||root.webkitRequestFullscreen;
   if(!enter)throw new Error('Fullscreen unavailable');
   await enter.call(root);
  }
 }catch{
  const el=document.createElement('div');el.className='toast';el.textContent='请使用浏览器菜单进入或退出全屏';document.body.append(el);setTimeout(()=>el.remove(),3000);
 }finally{button.disabled=false;syncFullscreenButton()}
};
document.addEventListener('fullscreenchange',syncFullscreenButton);
document.addEventListener('webkitfullscreenchange',syncFullscreenButton);
syncFullscreenButton();
