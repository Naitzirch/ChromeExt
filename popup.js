// Naitzirch 2022
// 
// Frontend for Custom Background Extension

// Query DOM
var apply = document.getElementsByClassName("apply");
    imgURL = document.getElementById('imgURL');
    hexCode = document.getElementById('hex-code');
    cd = document.getElementById('color-display');
    colorWell = document.querySelector("#colorWell");

var thisPageOnly = document.getElementById('one-p');
    allPagesFrom = document.getElementById('all-p');
    domainSregex = document.getElementById('regex-p');

var regexField = document.getElementById('regex-field');

var onOffButton = document.getElementById('on-off-button');
    
// Request information from chrome storage
var site;
var hostname;
var siteList = {};
var hostnameList = {};
var exemptA = [];
var regexA = [];
var defaultColor;
var isThisThingOn = false;
window.addEventListener('load', (event) => {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        tab = tabs[0];
        site = tab.url;
        hostname = (new URL(site)).hostname;

        // Request data chrome storage
        chrome.storage.sync.get(['sites', 'hostnames', 'isThisThingOn', 'exempted'], function(result) {
            // result
            if (result) {
                if (result.sites) {
                    siteList = result.sites;
                    console.log(result);
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
                if (result.isThisThingOn) {
                    isThisThingOn = result.isThisThingOn;
                }
                if (result.exempted) {
                    exemptList = result.exempted;
                }

                // Everything that needs initialization with storage data

                // set Off/On button
                onOffButton.checked = isThisThingOn;

                // set domain in page-select form
                allPagesFrom.labels[0].firstElementChild.innerHTML = hostname;
                regexField.innerHTML = hostname.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, '\\$&');

                // set color inside the color tab
                if (site in siteList) {
                    var background = siteList[site].background;
                    if (isHex(background)) {
                        hexCode.innerHTML = background;
                        defaultColor = hexCode.innerHTML;
                        cd.style.backgroundColor = defaultColor;
                        colorWell.value = defaultColor;
                    }
                }

                // Populate Page List
                populatePageList(site, siteList);
                populateRegExList(hostname, hostnameList);
                populateExemptList(hostname, hostnameList);
                initCollapsibles();
            }

        });
    });
});

// Fancy button smh...
var j;
for (j = 0; j < apply.length; j++) {
    apply[j].addEventListener('mousedown', function(){
        this.style.backgroundColor = "#efefef";
    });

    apply[j].addEventListener('mouseup', function(){
        this.style.backgroundColor = "#bdbdbd";
    });

    apply[j].addEventListener('mouseleave', function(){
        this.style.backgroundColor = "#efefef";
    });

    apply[j].addEventListener('mouseenter', function(){
        this.style.backgroundColor = "#bdbdbd";
    });
}

// Exempt
var applyExempt = document.getElementById('apply-exempt');

applyExempt.addEventListener('click', function(){
    exemptPage();
});

function exemptPage() {
    if (exemptA.indexOf(site) === -1) {
        exemptA.push(site);
        hostnameList[hostname] = hostnameList[hostname] || {};
        hostnameList[hostname].exemptA = exemptA;
        chrome.storage.sync.set({hostnames: hostnameList});
        // message content script to reevaluate background
        reevalBG();
    }
    else {
        alert("This page is already exempted from all RegEx. Maybe you want to remove the background under Single Pages?");
    }
    //console.log(exemptList);
    //chrome.storage.sync.get(['exempted'], function(result){ console.log(result) });
}

// Toggle switch checkbox
onOffButton.addEventListener('change', function(){
    console.log("hi");
    isThisThingOn = this.checked;
    chrome.storage.sync.set({isThisThingOn: isThisThingOn});
    reevalBG();
});


// Input field logic
imgURL.addEventListener('click', function(){
    if (imgURL.innerHTML === "img URL") {
        imgURL.innerHTML = "";
    }
});


