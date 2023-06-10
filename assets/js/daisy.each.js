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

    // let anchors = document.querySelectorAll('a[href^="#"]');
    // for(let anchor of anchors){
    //     anchor.onclick = function(e) {
    //         console.log(anchor.getAttribute("href"));
    //         location.hash = anchor.getAttribute("href");
    //         e.preventDefault();
    //     }
    // }
})

$(".series-list").ready(function(){
    let series = document.querySelector(".series-list");
    if(series && !series.classList.contains("numbered")){
        series.classList.add("numbered");
        genUlNum(series);
    }
})

$(".series-content").ready(function(){
    if(window.location.pathname == "/series/") { return }
    let items = document.querySelectorAll(".series-title, .series-item")
    for(let item of items){
        if(item.getAttribute("href") == window.location.pathname) {
            item.classList.add("now")
            break
        }
    }
})

// https://css-tricks.com/how-to-animate-the-details-element-using-waapi/
document.querySelectorAll('details').forEach((el) => {
  new Accordion(el);
});
