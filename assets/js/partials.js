/*
Inject simple HTML partials into pages with smart fallbacks.
Usage in any page:
  <div data-include="partials/header.html"></div>
  ... page content ...
  <div data-include="partials/footer.html"></div>
Notes:
- Works whether your page is at /index.html or /ecosystems/page.html
- Tries relative path first, then root-relative ("/partials/...")
*/
(function injectPartials(){
  const placeholders = document.querySelectorAll('[data-include]');
  if (!placeholders.length) return;

  const tryFetch = async (url) => {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status + ' ' + url);
    return res.text();
  };

  const load = async (el) => {
    const src = el.getAttribute('data-include');
    const rootSrc = '/' + src.replace(/^\/?/, '');

    try {
      // 1) Try as-is (relative to current page)
      const html = await tryFetch(src);
      el.outerHTML = html;
    } catch (e1) {
      try {
        // 2) Try root-relative (from server root)
        const html2 = await tryFetch(rootSrc);
        el.outerHTML = html2;
      } catch (e2) {
        console.error('Partial failed for', src, 'and', rootSrc, e1, e2);
      }
    }
  };

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=> placeholders.forEach(load));
  } else {
    placeholders.forEach(load);
  }
})();