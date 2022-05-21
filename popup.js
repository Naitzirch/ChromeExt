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
    
// Request information from chrome storage
var site;
var hostname;
var siteList = {};
var hostnameList = {};
var regexA = [];
var defaultColor;
window.addEventListener('load', (event) => {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        tab = tabs[0];
        site = tab.url;
        hostname = (new URL(site)).hostname;

        // Request data chrome storage
        chrome.storage.sync.get(['sites', 'hostnames'], function(result) {
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
                }

                // Everything that needs initialization with storage data

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
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
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

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, "removeBG", function(response) {});
            });
        }
        // In case deleted from Page List
        else if (ListContainer.id === "page-list") {
            if (ListEntryContainer.id && ListEntryContainer.id === "current") {
                var currentPage = document.getElementById('current-page');
                currentPage.removeChild(currentPage.firstElementChild.nextElementSibling);
                currentPage.innerHTML += nobg;
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, "removeBG", function(response) {});
                });
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
        console.log(siteList);
        chrome.storage.sync.remove("sites");
        chrome.storage.sync.set({sites: siteList});
    }
}

function removeRegEx(button) {
    var value = button.previousElementSibling.value;

    // remove from storage
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

    var RegExList = document.getElementById('RegEx-list');
    Object.keys(hostnameList).forEach(function(k) {

        // construct the entry
        var entryEntryList = "";
        var regexA = hostnameList[k].regexA;
        for (var m = 0; m < regexA.length; m++) {
            var regex = regexA[m].regex;
            var websiteBG = regexA[m].background;
            var entryEntry = 
            `
            <div class="list-entry-container">
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
        

        var entry =
        `
        <div class="collapsible-2 list-entry-container"><div class="collIcon-2"></div>
            ${k} <div class="entry-button delete-button"><img src="images/delete.png"></div>
        </div>
        <div class="content clean-list-container">
            ${entryEntryList}
        </div>
        `;


        // add entry to RegExList
        RegExList.innerHTML += entry;

    });

    // Check if user clicked on a cross to remove a bg
    const crossArray = document.getElementsByClassName('delete-regex');
    for (var l = 0; l < crossArray.length; l++) {
        crossArray[l].addEventListener("click", function() {
            removeRegEx(this);
        });
    }

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