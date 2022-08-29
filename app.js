// Naitzirch 2022
// 
// Handle background evaluation


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

var initialBGcolor = window.getComputedStyle(document.body, null).getPropertyValue('background-color');
var initialBGimg = window.getComputedStyle(document.body, null).getPropertyValue('background-image');

evalBG();

function evalBG() {
    chrome.storage.sync.get(['sites', 'hostnames', 'isThisThingOn', 'exempted'], function(result) {
        isThisThingOn = (result.isThisThingOn || false);
        if (isThisThingOn === false) {
            document.body.style.backgroundImage = initialBGimg;
            document.body.style.backgroundColor = initialBGcolor;
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
            else {
                regexA = [];
            }
            if (hostnameList[hostname] && hostnameList[hostname].exemptA) {
                exemptA = hostnameList[hostname].exemptA;
            }
            else {
                exemptA = [];
            }
        }
        // Set background if site is found in siteList
        if (siteList && site in siteList) {
            console.log("1");
            var background = siteList[site].background;
            if (isHex(background))
                document.body.style.backgroundColor = background;
            else {
                document.body.style.backgroundImage = `url(${background})`;
            }
        }
        // check if site is in exemptA
        else if (exemptA.indexOf(site) !== -1) {
            console.log("2");
            document.body.style.backgroundImage = "";
            document.body.style.backgroundColor = "";
        }
        // Apply background to regex if hostname in hostnameList
        else if (regexA.length > 0) {
            console.log("3");
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
            console.log("img: " + initialBGimg);
            console.log("col: " + initialBGcolor);
            console.log("4");
            if (initialBGimg) {
                document.body.style.backgroundImage = initialBGimg;
            }
            else {
                document.body.style.backgroundColor = initialBGcolor;
            }
        }
    });
}


// listeners

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        // reeval when on/off button is toggled or bg is deleted
        if (request === "reevalBG") {
            evalBG();
        }

        // preview
        if (request.background) {
            var background = request.background;
            if (isHex(background)) {
                document.body.style.backgroundColor = background;
                document.body.style.backgroundImage = "";
            }
            else {
                document.body.style.backgroundImage = `url(${background})`;
            }
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