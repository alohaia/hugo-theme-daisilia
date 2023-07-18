// set and get cookie
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++)
  {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}

function loadScript(src, type = "text/javascript",async = true) {
    var scriptEle = document.createElement('script');
    scriptEle.src = src;
    scriptEle.type = type;
    scriptEle.async = async;
    scriptEle.defer = true;

    return new Promise((resolve, reject) => {
        scriptEle.onload = e => resolve(e);
        scriptEle.onerror = e => reject(e);
        document.head.appendChild(scriptEle);
    });

}

function MathJaxConfig() {
    window.MathJax = {
        loader: {
            load: ['[tex]/mhchem'], // https://mhchem.github.io/MathJax-mhchem/
            source: {
                '[tex]/amsCd': '[tex]/amscd',
                '[tex]/AMScd': '[tex]/amscd'
            }
        },
        tex: {
            inlineMath: {'[+]': [['$', '$']]},
            displayMath: [
                ["$$", "$$"],
                ["\[\[", "\]\]"],
            ],
            packages: {'[+]': ['mhchem']},
            tags: 'ams'
        },
        options: {
            renderActions: {
                findScript: [10, doc => {
                    document.querySelectorAll('script[type^="math/tex"]').forEach(node => {
                        const display = !!node.type.match(/; *mode=display/);
                        const math = new doc.options.MathItem(node.textContent, doc.inputJax[0], display);
                        const text = document.createTextNode('');
                        node.parentNode.replaceChild(text, node);
                        math.start = {node: text, delim: '', n: 0};
                        math.end = {node: text, delim: '', n: 0};
                        doc.math.push(math);
                    });
                }, '', false],
                insertedScript: [200, () => {
                    document.querySelectorAll('mjx-container').forEach(node => {
                        let target = node.parentNode;
                        if (target.nodeName.toLowerCase() === 'li') {
                            target.parentNode.classList.add('has-jax');
                        }
                    });
                }, '', false]
            }
        }
    };
}

function loadOrRefershThirdPartyScripts() {
    // mermaid
    if (document.getElementsByClassName("mermaid")[0]) {
        if (window.mermaid) {
            mermaid.run();
        } else {
            loadScript('https://cdn.jsdelivr.net/npm/mermaid@10.2.3/dist/mermaid.min.js')
                .then(() => {
                    mermaid.initialize({
                        startOnLoad: false, // pjax:complete won't toggle startOnLoad
                        theme: 'neutral',
                        flowchart: {
                            useMaxWidth: true
                        }
                    });
                    mermaid.run();
                })
                .catch(e => {
                    console.error("failed to load mermaid.min.js:", e)
                });
        }
    }

    // MathJax
    if (document.getElementById("SiteContent").hasAttribute("mathjax")) {
        if (window.MathJax) {
            if (MathJax.typeset) {
                MathJax.texReset();
                MathJax.typeset();
            }
        } else {
            MathJaxConfig();
            loadScript('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js')
            .catch(e => {
                console.error("failed to load tex-mml-chtml.js:", e);
            });
        }
    }
}

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
        setCookie("sidebarActive", "false");
    } else if (force === 1) {
        siteRoot.classList.add("sidebar-active");
        setCookie("sidebarActive", "true");
    } else {
        if (siteRoot.classList.contains("sidebar-active")) {
            siteRoot.classList.remove("sidebar-active");
            setCookie("sidebarActive", "false");
        } else {
            siteRoot.classList.add("sidebar-active");
            setCookie("sidebarActive", "true");
        }
    }
}

// generate numbers for lists
function searchIndex(anchor) {
    let heading = document.querySelector(".heading".concat(anchor));
    if (heading && heading.hasAttribute("index")) {
        return Number(heading.getAttribute("index"))
    }
    return 0;
}
function genUlNum(ulNode, nums = [0], addTrigger = false){
    for(let i = 0; i < ulNode.childElementCount; i++){
        nums[nums.length-1] += 1;
        if (ulNode.children[i].childElementCount > 1) {
            genUlNum(ulNode.children[i].children[1], nums.concat(0), addTrigger);
        }
        if (ulNode.parentNode.id == "TableOfContents") {
            let index = searchIndex(ulNode.children[i].children[0].getAttribute("href"));
            if (index) {
                nums[nums.length-1] = index;
            }
        }
        ulNode.children[i].children[0].innerHTML =
            nums.join(".") + ". " + ulNode.children[i].children[0].innerText;
        if (addTrigger && ulNode.children[i].children[1]) {
            let triggerEl = document.createElement("i");
            triggerEl.classList.add("collapse-trigger");
            ulNode.children[i].insertBefore(triggerEl, ulNode.children[i].children[0]);
        }
        if (i == ulNode.childElementCount){
            return;
        }
    }
}

function back2Top(){
    $("html").animate({scrollTop: document.getElementById("SiteHeader").scrollHeight}, 200);
}

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
        $('#preload-mask').fadeOut('1000')
        document.body.style.overflowY = (typeof InstallTrigger !== 'undefined') ? 'auto' : 'overlay'; // set 'auto' for firefox

        if (getCookie("sidebarActive") == "true") {
            toggleSidebar(1);
        }
    }

    const hashEl = document.getElementById(decodeURI(document.location.hash.slice(1)));
    if (hashEl) hashEl.scrollIntoView({behavior: "instant"});
};

