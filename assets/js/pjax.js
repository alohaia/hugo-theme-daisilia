document.addEventListener("DOMContentLoaded", function() {
    // Init Pjax instance
    new Pjax({
        elements: ["a[href]:not([no-pjax])"],
        selectors: [
            "[data-pjax]",
            "head title",
            "meta[property]",
            ".sidebar-toc", ".sidebar-nav",
            ".site-content",
            ".js-each",
            ".site-right",
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
var timer = null;

// Pjax 开始时执行的函数
document.addEventListener("pjax:send", function () {
  // 进度条默认已经加载 20%
  var loadingBarWidth = 20;
  // 进度条的最大增加宽度
  var MAX_LOADING_WIDTH = 95;

  // 显示进度条
  loadingBar.classList.add("loading");
  // 初始化进度条的宽度
  progress.style.width = loadingBarWidth + "%";

  clearInterval(timer);
  timer = setInterval(function () {
    // 进度条的增加速度（可以改为一个随机值，显得更加真实）
    loadingBarWidth += 3;

    // 当进度条到达 95% 后停止增加
    if (loadingBarWidth > MAX_LOADING_WIDTH) {
      loadingBarWidth = MAX_LOADING_WIDTH;
    }

    progress.style.width = loadingBarWidth + "%";
  }, 500);
});

// Pjax 完成之后执行的函数
document.addEventListener("pjax:complete", function () {
  clearInterval(timer);
  progress.style.width = "100%";
  loadingBar.classList.remove("loading");

  setTimeout(function () {
    progress.style.width = 0;
  }, 400);
});
