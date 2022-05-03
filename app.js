

// listener
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("test");
        if (request.imageURL === "hello")
            sendResponse({farewell: "goodbye"});
    }
);