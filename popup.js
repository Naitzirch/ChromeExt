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
                }
                if (result.hostnames) {
                    hostnameList = result.hostnames;
                    if (hostnameList[hostname].regexA) {
                        regexA = hostnameList[hostname].regexA;
                    }
                }

                // Everything that needs initialization storage data

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

// Collapsibles
var collIcon = document.getElementsByClassName("collIcon");
var coll = document.getElementsByClassName("collapsible");
var i;

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

// Page Selector logic



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
    if (ibpB) {
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

// Populate Page List

function populatePageList(site, siteList) {
    var pageList = document.getElementById('page-list');
    var currentPage = document.getElementById('current-page');
    var currentPageContainer = document.getElementById('current-page-container');

    var website = site;
    var websiteBG;
    var entry;
    if (siteList[site]) {
        websiteBG = siteList[site].background;
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

    Object.keys(siteList).forEach(function(k) {
        website = k;
        websiteBG = siteList[k].background;

        const re = /chrome-extension:\/\/[a-z]+\/presets\/images\//;
        if (re.test(websiteBG)) {
            websiteBG = websiteBG.split(re)[1];
            websiteBG = websiteBG.split(/\.[a-z]+/)[0]; //remove file extension
        }

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

        pageList.innerHTML += entry;
    });
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