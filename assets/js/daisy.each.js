$("sidebar-content").ready(function(){
    // add numbers
    let toc = document.getElementById("TableOfContents");
    if(toc && !toc.classList.contains("numbered")){
        toc.classList.add("numbered");
        genUlNum(toc.children[0]);
    }
    // add click events for nav items
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
})

$(".series-list").ready(function(){
    let series = document.querySelector(".series-list");
    if(series && !series.classList.contains("numbered")){
        series.classList.add("numbered");
        genUlNum(series);
    }
})

// $("table:not(.table-container table):not(.highlight table)").wrap(`<div class="table-container"></div>`);

if (document.getElementById("TOCTitle")) {
    document.getElementById("TOCTitle").onclick = back2Top;
}
// if (document.querySelector(".article-title:not(.page-title)")) {
//     document.querySelector(".article-title:not(.page-title)").onclick = back2Top;
// }

var prevScrollpos = window.pageYOffset;
function updateProgress() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    // var winScroll = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height == 0 || winScroll == 0) {
        document.getElementById("Back2top").style.display = "none";
    } else {
        document.getElementById("Back2top").style.display = null;
        document.getElementById("Back2topProgress").innerHTML = Math.floor((winScroll / height) * 100) + "%";
    }
}
updateProgress();
window.onscroll = function() {
    var currentScrollPos = window.pageYOffset;

    // // hide site header on scroll
    // if (prevScrollpos >= currentScrollPos) {
    //     document.body.classList.remove("header-hidden");
    // } else {
    //     document.body.classList.add("header-hidden");
    // }

    // scroll progress
    updateProgress();

    prevScrollpos = currentScrollPos;
}

$(".tag-cloud.side").ready(function(){
    let tags = document.querySelectorAll(".tag-cloud-item")
    for(let tag of tags){
        if(tag.getAttribute("href") == window.location.pathname) {
            tag.classList.add("now")
            break
        }
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
