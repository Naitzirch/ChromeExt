// Naitzirch 2022
//
// Handle receiving backgrounds and storing them
// for specific websites

// Define imgURL in larger scope than listener
var imgURL; //chrome.runtime.getURL("presets/nyancat.gif");

// listener
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        imgURL = request.imageURL;
        console.log(imgURL);

        // Apply background immediately
        document.body.style.backgroundImage = `url(${imgURL})`;


        sendResponse({farewell: "goodbye"});
    }
);