// Tabs
var tabList = document.getElementsByClassName('tablinks');
var k;
for (k = 0; k < tabList.length; k++) {
    tabList[k].addEventListener('click', function() {
        return openTab(this, "tabcontent", "tablinks");
    });
}

function openTab(curTab, tabcontentClass, tablinksClass) {
    var i, tabcontent, tablinks, tabName, curTabContent;
    tabName = curTab.name;
    tabcontent = document.getElementsByClassName(tabcontentClass);
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName(tablinksClass);
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    curTab.className += " active";
    curTabContent = document.getElementById(tabName);
    curTabContent.style.display = "block";
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();

tabList = document.getElementsByClassName('tablinks2');
for (k = 0; k < tabList.length; k++) {
    tabList[k].addEventListener('click', function() {
        return openTab(this, "tabcontent2", "tablinks2");
    });
}

document.getElementById("defaultOpen2").click();

function initCollapsibles() {
    // Collapsibles
    var nodes = document.getElementsByClassName("collapsible");
    var nodes2 = document.getElementsByClassName("collapsible-2");
    var i;
    var coll = []
        .concat(Array.from(nodes))
        .concat(Array.from(nodes2));

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            this.firstElementChild.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content && content.style.maxHeight){
                content.style.maxHeight = null;
            } else if (content) {
                content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
    }
}

// Preset tab logic
{
    var presetContainer = document.getElementById('preset-container');
    
    fetch("presets/presets.json")
    .then(response => {
        return response.json();
    })
    .then(presetsData => {
        Object.keys(presetsData).forEach(function(k){
            var presetIcon = "empty";
            var name = "empty";
            var bgid = "empty.png";
            if (k) {
                presetIcon = k;
                name = presetsData[k].name;
                bgid = presetsData[k].bg;
                var card = 
                `
                <div class="preset-card">
                        <img id="${bgid}" class="preset-icons" src="presets/icons/${presetIcon}.png" alt="${name}">
                        <span>${name}</span>
                </div>
                `;
                presetContainer.innerHTML += card;
            }
        });

        var presetIcons = document.getElementsByClassName('preset-icons');
        for (i = 0; i < presetIcons.length; i++) {
            presetIcons[i].addEventListener("click", function() {
                ApplyBG(chrome.runtime.getURL(`presets/images/${this.id}`));
            });
        }

    });

}

// Color tab logic
var hexField = document.getElementById('hex-field');

hexField.addEventListener("keydown", keydown);

function keydown (e){
    if(e.keyCode===13){
        hexField.blur();
    }
    console.info(e.keyCode);
}

hexField.addEventListener('blur', () => {
    defaultColor = hexCode.innerHTML;
    colorWell.value = defaultColor;
    cd.style.backgroundColor = defaultColor;
});

window.addEventListener("load", startup, false);

function startup() {
    colorWell.addEventListener("input", updateFirst, false);
    colorWell.addEventListener("change", updateAll, false);
    colorWell.select();
}

function updateFirst(event) {

    if (cd) {
        cd.style.backgroundColor = event.target.value;
        hexCode.innerHTML = event.target.value;
    }
}

function updateAll(event) {
    document.querySelectorAll("#color-display").forEach(function(cd) {
        //cd.style.backgroundColor = event.target.value;
    });
}

// Check if the user clicked on Apply color.
var applyColor = document.getElementById('apply-color');

applyColor.addEventListener('click', function(){
    ApplyBG(hexCode.innerHTML);
});


// Check if user clicked on Apply background.
var applyIMG = document.getElementById('apply-img');

applyIMG.addEventListener('click', function(){
    ApplyBG(imgURL.innerHTML);
});

