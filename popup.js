// Query DOM
var apply = document.getElementById('apply');
    imgURL = document.getElementById('imgURL');


// Fancy button smh...
apply.addEventListener('mousedown', function(){
    apply.style.backgroundColor = "#efefef";
});

apply.addEventListener('mouseup', function(){
    apply.style.backgroundColor = "#bdbdbd";
});

apply.addEventListener('mouseleave', function(){
    apply.style.backgroundColor = "#efefef";
});

apply.addEventListener('mouseenter', function(){
    apply.style.backgroundColor = "#bdbdbd";
});

// Input field logic
imgURL.addEventListener('click', function(){
    if (imgURL.innerHTML === "img URL") {
        imgURL.innerHTML = "";
    }
});

// Prevent users from pasting in rich content
var ce = document.querySelector('[contenteditable]');
ce.addEventListener('paste', function (e) {
    e.preventDefault();
    var text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
});

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
var defaultColor = document.getElementById('hex-code').innerHTML;

window.addEventListener("load", startup, false);

function startup() {
    colorWell = document.querySelector("#colorWell");
    colorWell.value = defaultColor;
    colorWell.addEventListener("input", updateFirst, false);
    colorWell.addEventListener("change", updateAll, false);
    colorWell.select();
}

function updateFirst(event) {
    var cd = document.querySelector("#color-display");
    var hexCode = document.getElementById('hex-code');

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
  


// Check if user clicked on Apply background.
apply.addEventListener('click', function(){
    ApplyBG(imgURL.innerHTML);
});

function ApplyBG(background) {
    // Check which tab is the running tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Emit message with background to the app running on the active website
        chrome.tabs.sendMessage(tabs[0].id, {imageURL: background}, function(response) {
            // Log app's response
            console.log(response.farewell);
        });
    });
}