// on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // Track all sections that have an `id` applied
    document.querySelectorAll('.heading').forEach((section) => {
        TOCOnscrollObserver.observe(section);
    });

    loadOrRefershThirdPartyScripts();
});

// TOC active
const TOCOnscrollObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const el = document.querySelector(`#TableOfContents li a[href="#${id}"]`)
        if (entry.intersectionRatio > 0) {
            el.parentElement.classList.add('active')
            // TODO _ensureInView(el)
        } else {
            el.parentElement.classList.remove('active')
        }
    });
});

// https://css-tricks.com/how-to-animate-the-details-element-using-waapi/
class Accordion {
  constructor(el) {
    this.el = el;
    this.summary = el.querySelector('summary');
    this.content = el.querySelector('.tab-content');

    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.summary.addEventListener('click', (e) => this.onClick(e));
  }

  onClick(e) {
    e.preventDefault();
    this.el.style.overflow = 'hidden';
    if (this.isClosing || !this.el.open) {
      this.open();
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  }

  shrink() {
    this.isClosing = true;

    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }

    this.animation = this.el.animate({
      height: [startHeight, endHeight]
    }, {
      duration: 200,
      easing: 'ease-out'
    });

    this.animation.onfinish = () => this.onAnimationFinish(false);
    this.animation.oncancel = () => this.isClosing = false;
  }

  open() {
    this.el.style.height = `${this.el.offsetHeight}px`;
    this.el.open = true;
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    this.isExpanding = true;
    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }

    this.animation = this.el.animate({
      height: [startHeight, endHeight]
    }, {
      duration: 200,
      easing: 'ease-out'
    });
    this.animation.onfinish = () => this.onAnimationFinish(true);
    this.animation.oncancel = () => this.isExpanding = false;
  }

  onAnimationFinish(open) {
    this.el.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.el.style.height = this.el.style.overflow = '';
  }
}

// HoverSummary
const summaryContentEl = document.createElement("div");
summaryContentEl.classList.add("hide");
summaryContentEl.id = "HoverSummary";
document.body.appendChild(summaryContentEl);

const HOVER_SUMMARY_MARGIN = 5;
const INNER_BORDER = 30 + HOVER_SUMMARY_MARGIN;  // 15px * 2
const USE_TEXT_ANCHOR = true;

var summaries = {};
fetch("/index.json").then((e)=>{e.json().then((jsonData)=>{
    for (page of jsonData) {
        summaries[page.permalink.toLowerCase()] = {
            "title": page.title,
            "summary": page.summary,
            "tags": page.tags
        };
    }
})});

function offsetToBody(e, side) {
    return e.getBoundingClientRect()[side] - document.body.getBoundingClientRect()[side];
}

// messages
(function(){
    fetch("/data/messages.json").then((e)=>{e.json().then((jsonData)=>{
        var messages = {};
        for (i in jsonData) {
            messages[i.replace(/\s+/g, "-")] = jsonData[i];
        }
        var messageListEl = document.getElementById("MessageList");
        var confirmedMessages = getCookie("confirmedMessages").split(",");

        // display messages
        var messageHTML = "";
        for (id in messages) {
            if (!confirmedMessages.includes(id)) {
                messageHTML +=
`<div id="message-${id}" class="site-message-item ${messages[id].type ? messages[id].type : 'default' }">
    <div class="site-message-close" role="button">X</div>
    ${messages[id].title ? '<h1 class="site-message-title">' + messages[id].title + '</h1>' : ''}
    <p class="site-message-content">${messages[id].content}</p>
</div>`;
            }
        }
        messageListEl.innerHTML = messageHTML;

        document.querySelectorAll(".site-message-close").forEach(function(currentValue) {
            currentValue.onclick = function() {
                var closedMessage = this.parentElement.id.replace(/^message-/, getCookie("confirmedMessages") != "" ? "," : "");
                setCookie("confirmedMessages", getCookie("confirmedMessages") + closedMessage, 14);
                this.parentElement.style.display = "none"
            }
        })
    })});
})()


function updateSeriesList() {
    document.querySelectorAll(".series-title.now, .series-item.now").forEach(function (el) {
        el.classList.remove("now");
    });
    if (window.location.pathname.split("/")[1] == "series" && window.location.pathname.split("/")[2]) {
        document.querySelectorAll(".series-title, .series-item").forEach(function (el) {
            if(decodeURI(el.getAttribute("href")) == decodeURI(window.location.pathname)) {
                el.classList.add("now");
            }
        })

    }
}

function initSeriesList() {
    // numbering
    let series = document.querySelector(".series-list");
    if(series && !series.classList.contains("numbered")){
        series.classList.add("numbered");
        genUlNum(series, [0], true);
    }
    // collapsable series-list
    document.querySelectorAll(".collapse-trigger").forEach(function (el) {
        el.addEventListener('click', function() {
            this.parentElement.classList.toggle("collapsed");
        });
    })

    updateSeriesList();
}

$(".series-content").ready(function(){
    initSeriesList();
})
