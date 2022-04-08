document.addEventListener("DOMContentLoaded", function() {
    // Init Pjax instance
    new Pjax({
        elements: ["a[href]:not([no-pjax])"],
        selectors: [
            "[data-pjax]",
            "head title",
            "meta[property]",
        ],
        cacheBust: false,
        analytics: false,
    });
});


document.addEventListener("pjax:complete", function(){
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

var loadingBar = document.querySelector(".loading-track");
var progress = document.querySelector(".loading-progress");

// Pjax 开始时执行的函数
document.addEventListener("pjax:send", function () {
  loadingBar.classList.add("loading");
});

// Pjax 完成之后执行的函数
document.addEventListener("pjax:complete", function () {
  loadingBar.classList.remove("loading");
});