function ApplyBG(bg) {
    if (false) {
        return;
    }
    // Check which tab is the running tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

        // Check the page selector form
        var pageSelector;
        var regex;
        if (thisPageOnly.checked)
            pageSelector = 1;
        else if (allPagesFrom.checked)
            pageSelector = 2;
        else if (domainSregex.checked) {
            pageSelector = 3;
            regex = regexField.innerHTML;
        }

        // Emit message with background to the app running on the active website
        chrome.tabs.sendMessage(tabs[0].id,
            {
                pSelect: pageSelector,
                regex: regex,
                background: bg
            },
            function(response) {
            // Log app's response
            console.log(response.farewell);
        });
        
    });
}

function removeBG(button) {
    var page = button.previousElementSibling.value;
    if (page in siteList) {
        //update visually
        var ListEntryContainer = button.parentNode.parentNode;
        var ListContainer = ListEntryContainer.parentNode;
        var pageList = document.getElementById('page-list');

        var nobg = 
            `<div class="list-entry-container" id="current-page-container">
                <div class="bg-not-found">There is currently no background selected for this page specifically.</div>
            </div>`;

        // In case deleted from Current Page
        if (ListContainer.id === "current-page") {
            
            // update Current Page
            ListContainer.removeChild(ListEntryContainer);
            ListContainer.innerHTML += nobg;

            // update Page List
            var pListCurrent = document.getElementById('current');
            pageList.removeChild(pListCurrent);

            reevalBG();
        }
        // In case deleted from Page List
        else if (ListContainer.id === "page-list") {
            if (ListEntryContainer.id && ListEntryContainer.id === "current") {
                var currentPage = document.getElementById('current-page');
                currentPage.removeChild(currentPage.firstElementChild.nextElementSibling);
                currentPage.innerHTML += nobg;
                reevalBG();
            }
            ListContainer.removeChild(ListEntryContainer);
        }

        // Check if Page List is empty
        if (pageList.childElementCount === 1) {
            nobg = 
            `<div class="list-entry-container" id="empty-list-container">
                <div class="bg-not-found"><i>It's quiet here... too quiet.</i></div>
            </div>`;
            pageList.innerHTML += nobg;
        }




        // remove from storage
        delete siteList[page];
        chrome.storage.sync.remove("sites");
        chrome.storage.sync.set({sites: siteList});
    }
}

function removeRegEx(button) {
    var regex;
    var removeHost;
    var removeHostB = false;
    var cNode = button.parentNode.parentNode;
    var pNode = cNode.parentNode;

    // In case a regex gets removed
    if (button.classList.contains("delete-regex")) {
        regex = button.previousElementSibling.value;
        removeHost = (pNode.parentNode.firstElementChild.innerText || pNode.parentNode.firstElementChild.textContent);
        if (pNode.childElementCount === 1) {
            cNode = pNode.parentNode;
            pNode = cNode.parentNode;
            removeHostB = true;
        }
    }
    // In case a regex list gets removed
    else if (button.classList.contains("delete-regex-list")) {
        removeHost = (button.parentNode.innerText || button.parentNode.textContent);
        removeHostB = true;
    }
    
    // regex within the list for hostname have id's
    // regex within the "Current Page" have names that match the id's
    // if regex entry gets removed from "Current Page"
    if (removeHost === hostname &&
        (pNode.id === "current-RegEx" || pNode.parentNode.parentNode.id === "current-RegEx")) {
        var current = document.getElementById("r" + hostname);
        if (removeHostB) {
            current.parentNode.removeChild(current);
        }
        else {
            var listRegex = document.getElementById(button.parentNode.parentNode.getAttribute("name"));
            listRegex.parentNode.removeChild(listRegex);
        }
    }
    // if regex entry gets removed from within the list
    else if (removeHost === hostname) {
        var curRegEx = document.getElementById("current-RegEx");
        if (removeHostB) {
            curRegEx.removeChild(curRegEx.firstElementChild.nextElementSibling);
        }
        else {
            var curRegExEntry = document.getElementsByName(button.parentNode.parentNode.id)[0];
            curRegExEntry.parentNode.removeChild(curRegExEntry);
        }
    }
    
    pNode.removeChild(cNode);



    // remove from storage
    if (removeHostB) {
        delete hostnameList[removeHost].regexA;
        chrome.storage.sync.remove("hostnames");
        chrome.storage.sync.set({hostnames: hostnameList});
    }
    else if (regex) {
        console.log(regexA);
        console.log(regex);
        regexA = regexA.filter(function(item) {
            return item.regex !== regex;
        });
        console.log(regexA);
        hostnameList[removeHost].regexA = regexA;
        chrome.storage.sync.remove("hostnames");
        chrome.storage.sync.set({hostnames: hostnameList});        
    }
}

