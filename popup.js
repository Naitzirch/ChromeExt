// Query DOM
var apply = document.getElementById('apply');
    imgURL = document.getElementById('message');


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