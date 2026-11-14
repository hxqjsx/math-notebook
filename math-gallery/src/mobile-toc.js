// A controlled mobile disclosure closes as soon as a chapter is selected.
const renderDesktopToc=renderToc;
renderToc=function(chapter){
 renderDesktopToc(chapter);
 const picker='<div class="toc-mobile-picker"><span class="toc-mobile-label">选择章节</span><details class="toc-mobile-dropdown"><summary id="tocMobileToggle">'+chapter.replace(' / ',' · ')+'<span aria-hidden="true">⌄</span></summary><div class="toc-mobile-options" role="group" aria-label="选择章节">'+chapterGroups.map((c,n)=>'<button data-mobile-chapter="'+n+'" aria-pressed="'+(c===chapter)+'">'+c.replace(' / ',' · ')+'</button>').join('')+'</div></details></div>';
 $('#modalBody').innerHTML=$('#modalBody').innerHTML.replace('<div class="toc-layout">',picker+'<div class="toc-layout">');
};
const desktopTocClick=$('#modalBody').onclick;
$('#modalBody').onclick=e=>{
 const button=e.target.closest('[data-mobile-chapter]');
 if(!button){desktopTocClick(e);return;}
 const chapter=chapterGroups[Number(button.dataset.mobileChapter)];
 if(!chapter)return;
 renderToc(chapter);
 $('#tocMobileToggle').focus();
};
