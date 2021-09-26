$(document).ready(function(){
    const pjax = new Pjax({
    elements: ['a[href]:not([no-pjax]):not(.sidebar-toc a)'],
      selectors: [
        'head title',
        '[pjax]',
        '.site-main',
        // '.sidebar-toc', '.sidebar-docs', '.sidebar-nav',
        // 'script[type="application/json"]:not([no-pjax])',
      ],
      // analytics: false,
      // cacheBust: false,
      // scrollTo : false
    });
});
