$("sidebar-content").ready(function(){
    // add numbers
    let toc = document.getElementById("TableOfContents");
    if(toc && !toc.classList.contains("numbered")){
        toc.classList.add("numbered");
        genUlNum(toc.children[0]);
    }
    // add click events for nav items
    for(let i = 0; i < navs.length; i++) {
        navs[i].onclick = function(){
            for(let j = 0; j < navs.length; j++){
                if(j != i){
                    pannels[j].classList.remove("active");
                    navs[j].classList.remove("active");
                } else {
                    pannels[j].classList.add("active");
                    navs[j].classList.add("active");
                }
            }
        }
    }
    // switch to first non-empty pannel
    for(let i = 0; i < pannels.length; i++){
        if(pannels[i].childElementCount > 0){
            pannels[i].className += " active";
            break;
        }
    }
    // auto-open sidebar
    // if($(".sidebar-nav-docs").length || $(".sidebar-nav-docs").length){
    //     toggleSidebar(1);
    // }
})

$(".doc-structure").ready(function(){
    let doc = document.getElementById("DocStructure");
    if(doc && !doc.classList.contains("numbered")){
        doc.classList.add("numbered");
        genUlNum(document.getElementById("DocStructure"));
    }
})

$("table:not(.highlight table)").wrap(`<div class="table-container"></div>`);

if (document.getElementById("TOCTitle")) {
    document.getElementById("TOCTitle").onclick = back2Top;
}
if (document.querySelector(".article-title:not(.page-title)")) {
    document.querySelector(".article-title:not(.page-title)").onclick = back2Top;
}

var prevScrollpos = window.pageYOffset;
function updateProgress() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    // var winScroll = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height == 0 || winScroll == 0) {
        document.getElementById("Back2top").style.opacity = 0;
    } else {
        document.getElementById("Back2top").style.opacity = 1;
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

// remove href of a[href^='#']
var anchors;
anchors = document.querySelectorAll("a[href^='#']");
for (let i = 0; i < anchors.length; i++) {
    let a = anchors[i];
    a.setAttribute("scroll", decodeURI(a.getAttribute("href").slice(1)));
    a.removeAttribute("href");
}
// change onclick of a[scroll]
anchors = document.querySelectorAll("a[scroll]");
for (let i = 0; i < anchors.length; i++) {
    anchors[i].onclick = function(){
        let anc = this.getAttribute("scroll");
        document.getElementById(anc).scrollIntoView({
            behavior: "smooth",
            block: "center"
        })
    }
}