function removeExempt(button) {
    var exempt;
    var removeHost;
    var removeHostB = false;
    var cNode = button.parentNode.parentNode;
    var pNode = cNode.parentNode;

    // In case an exempt gets removed
    if (button.classList.contains("delete-exempt")) {
        exempt = button.previousElementSibling.value;
        removeHost = (pNode.parentNode.firstElementChild.innerText || pNode.parentNode.firstElementChild.textContent);
        if (pNode.childElementCount === 1) {
            cNode = pNode.parentNode;
            pNode = cNode.parentNode;
            removeHostB = true;
        }
    }
    // In case an exempt list gets removed
    else if (button.classList.contains("delete-exempt-list")) {
        removeHost = (button.parentNode.innerText || button.parentNode.textContent);
        removeHostB = true;
    }

    // exempt within the list for hostname have id's
    // exempt within the "Current Page" have names that match the id's
    // if exempt entry gets removed from "Current Page"
    if (removeHost === hostname &&
        (pNode.id === "current-Exempt" || pNode.parentNode.parentNode.id === "current-Exempt")) {
        var current = document.getElementById("e" + hostname);
        console.log(removeHostB);
        if (removeHostB) {
            console.log(current.parentNode);
            current.parentNode.removeChild(current);
        }
        else {
            var listExempt = document.getElementById(button.parentNode.parentNode.getAttribute("name"));
            listExempt.parentNode.removeChild(listExempt);
        }
    }
    // if exempt entry gets removed from within the list
    else if (removeHost === hostname) {
        var curExempt = document.getElementById("current-Exempt");
        if (removeHostB) {
            curExempt.removeChild(curExempt.firstElementChild.nextElementSibling);
        }
        else {
            console.log(button.parentNode.parentNode.id);
            var curExemptEntry = document.getElementsByName(button.parentNode.parentNode.id)[0];
            curExemptEntry.parentNode.removeChild(curExemptEntry);
        }
    }
    
    pNode.removeChild(cNode);


    //remove from storage
    if (removeHostB) {
        delete hostnameList[removeHost].exemptA;
        chrome.storage.sync.remove("hostnames");
        chrome.storage.sync.set({hostnames: hostnameList});
    }
    else if (exempt) {
        exemptA = exemptA.filter(function(item) {
            return item !== exempt;
        });
        hostnameList[removeHost].exemptA = exemptA;
        chrome.storage.sync.remove("hostnames");
        chrome.storage.sync.set({hostnames: hostnameList});     
    }
}

// Populate Page List

