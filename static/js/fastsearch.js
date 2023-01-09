var fuse; // holds our search engine
var searchVisible = false;
var firstRun = true; // allow us to delay loading json data unless search activated
var list = document.getElementById('searchResults');
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById('searchInput');
var resultsAvailable = false; // Did we get any search results?
const keys = [ 'title', 'contents' ];
var loading = document.getElementById('searchLoading');

// ==========================================
// Check searchVisible and toggle search
// force true: force on, false: force off
//
function toggleSearch(force) {
    // Load json search index if first time invoking search
    // Means we don't load json unless searches are going to happen; keep user payload small unless needed
    if(firstRun) {
        loadSearch(); // loads our json data and builds fuse.js search index
        if (loading) {
            loading.innerHTML = 'Loading completed, press ENTER after texting to search.';
            loading.classList.add('loaded');
        }
        firstRun = false; // let's never do this again
    }

    // Toggle visibility of search box
    if (force == true || (force === undefined && !searchVisible)) {
        document.getElementById("fastSearch").style.display = "block"
        document.body.style.overflowY = "hidden"
        maininput.focus(); // put focus in input box so you can just start typing
        searchVisible = true; // search visible
    } else {
        // document.getElementById("fastSearch").style.display = "none"
        $("#fastSearch").fadeOut(200)
        document.body.style.overflowY = (typeof InstallTrigger !== 'undefined') ? 'auto' : 'overlay' // set 'auto' for firefox
        document.activeElement.blur(); // remove focus from search box
        searchVisible = false; // search not visible
    }
}

document.getElementById("searchBtn").onclick = ()=>{ toggleSearch(true) }
document.getElementById("searchHint").onclick = ()=>{ toggleSearch(false) }

document.addEventListener("click", event => {
    if(event.target === document.getElementById("fastSearch")) {
        toggleSearch(false)
    }
});

// ==========================================
// The main keyboard event listener running the show
//
document.addEventListener('keydown', function(event) {
    // Crtl-/ to show / hide Search
    if (event.ctrlKey && event.key == "/") {
        event.preventDefault();
        toggleSearch();
    }

    // Allow ESC (27) to close search box
    if (event.key == "Escape") {
        toggleSearch(false)
    }
})


// ==========================================
// execute search as text is changed
//
maininput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    executeSearch(this.value)
  }
});


// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest()
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText)
                    if (callback) callback(data)
            }
        }
    }
    httpRequest.open('GET', path)
    httpRequest.send()
}


// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch() {
    fetchJSONFile('/index.json', function(data){

        var options = { // fuse.js options; check fuse.js website for details
            shouldSort: true,
            // minMatchCharLength: 2,
            threshold: 0.6, // 0 for a perfect match, 1 would match anything
            ignoreLocation: true,
            includeMatches: false,
            useExtendedSearch: true,
            keys: keys,
        }
        fuse = new Fuse(data, options); // build the index from the json file
    })
}

function isResultEqual(r1, r2) {
    for(let idx = 0; idx < keys.length; idx++) {
        if(r1[keys[idx]] != r2[keys[idx]]) {
            return false
        }
    }
    return true
}


// ===========================================
// get first length results, length <= 0 to get as much as possible
//
function uniqueResults(results, length) {
    let res = [results[0].item];        // hold return value
    if(length <= 0) {
        length = results.length
    }
    for(let idx = 1; idx < results.length; idx++) { // starts from the second
        let alreasyExists = false
        for(i of res) {
            if(isResultEqual(results[idx].item, i)) {
                alreasyExists = true
            }
        }
        if(!alreasyExists) {
            res.push(results[idx].item)
            if(res.length >= length) {
                break
            }
        }
    }
    return res
}

document.addEventListener("pjax:complete", function () {
    toggleSearch(false);
})

// ==========================================
// using the index we loaded on CMD-/, run
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {
    let results = fuse.search(term); // the actual query being run using fuse.js
    let searchitems = ''; // our results bucket

    if (results.length === 0) { // no results based on what was typed into the input box
        resultsAvailable = false
        searchitems = ''
    } else { // build our html
        let items = uniqueResults(results, 20)
        for (let item of items) {
            let tags = ""
            if(item.tags && item.tags.length > 0) {
                for(let tag of item.tags) {
                    tags += `<a class="tag" href="/tags/${tag}">${tag}</a>`;
                }
            }
            searchitems = searchitems +
`<li class="search-result-item">
    <div class="header">
        <a class="title" tabindex="0" href="${item.permalink}">${item.title}</a>
        <span class="publish">${item.date}</span>
        <span class="tags">${tags}</span>
        <span class="edit">${item.edit}</span>
    </div>
    <div class="summary article-content">${item.summary}</div>
</li>`
        }
        resultsAvailable = true
    }

    list.innerHTML = searchitems
    if (results.length > 0) {
        first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
        last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location
    }

    // refresh pjax
    window.pjax.refresh(list);
}
