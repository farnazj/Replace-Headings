console.log('Hello from the content-script')
console.log('here')

//console.log(document.querySelector('h1').children[0].innerHTML)


var iframe = document.createElement('iframe'); 
//iframe.style.background = "salmon";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "90000000000000";
iframe.frameBorder = "none"; 
iframe.src = chrome.extension.getURL("popup.html")
console.log(chrome.extension.getURL("popup.html"))

document.body.appendChild(iframe);

function toggle(){
    if (iframe.style.width == "0px") {
        console.log('opening')
        iframe.style.width="400px";
    }
    else {
        iframe.style.width="0px";
        console.log('closing')
    }
}

toggle()


browser.runtime.onMessage.addListener( (msgObj, sender, sendResponse) => {
    // do something with msgObj
    console.log(msgObj, sender)
    let pageContent = document.body.innerText;
    sendResponse({message: "Response from content script", content: pageContent});

});