function populatePageList(site, siteList) {
    var pageList = document.getElementById('page-list');
    var currentPage = document.getElementById('current-page');
    var currentPageContainer = document.getElementById('current-page-container');
    var emptyListContainer = document.getElementById('empty-list-container');

    var website = site;
    var websiteBG;
    var entry;
    if (siteList[site]) {
        websiteBG = siteList[site].background;
        websiteBG = stripIfPreset(websiteBG);
        entry = 
        `
        <div class="list-entry-container">
            <div class="entry-line">
                <input type="text" class="entry-input-field" spellcheck="false" value="${website}">
                <div class="entry-button delete-button"><img src="images/delete.png"></div>
            </div>
            <div class="entry-line">
                <div class="entry-button copy-button"><img src="images/copy.png"></div>
                <input type="text" class="entry-input-field" spellcheck="false" value="${websiteBG}">
            </div>
        </div>
        `;

        currentPage.removeChild(currentPageContainer);
        currentPage.innerHTML += entry;
    }

    if (Object.keys(siteList).length !== 0) {
        pageList.removeChild(emptyListContainer);
    }

    Object.keys(siteList).forEach(function(k) {
        website = k;
        websiteBG = siteList[k].background;

        websiteBG = stripIfPreset(websiteBG);

        var special = "";
        if (website === site) {
            special = ` id="current"`;
        }

        entry = 
        `
        <div class="list-entry-container"${special}>
            <div class="entry-line">
                <input type="text" class="entry-input-field" spellcheck="false" value="${website}">
                <div class="entry-button delete-button"><img src="images/delete.png"></div>
            </div>
            <div class="entry-line">
                <div class="entry-button copy-button"><img src="images/copy.png"></div>
                <input type="text" class="entry-input-field" spellcheck="false" value="${websiteBG}">
            </div>
        </div>
        `;

        pageList.innerHTML += entry;
    });

    // Check if user clicked on a cross to remove a bg
    const crossArray = document.getElementsByClassName('delete-button');
    for (var l = 0; l < crossArray.length; l++) {
        crossArray[l].addEventListener("click", function() {
            removeBG(this);
        });
    }
}

// Populate RegEx List

function populateRegExList(hostname, hostnameList) {

    // populate "Current Page"
    var currentPage = document.getElementById('current-RegEx');
    var currentRegExContainer = document.getElementById('current-RegEx-container');
    if (hostnameList[hostname]) {
        var entryEntryList = constructEntryEntry(hostname, false);
        if (!(entryEntryList === "")) {
            var entry = 
            `
            <div>
                <div class="collapsible-2 list-entry-container"><div class="collIcon-2"></div>
                    ${hostname} <div class="entry-button delete-regex-list"><img src="images/delete.png"></div>
                </div>
                <div class="content clean-list-container">
                    ${entryEntryList}
                </div>
            </div>
            `;

            currentPage.removeChild(currentRegExContainer);
            currentPage.innerHTML += entry;
        }
    }

    // populate RegEx list
    var RegExList = document.getElementById('RegEx-list');
    Object.keys(hostnameList).forEach(function(k) {

        // construct the entry
        var entryEntryList = constructEntryEntry(k, true);
        if (entryEntryList === "") {
            return;
        }

        var special = ""
        if (k === hostname) {special = ` id="r${hostname}"`;}
        var entry =
        `
        <div${special}>
            <div class="collapsible-2 list-entry-container"><div class="collIcon-2"></div>
                ${k} <div class="entry-button delete-regex-list"><img src="images/delete.png"></div>
            </div>
            <div class="content clean-list-container">
                ${entryEntryList}
            </div>
        </div>
        `;


        // add entry to RegExList
        RegExList.innerHTML += entry;

    });

    // Check if user clicked on a cross to remove regex
    var crossArray1 = document.getElementsByClassName('delete-regex');
    var crossArray2 = document.getElementsByClassName('delete-regex-list');
    var crossArray = []
        .concat(Array.from(crossArray1))
        .concat(Array.from(crossArray2));
    for (var l = 0; l < crossArray.length; l++) {
        crossArray[l].addEventListener("click", function() {
            removeRegEx(this);
            reevalBG();
        });
    }

}

function constructEntryEntry(k, setID) {
    var entryEntryList = "";
    var regexA = hostnameList[k].regexA;
    if (!regexA) {
        return "";
    }
    for (var m = regexA.length - 1; m >= 0 ; m--) {
        var regex = regexA[m].regex;
        var websiteBG = regexA[m].background;
        websiteBG = stripIfPreset(websiteBG);
        var special = "";
        if (setID && k === hostname) {
            special = ` id="r${m}"`;
        }
        else if (k === hostname){
            special = ` name="r${m}"`;
        }
        var entryEntry = 
        `
        <div class="list-entry-container"${special}>
            <div class="entry-line">
                <input type="text" class="entry-input-field" spellcheck="false" value="${regex}">
                <div class="entry-button delete-regex"><img src="images/delete.png"></div>
            </div>
            <div class="entry-line">
                <div class="entry-button copy-button"><img src="images/copy.png"></div>
                <input type="text" class="entry-input-field" spellcheck="false" value="${websiteBG}">
            </div>
        </div>
        `;
        entryEntryList += entryEntry;
    }
    return entryEntryList;
}

