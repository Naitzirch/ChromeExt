// Naitzirch 2022
// 
// Handle setting/receiving backgrounds and
// storing them for specific websites


// Get the site data from storage
var site = location.href;
var hostname = location.hostname;
var siteList = {};
var imgURL;
var bgColor;
chrome.storage.sync.get(['sites'], function(result) {
    if (result.sites) {
        siteList = result.sites;
    }

    // Set background if site is found in siteList
    if (siteList && site in siteList) {
        var background = siteList[site].background;
        if (isHex(background))
            document.body.style.backgroundColor = background;
        else {
            document.body.style.backgroundImage = `url(${background})`;
        }
    }
});


// listeners

// Site Data request
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request === "siteData") {
            sendResponse({siteList: siteList, site: site, hostname: hostname});
        }
    }
);


// Background applied
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.background) {
            console.log(request);
            var pSelect = request.pSelect;
            console.log(pSelect);
            var background = request.background;
            console.log(background);

            // Apply background immediately
            if (isHex(background)) {
                document.body.style.backgroundColor = background;
                document.body.style.backgroundImage = "";
            }
            else {
                document.body.style.backgroundImage = `url(${background})`;
            }

            // Store background + settings for this site
            siteList[site] = {background: background};
            chrome.storage.sync.set({sites: siteList}, function() {
            });
            
            sendResponse({farewell: "goodbye"});
        }
    }
);


// Helper functions
function isHex(inputString) {
    inputString = inputString.substring(1);
    if (inputString.length > 6) {
        return false;
    }
    else {
        var re = /[0-9A-Fa-f]{6}/g;
        return re.test(inputString);
    }
}