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

//
apply.addEventListener('click', function(){
    ApplyBG(imgURL.innerHTML);
});

function ApplyBG(background) {
    console.log(background);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {imageURL: "hello"}, function(response) {
            console.log(response.farewell);
        });
    });

}