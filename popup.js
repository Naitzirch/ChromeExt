// Naitzirch 2022
// 
// Frontend for Custom Background Extension

// Query DOM
var apply = document.getElementsByClassName("apply");
    imgURL = document.getElementById('imgURL');
    hexCode = document.getElementById('hex-code');
    cd = document.getElementById('color-display');
    colorWell = document.querySelector("#colorWell");
    
    
// Request information from the app running on the site
var siteList;
var site;
var defaultColor;
window.addEventListener('load', (event) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Request data from app
        chrome.tabs.sendMessage(tabs[0].id, "siteData", function(response) {
            // Log app's response
            if (response) {
                siteList = response.siteList;
                site = response.site;
            

                // Everything that needs initialization with site data
                if (site in siteList) {
                    var background = siteList[site].background;
                    if (isHex(background)) {
                        hexCode.innerHTML = background;
                        defaultColor = hexCode.innerHTML;
                        cd.style.backgroundColor = defaultColor;
                        colorWell.value = defaultColor;
                    }
                }
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

// Prevent users from pasting in rich content
// var ce = document.querySelector('[contenteditable]');
// ce.addEventListener('paste', function (e) {
//     e.preventDefault();
//     var text = e.clipboardData.getData('text/plain');
//     document.execCommand('insertText', false, text);
// });

// Tabs
var tabList = document.getElementsByClassName('tablinks');
var k;
for (k = 0; k < tabList.length; k++) {
    tabList[k].addEventListener('click', function() {
        return openCity(this);
    });
}

function openCity(curTab) {
    var i, tabcontent, tablinks, cityName, curTabContent;
    cityName = curTab.innerHTML;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    curTab.className += " active";
    curTabContent = document.getElementById(cityName);
    curTabContent.style.display = "block";
  }
  
  // Get the element with id="defaultOpen" and click on it
  document.getElementById("defaultOpen").click();

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
    // Check which tab is the running tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Emit message with background to the app running on the active website
        chrome.tabs.sendMessage(tabs[0].id, {background: bg}, function(response) {
            // Log app's response
            console.log(response.farewell);
        });
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