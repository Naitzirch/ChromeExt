// Naitzirch 2022
// 
// Handle setting/receiving backgrounds and
// storing them for specific websites


// Get the site data from storage
var site = location.href;
var hostname = location.hostname;
var siteList = {};
var hostnameList = {};
var exemptA = [];
var regexA = [];
var imgURL;
var bgColor;
var isThisThingOn;

evalBG();

function evalBG() {
    chrome.storage.sync.get(['sites', 'hostnames', 'isThisThingOn', 'exempted'], function(result) {
        isThisThingOn = (result.isThisThingOn || false);
        console.log(isThisThingOn);
        if (isThisThingOn === false) {
            console.log("owo");
            document.body.style.backgroundImage = "";
            document.body.style.backgroundColor = "";
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
            if (hostnameList[hostname] && hostnameList[hostname].exemptA) {
                exemptA = hostnameList[hostname].exemptA;
            }
        }
        console.log(siteList);
        // Set background if site is found in siteList
        if (siteList && site in siteList) {
            var background = siteList[site].background;
            if (isHex(background))
                document.body.style.backgroundColor = background;
            else {
                document.body.style.backgroundImage = `url(${background})`;
            }
        }
        // check if site is in exemptA
        else if (exemptA.indexOf(site) !== -1) {
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
        else { // if site is not in siteList or hostnameList
            document.body.style.backgroundImage = "";
            document.body.style.backgroundColor = "";
        }
    });
}


// listeners

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // Background applied
        if (request.background && isThisThingOn) {
            var pSelect = request.pSelect;
            var HNSRegEx = request.regex; // Host Name Specific
            var background = request.background;

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
                    
                    hostnameList[hostname] = hostnameList[hostname] || {};
                    hostnameList[hostname].regexA = regexA;
                    chrome.storage.sync.set({hostnames: hostnameList});
                    break;
                default: // Preview (store nothing)
                    break;
            }
            // Apply background immediately
            evalBG();
        }

        // reeval when on/off button is toggled or bg is deleted
        if (request === "reevalBG") {
            evalBG();
        }

        sendResponse({farewell: "goodbye"});

    }
);

// reevaluate background when tab gets focussed
document.addEventListener('visibilitychange', evalBG);

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