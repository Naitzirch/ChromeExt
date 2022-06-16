// Naitzirch 2022
// 
// Handle setting/receiving backgrounds and
// storing them for specific websites


// Get the site data from storage
var site = location.href;
var hostname = location.hostname;
var siteList = {};
var hostnameList = {};
var exemptList = [];
var regexA = [];
var imgURL;
var bgColor;
var isThisThingOn;

evalBG();

function evalBG() {
    chrome.storage.sync.get(['sites', 'hostnames', 'isThisThingOn', 'exempted'], function(result) {
        if (result.isThisThingOn === false) {
            return;
        }
        if (result.sites) {
            siteList = result.sites;
        }
        if (result.hostnames) {
            hostnameList = result.hostnames;
            if (hostnameList[hostname] && hostnameList[hostname].regexA) {
                regexA = hostnameList[hostname].regexA;
            }
        }
        if (result.exempted) {
            exemptList = result.exempted;
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
        // check if site is in exemptList
        else if (exemptList && exemptList.indexOf(site) !== -1) {
            document.body.style.backgroundImage = "";
            document.body.style.backgroundColor = "";
        }
        // Apply background to regex if hostname in hostnameList
        else if (regexA.length > 0) {
            for (var i = regexA.length - 1; i >= 0; i--) {
                var re = new RegExp(regexA[i].regex);
                if (re.test(site)) { // match site to regex
                    var background = regexA[i].background;
                    if (isHex(background))
                        document.body.style.backgroundColor = background;
                    else {
                        document.body.style.backgroundImage = `url(${background})`;
                    }
                    break;
                }
            }
        }
    });
}


// listeners

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        // Background applied
        if (request.background) {
            var pSelect = request.pSelect;
            var HNSRegEx = request.regex;
            var background = request.background;

            // Apply background immediately
            if (isHex(background)) {
                document.body.style.backgroundColor = background;
                document.body.style.backgroundImage = "";
            }
            else {
                document.body.style.backgroundImage = `url(${background})`;
            }
            // note to self: check if page corresponds to regex 
            // so you know if you need to apply it directly

            // Store background + settings for this site
            switch (pSelect) {
                case 1: // This page only
                    siteList[site] = {background: background};
                    chrome.storage.sync.set({sites: siteList});
                    break;
                case 2: // All pages from hostname
                    HNSRegEx = hostname.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, '\\$&');
                case 3: // Hostname specefic regex

                    const index = regexA.findIndex(el => el.regex === HNSRegEx);
                    if (index >= 0) {
                        regexA[index] = { regex: HNSRegEx, background: background };
                    }
                    else {
                        regexA.push({ regex: HNSRegEx, background: background });
                    }
                    
                    hostnameList[hostname] = {regexA: regexA};
                    chrome.storage.sync.set({hostnames: hostnameList});
                    break;
                default: // Preview (store nothing)
                    break;
            }
        }

        // // Background removed
        // else if (request === "removeBG") {
        //     document.body.style.backgroundImage = "";
        //     document.body.style.backgroundColor = "";
        // }

        // update after exempt / background removal
        else if (request === "reevalBG") {
            console.log("request sent succesfully");
            evalBG();
        }

        sendResponse({farewell: "goodbye"});

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