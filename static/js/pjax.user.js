var pjax;
const siteRoot = document.getElementById("SiteRoot");
var lastSeries = decodeURI(window.location.pathname.split("/")[2]);

document.addEventListener("DOMContentLoaded", function() {
    // Init Pjax instance
    pjax = new Pjax({
        elements: ["a[href]:not([no-pjax]):not([href^='#']):not([target='_blank'])"],
        selectors: [
            "[data-pjax]",
            "head title",
            "meta[property]",
        ],
        cacheBust: false,
        analytics: false,
        scrollTo: document.getElementById("SiteHeader").scrollHeight,
    });
});

// Pjax 开始时执行的函数
document.addEventListener("pjax:send", function () {
    siteRoot.classList.add("pjax-loading");

    document.querySelectorAll('.heading').forEach((heading) => {
        TOCOnscrollObserver.unobserve(heading);
    });

    summaryContentEl.classList.add("force-hide");
});

// Pjax 完成之后执行的函数
document.addEventListener("pjax:complete", function () {
    siteRoot.classList.remove("pjax-loading");

    // update giscus
    if(document.querySelector('iframe.giscus-frame')) {
        document.querySelector('iframe.giscus-frame').contentWindow.postMessage({
          giscus: {
            setConfig: {
              term: document.title
            }
          }
        }, 'https://giscus.app')
    }

    // observe headings
    document.querySelectorAll('.heading').forEach((heading) => {
        TOCOnscrollObserver.observe(heading);
    });

    loadOrRefershThirdPartyScripts();

    // series list
    var currentSeries = decodeURI(window.location.pathname.split("/")[2]);
    if (
        window.location.pathname.split("/")[1] == "series"
        && currentSeries
        && lastSeries
        && currentSeries != lastSeries
        ) {
        pjax.switchSelector(window.location.pathname, {selectors: ["#SeriesList"]}, function() {
            pjax.refresh(document.getElementById("SeriesList"));
            initSeriesList();

            lastSeries = currentSeries;
        })
    } else {
        updateSeriesList();
    }
});
