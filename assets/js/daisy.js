function switchPannel(n){
    let navs = document.getElementsByClassName("sidebar-nav-item");
    let pannels = document.getElementsByClassName("sidebar-pannel");

    for(let i = 0; i < pannels.length; i++){
        if(i == n){
            if(navs.length){
                navs[i].classList.add("active");
            }
            pannels[i].classList.add("active");
        } else {
            if(navs.length){
                navs[i].classList.remove("active");
            }
            pannels[i].classList.remove("active");
        }
    }
}

// @force: 0 to close; 1 to open
function toggleSidebar(force){
    let siteRoot = document.getElementById("SiteRoot");
    if (force === 0) {
        siteRoot.classList.remove("sidebar-active");
    } else if (force === 1) {
        siteRoot.classList.add("sidebar-active");
    } else {
        siteRoot.classList.toggle("sidebar-active");
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

function back2Top(){
    $("html, body").animate({scrollTop: 0}, 500);
}

/****************** Once ****************/
// add click event for .sidebar-toggle
document.getElementById("SidebarToggle").onclick = toggleSidebar;

// back to top
document.getElementById("Back2top").onclick = back2Top;

const header = document.getElementById("SiteHeader");
header.onclick = function(){
    if(document.body.clientWidth <= 750) {
        document.getElementById("SiteInner").classList.toggle("fullscreen-header");
        if(this.ontouchmove){
            this.ontouchmove = null;
        } else {
            this.ontouchmove = function(e){
                e.preventDefault();
            }
        }
    }
}

// preload
document.onreadystatechange = function(){
    if(document.readyState == 'complete') {
        $("#loading").fadeOut("1000")
        document.body.style.overflowY = "overlay";
    }
};

// TOC active
const TOCOnscrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        if (entry.intersectionRatio > 0) {
            // console.log(`#TableOfContents li a[href="#${id}"]`)
            document.querySelector(`#TableOfContents li a[href="#${id}"]`).parentElement.classList.add('active');
        } else {
            // console.log(`#TableOfContents li a[href="#${id}"]`)
            document.querySelector(`#TableOfContents li a[href="#${id}"]`).parentElement.classList.remove('active');
        }
    });
});
window.addEventListener('DOMContentLoaded', () => {
    // Track all sections that have an `id` applied
    document.querySelectorAll('.heading').forEach((section) => {
        TOCOnscrollObserver.observe(section);
    });
});
