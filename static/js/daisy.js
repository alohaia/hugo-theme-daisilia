// @force: 0 to close; 1 to open
function toggleSidebar(force){
    let siteRoot = $(".site-root");
    let actived = / sidebar-active/.test(siteRoot.attr("class"));
    if(force === 0 || actived){
        siteRoot.attr("class", siteRoot.attr("class").replace(/ sidebar-active/g, ""));
    }
    if(force === 1 || !actived) {
        siteRoot.attr("class", siteRoot.attr("class") + " sidebar-active");
    }
}

// generate numbers for lists
function genUlNum(ulNode, nums = [0]){
    for(let i = 0; i < ulNode.childElementCount; i++){
        nums[nums.length-1] += 1;
        if(ulNode.children[i].childElementCount > 1) {
            genUlNum(ulNode.children[i].children[1], nums.concat(0));
        }
        ulNode.children[i].children[0].innerText = nums.join(".") + ". " + ulNode.children[i].children[0].innerText;
        if(i == ulNode.childElementCount){
            return;
        }
    }
}

// add callback
$("sidebar-content").ready(function(){
    $(".sidebar-toggle").click(toggleSidebar)

    if(document.getElementById("TableOfContents")){
        genUlNum(document.getElementById("TableOfContents").children[0]);
    }
    if(document.getElementsByClassName("doc-structure")[0]){
        genUlNum(document.getElementsByClassName("doc-structure")[0]);
    }

    // sidebar nav
    let navs, pannels;
    navs = document.getElementsByClassName("sidebar-nav-item")
    pannels = document.getElementsByClassName("sidebar-pannel")

    pannels[0].className += " active";

    for(let i = 0; i < navs.length; i++) {
        navs[i].addEventListener("click", function(){
            for(let j = 0; j < navs.length; j++){
                if(j != i){
                    pannels[j].className = pannels[j].className.replace(/ active/g, "");
                } else {
                    if(! / active/.test(pannels[j].className)){
                        pannels[j].className += " active";
                    }
                }
            }
        })
    }

    // auto-open sidebar
    if($(".sidebar-nav-docs").length || $(".sidebar-nav-docs").length){
        toggleSidebar(1);
    }
})

