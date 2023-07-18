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
var matchSurroundLength = 30;

// ==========================================
// Check searchVisible and toggle search
// force true: force on, false: force off
//
function toggleSearch(force) {
    // Toggle visibility of search box
    if (force == true || (force === undefined && !searchVisible)) {
        document.getElementById("fastSearch").style.display = "block"
        document.body.style.overflowY = "hidden"

        if (firstRun) {
            loadSearch();
            firstRun = false;
        } else {
            maininput.focus();
        }

        searchVisible = true; // search is visible now
    } else {
        // document.getElementById("fastSearch").style.display = "none"
        $("#fastSearch").fadeOut(200)
        document.body.style.overflowY = (typeof InstallTrigger !== 'undefined') ? 'auto' : 'overlay' // set 'auto' for firefox
        // document.activeElement.blur(); // remove focus from search box
        searchVisible = false; // search is not visible now
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
maininput.onkeyup = function() {
    executeSearch(this.value);
}


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
            minMatchCharLength: 2,
            threshold: 0.6, // 0 for a perfect match, 1 would match anything
            ignoreLocation: true,
            includeMatches: true,
            useExtendedSearch: true,
            keys: keys,
        }
        fuse = new Fuse(data, options); // build the index from the json file

        // change loading mask
        if (loading) {
            loading.innerHTML = 'Loading completed, type to search.';
            loading.classList.add('loaded');
        }

        maininput.disabled = false;

        maininput.tabIndex = "0";
        maininput.focus();
    })
}

// ===========================================
// get first length results, length <= 0 to get as much as possible
//
function uniqueResults(results, length) {
    let res = [{   // hold return value
        'item': results[0].item,
        'matches': results[0].matches
    }];
    if (length <= 0) {
        length = results.length
    }
    for (let idx = 1; idx < results.length; idx++) { // starts from the second
        let alreasyExists = false
        for (i of res) {
            if (results[idx].item.permalink == i.item.permalink) {
                alreasyExists = true
            }
        }
        if (!alreasyExists) {
            res.push({
                'item': results[idx].item,
                'matches': results[idx].matches
            })
            if (res.length >= length) {
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
var currentProcess;
function executeSearch(term) {
    new Promise((resolve, reject) => {
        if (!currentProcess) {
            currentProcess = 1234;
            resolve(fuse.search(term)); // the actual query being run using fuse.js
        } else {
            clearTimeout(currentProcess);
            currentProcess = setTimeout(() => {
                resolve(fuse.search(term)); // the actual query being run using fuse.js
            }, 500)
        }
    }).then(results => {
        let searchitems = ''; // our results bucket

        if (results.length === 0) { // no results based on what was typed into the input box
            resultsAvailable = false
            searchitems = ''
        } else { // build our html
            for (let result of uniqueResults(results, 20)) {
            // for (let result of results) {
                var matchHTML = '';
                for (match of result.matches) {
                    for (index of match.indices) {
                        var context = match.value.slice(index[0]-matchSurroundLength >= 0 ? index[0]-matchSurroundLength : 0, index[0])
                            + `<span class="search-item-match-highlight">${match.value.slice(index[0], index[1]+1)}</span>`
                            + match.value.slice(index[1]+1, index[1]+1+matchSurroundLength);
                        matchHTML = (matchHTML || "") +
                            `<span class="search-item-match-index">${index[0] + "-" + index[1]}: </span>
                            <span class="search-item-match-context">... ${context} ...</span>`;
                    }
                }
                let tags = ""
                if(result.item.tags && result.item.tags.length > 0) {
                    for(let tag of result.item.tags) {
                        tags += `<a class="search-item-tag" href="/tags/${tag}">${tag}</a>`;
                    }
                }
                searchitems = searchitems +
                    `<li class="search-result-item">
                        <div class="search-item-heading">
                            <a class="search-item-title" tabindex="0" href="${result.item.permalink}">${result.item.title}</a>
                            <span class="search-item-publish">${result.item.date}</span>
                            <span class="search-item-tags">${tags}</span>
                            <span class="search-item-edit">${result.item.edit}</span>
                        </div>
                        <div class="search-item-summary article-content summary">${result.item.summary}</div>
                        <div class="search-item-matches">${matchHTML}</div>
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
    });
}