// populate ExemptList

function populateExemptList(hostname, hostnameList) {

    // populate "Current Page"
    var currentPage = document.getElementById('current-Exempt');
    var currentExemptContainer = document.getElementById('current-Exempt-container');
    if (hostnameList[hostname]) {
        var entryEntryList = constructEntryEntryExempt(hostname, false);
        if (!(entryEntryList === "")) {
            var entry = 
            `
            <div>
                <div class="collapsible-2 list-entry-container"><div class="collIcon-2"></div>
                    ${hostname} <div class="entry-button delete-exempt-list"><img src="images/delete.png"></div>
                </div>
                <div class="content clean-list-container">
                    ${entryEntryList}
                </div>
            </div>
            `;

            currentPage.removeChild(currentExemptContainer);
            currentPage.innerHTML += entry;
        }
    }

    // populate Exempt List
    var ExemptList = document.getElementById('Exempt-list');
    Object.keys(hostnameList).forEach(function(k) {

        // construct the entry
        var entryEntryList = constructEntryEntryExempt(k, true);
        if (entryEntryList === "") {
            return;
        }

        var special = ""
        if (k === hostname) {special = ` id="e${hostname}"`;}
        var entry =
        `
        <div${special}>
            <div class="collapsible-2 list-entry-container"><div class="collIcon-2"></div>
                ${k} <div class="entry-button delete-exempt-list"><img src="images/delete.png"></div>
            </div>
            <div class="content clean-list-container">
                ${entryEntryList}
            </div>
        </div>
        `;


        // add entry to RegExList
        ExemptList.innerHTML += entry;

    });

    // Check if user clicked on a cross to remove exempt
    var crossArray1 = document.getElementsByClassName('delete-exempt');
    var crossArray2 = document.getElementsByClassName('delete-exempt-list');
    var crossArray = []
        .concat(Array.from(crossArray1))
        .concat(Array.from(crossArray2));
    for (var l = 0; l < crossArray.length; l++) {
        crossArray[l].addEventListener("click", function() {
            removeExempt(this);
            reevalBG();
        });
    }

}

function constructEntryEntryExempt(k, setID) {
    var entryEntryList = "";
    var exemptA = hostnameList[k].exemptA;
    if (!exemptA) {
        return "";
    }
    for (var m = exemptA.length - 1; m >= 0; m--) {
        var special = "";
        if (setID && k === hostname) {
            special = ` id="e${m}"`;
        }
        else if (k === hostname){
            special = ` name="e${m}"`;
        }
        var entryEntry = 
        `
        <div class="list-entry-container"${special}>
            <div class="entry-line">
                <input type="text" class="entry-input-field" spellcheck="false" value="${exemptA[m]}">
                <div class="entry-button delete-exempt"><img src="images/delete.png"></div>
            </div>
        </div>
        `;
        entryEntryList += entryEntry;
    }
    return entryEntryList;
}

// Strips preset links from chrome-extension:etc so it leaves only the preset's name
function stripIfPreset(websiteBG) {
    const re = /chrome-extension:\/\/[a-z]+\/presets\/images\//;
    if (re.test(websiteBG)) {
        websiteBG = websiteBG.split(re)[1];
        websiteBG = websiteBG.split(/\.[a-z]+/)[0]; //remove file extension
    }
    return websiteBG;
}

// Helper functions

function reevalBG() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, "reevalBG", function(response) {});
    });
}

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