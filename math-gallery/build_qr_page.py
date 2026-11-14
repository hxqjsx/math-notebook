"""Build separate QR destinations, retaining offline capability when requested."""
import base64
import json

def add_qr_links(html, root, version):
    template = (root / 'math-gallery/src/qr-page.html').read_text(encoding='utf-8')
    definitions = {
        'book.html': ('book.jpg', '了解《数学奇妙笔记本》', '使用微信扫一扫，查看书籍详情，手机上也可保存图片后在微信中识别。', '数学奇妙笔记本购买二维码', 1020, 2208),
        'teacher.html': ('teacher.jpg', '关注胡小群老师', '使用微信扫一扫，关注胡小群讲数学视频号。手机上也可保存图片后在微信中识别。', '胡小群讲数学视频号二维码', 740, 960),
    }
    pages = {}
    for filename, (image, title, instruction, alt, width, height) in definitions.items():
        uri = 'data:image/jpeg;base64,' + base64.b64encode((root / 'assets/qr' / image).read_bytes()).decode('ascii')
        page = template
        for key, value in {'VERSION': version, 'TITLE': title, 'INSTRUCTION': instruction, 'IMAGE': uri, 'ALT': alt, 'WIDTH': width, 'HEIGHT': height}.items():
            page = page.replace('{{' + key + '}}', str(value))
        pages[filename] = page
        (root / 'dist' / filename).write_text(page, encoding='utf-8')
    # Old online links also land on exactly one corresponding QR page.
    (root / 'dist/about.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>二维码入口</title><script>location.replace(location.hash==='#teacher'?'teacher.html':'book.html')</script><p><a href="book.html">了解《数学奇妙笔记本》</a> · <a href="teacher.html">关注胡小群老师</a></p></html>''', encoding='utf-8')
    links = '<nav class="qr-header-links" aria-label="了解书籍与关注老师"><a href="book.html" target="_blank" rel="noopener noreferrer">点这里了解《数学奇妙笔记本》</a><a href="teacher.html" target="_blank" rel="noopener noreferrer">点这里关注胡小群老师</a></nav>'
    assert html.count('<div class="header-tools">') == 1
    html = html.replace('<div class="header-tools">', links + '<div class="header-tools">', 1)
    css = (root / 'math-gallery/src/qr-links.css').read_text(encoding='utf-8')
    assert '<style id="review-ui-style">' in html
    html = html.replace('<style id="review-ui-style">', '<style id="qr-links-style">' + css + '</style><style id="review-ui-style">', 1)
    payload = json.dumps(pages, ensure_ascii=False).replace('<', '\\u003c')
    offline = '''<script id="qr-offline-links">if(location.protocol==='file:'){
const pages=JSON.parse(document.querySelector('#qr-page-data').textContent);
for(const link of document.querySelectorAll('.qr-header-links a')){
const page=pages[link.getAttribute('href')];
if(page)link.href=URL.createObjectURL(new Blob([page],{type:'text/html;charset=utf-8'}));
}
}</script>'''
    return html.replace('</body>', '<script id="qr-page-data" type="application/json">'+payload+'</script>'+offline+'</body>', 1)
