// Naitzirch 2022
// 
// Handle setting/receiving backgrounds and
// storing them for specific websites


// Get the site data from storage
var site = location.href;
var siteList = {};
var imgURL;
chrome.storage.sync.get(['sites'], function(result) {
    siteList = result.sites;

    // Set background if site is found in siteList
    if (site in siteList) {
        imgURL = siteList[site].background;
        document.body.style.backgroundImage = `url(${imgURL})`;
    }
});


// listener
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        
        imgURL = request.imageURL;

        // Apply background immediately
        document.body.style.backgroundImage = `url(${imgURL})`;

        // Store background + settings for this site
        siteList[site] = {background: imgURL};
        chrome.storage.sync.set({sites: siteList}, function() {
            console.log("siteList set");
        });
        
        chrome.storage.sync.get(['sites'], function(result) {
            siteList = result.sites;
            console.log(siteList);
        });
        
        sendResponse({farewell: "goodbye"});
    }
);

