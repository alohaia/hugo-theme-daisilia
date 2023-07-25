$("sidebar-content").ready(function(){
    // add numbers
    let toc = document.getElementById("TableOfContents");
    if(toc && !toc.classList.contains("numbered")){
        toc.classList.add("numbered");
        genUlNum(toc.children[0]);
    }
    // add click events for nav entries
    let navs = document.getElementsByClassName("sidebar-nav-item");
    let pannels = document.getElementsByClassName("sidebar-pannel");
    for(let i in navs) {
        navs[i].onclick = function(){
            switchPannel(i);
        }
    }
    // active first non-empty pannel
    for(let i in pannels) {
        if(pannels[i].childElementCount > 0){
            switchPannel(i);
            break;
        }
    }

    if (document.getElementById("TOCTitle")) {
        document.getElementById("TOCTitle").onclick = back2Top;
    }

    function updateScrollPercent() {
        const bkt = document.getElementById("Back2top");
        const prog = document.getElementById("Back2topProgress");
        var h = document.documentElement,
            b = document.body,
            st = 'scrollTop',
            sh = 'scrollHeight';
        var percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;

        if (percent == 0) {
            bkt.style.display = "none";
        } else {
            bkt.style.display = null;
            prog.innerText = (percent < 99 ? Math.round(percent) : 100) + "%";
        }
    }
    updateScrollPercent()
    window.onscroll = function() {
        updateScrollPercent();
    }
})

// https://css-tricks.com/how-to-animate-the-details-element-using-waapi/
document.querySelectorAll('details').forEach((el) => {
  new Accordion(el);
});

document.querySelectorAll(".article-content a[href^=\"#\"]").forEach(function (el) {
    var id = decodeURI(el.getAttribute("href")).slice(1);
    if (! document.getElementById(id)) {
        el.outerHTML = el.innerHTML;
    }
})

// HoverSummary
for (anchor of document.querySelectorAll("a.page")) {
    var timeOutId;
    var lastHoverEl;
    anchor.addEventListener("mouseenter", function(e) {
        if (lastHoverEl == this) { clearTimeout(timeOutId) };
        lastHoverEl = this;
        timeOutId = setTimeout(()=>{
            summaryContentEl.classList.remove("force-hide");

            var linkHref = this.getAttribute("href");
            var linkAnchor = this.innerText.split("#")[1];
            if (USE_TEXT_ANCHOR) {
                var linkAnchor = linkAnchor ? linkAnchor : linkHref.split("#")[1];
            }
            var p = summaries[linkHref.split("#")[0].toLowerCase()];
            summaryContentEl.innerHTML =
                `<div id="HoverSummaryInner" class="article-content">
                    <h4 class="hover-summary-title">
                        <a href="${linkHref.split("#")[0]}">${p.title}</a>
                        ${linkAnchor ? ('<a href="' + linkHref +'">#' + decodeURI(linkAnchor) + '</a>') : ''}
                    </h4>
                    ${p.summary != '' ? ('<div class="hover-summary-content summary">' + p.summary + '</div>') : ''}
                </div>`;
            const inner = document.getElementById("HoverSummaryInner");
            // refresh pjax
            window.pjax.refresh(inner);

            var anchorOffset = this.getBoundingClientRect();
            var x = e.clientX - anchorOffset.left;
            x = (x < 20 || x > summaryContentEl.clientWidth - 20) ? 20 : x;

            summaryContentEl.style.left = offsetToBody(this, "left") + document.body.getBoundingClientRect().x + "px";
            summaryContentEl.style.right = null;
            if (offsetToBody(this, "left") + summaryContentEl.clientWidth >= document.body.clientWidth) {
                summaryContentEl.style.left = null;
                summaryContentEl.style.right = "3px";

                x = summaryContentEl.clientWidth - document.body.offsetWidth - document.body.getBoundingClientRect().x + e.clientX;
                x = Math.min(x, summaryContentEl.clientWidth - 20);
            };

            var top = offsetToBody(this, "top") + this.offsetHeight + HOVER_SUMMARY_MARGIN;
            var maxHeight = null;
            if (anchorOffset.top > (document.body.clientHeight - anchorOffset.bottom)) {
                top = offsetToBody(this, "top") - summaryContentEl.clientHeight - HOVER_SUMMARY_MARGIN;
                inner.style.clipPath = `polygon(0 calc(100% - 5px), ${x-5}px calc(100% - 5px), ${x}px 100%, ${x+5}px calc(100% - 5px), 100% calc(100% - 5px), 100% 0, 0 0)`;
                // max height
                if (top < 0) {
                    maxHeight = summaryContentEl.offsetHeight + top - INNER_BORDER + "px";
                    top = HOVER_SUMMARY_MARGIN;
                }
                summaryContentEl.classList.remove("bottom")
                summaryContentEl.classList.add("top")
            } else {
                inner.style.clipPath = `polygon(0 5px, ${x-5}px 5px, ${x}px 0, ${x+5}px 5px, 100% 5px, 100% 100%, 0 100%)`;
                // max height
                if (top + summaryContentEl.offsetHeight > document.body.scrollHeight) {
                    maxHeight = document.body.clientHeight - top - INNER_BORDER + "px";
                }
                summaryContentEl.classList.remove("top")
                summaryContentEl.classList.add("bottom")
            };
            if (maxHeight) inner.style.maxHeight = maxHeight;
            summaryContentEl.style.top = top + "px";

            summaryContentEl.classList.remove("hide");
        }, 500);
    });
    anchor.addEventListener("mouseleave", function() {
        if (lastHoverEl == this) { clearTimeout(timeOutId) };
        lastHoverEl = this;
        timeOutId = setTimeout(()=>{
            summaryContentEl.classList.add("hide");
        }, 500);
    });
}
