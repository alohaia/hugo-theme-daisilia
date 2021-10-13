new Pjax({
    elements: ['a[href]:not([no-pjax], .sidebar-toc a, .doc-structure-container a)'],
    selectors: [
        '[data-pjax]',
        'head title',
        'meta[property]',
        '.sidebar-toc', '.sidebar-nav',
        '.site-content',
        '.js-each',
        '.site-right',
    ],
    cacheBust: false,
});
new Pjax({
    elements: ['.doc-structure-container a[href]'],
    selectors: [
        '[data-pjax]',
        'head title',
        'meta[property]',
        '.sidebar-toc', '.sidebar-nav',
        '.site-content',
        '.js-each',
    ],
    cacheBust: false,
});

document.addEventListener("pjax:complete", function(){
    for(let i = 0; i < navs.length; i++){
        if(i != 0){
            pannels[i].classList.remove("active");
        } else {
            pannels[i].classList.add("active");
        }
    }
    new Pjax({
        elements: ['.doc-structure-container a[href]'],
        selectors: [
            '[data-pjax]',
            'head title',
            'meta[property]',
            '.sidebar-toc', '.sidebar-nav',
            '.site-content',
            '.js-each',
        ],
        cacheBust: false,
    });
    if(document.querySelector('iframe.giscus-frame')) {
        document.querySelector('iframe.giscus-frame').contentWindow.postMessage({
          giscus: {
            setConfig: {
              term: document.title
            }
          }
        }, 'https://giscus.app')
    }
})
