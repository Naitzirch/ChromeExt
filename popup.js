// Query DOM
var apply = document.getElementsByClassName("apply");
    imgURL = document.getElementById('imgURL');


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
var colorWell;
var hexField = document.getElementById('hex-field');
var hexCode = document.getElementById('hex-code');
var defaultColor = hexCode.innerHTML;
var cd = document.getElementById('color-display');


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
    colorWell = document.querySelector("#colorWell");
    colorWell.value = defaultColor;
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
    fetch("presets/presets.json")
    .then(response => {
        return response.json();
    })
    .then(presetsData => {
        console.log(presetsData);

        Object.keys(presetsData).forEach(function(k){
            console.log(k + ' - ' + presetsData[k]);
        });
        
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