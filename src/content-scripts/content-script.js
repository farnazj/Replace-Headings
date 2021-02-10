console.log('Hello from the content-script')

let iframe = document.createElement('iframe'); 
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

// iframe.style.width = "50px"
// function toggle(){
//     if (iframe.style.width == "0px") {
//         // iframe.style.width="400px";
//     }
//     else {
//         iframe.style.width="0px";
//         console.log('closing')
//     }
// }

// toggle()


const targetNode = document.body;
const config = { attributes: false, childList: true, subtree: true };

const callback = function(mutationsList, observer) {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
            browser.runtime.sendMessage({
                data: "Hello popup, how are you"
            }).then( (resp) => {
                console.log(resp);
            });
        }
    }
};

const observer = new MutationObserver(callback);
document.addEventListener('DOMContentLoaded', function() {
    observer.observe(targetNode, config);
}, false);




browser.runtime.onMessage.addListener( (msgObj, sender, sendResponse) => {

    console.log(msgObj, sender)
    if (msgObj.type == 'open_sidebar') {
        console.log('iframe', iframe)
        iframe.style.width = "400px";
    }
    else if (msgObj.type == 'close_sidebar') {
        iframe.style.width = "0px";
    }
    else if (msgObj.type == 'get_document_innertext') {
        let pageContent = document.body.innerText;
        sendResponse(pageContent);
    }
    else if (msgObj.type == 'find_and_replace_title') {

        let xpath, query;
        try {
            xpath = `//*[contains(text(), "${msgObj.title.text}") or contains(text(), "${msgObj.title.uncurlifiedFullText}")]`;
            query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);    
        }
        catch (error) {
            if (error.name == 'DOMException') {
                xpath = `//*[contains(text(), '${msgObj.title.text}') or contains(text(), '${msgObj.title.uncurlifiedFullText}')]`;
                query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  
            }
        }

        let results = [];

        for (let i = 0, length = query.snapshotLength; i < length; ++i) {
            results.push(query.snapshotItem(i));
        }

        console.log(results)
        let nonScriptResultsCount = 0;

        observer.disconnect();

        results.forEach(el => {
            if (el.nodeName != 'SCRIPT') {
                if (!el.classList.contains('headline-modified')) {
                    nonScriptResultsCount += 1;

                    const originalTitle = el.textContent;
                    el.textContent = "";
                    
                    const newFirstChild = document.createElement('del');
                    newFirstChild.classList.add('headline-modified');
                    newFirstChild.appendChild(document.createTextNode(originalTitle));
    
                    const newSecondChild = document.createElement('em');
                    newSecondChild.classList.add('new-alt-headline', `title-${msgObj.title.id}`);
                    newSecondChild.addEventListener('click', function(ev) {
                        browser.runtime.sendMessage({
                            type: 'show_custom_titles',
                            data: msgObj.title.id
                        })
                    })

                    newSecondChild.appendChild(document.createTextNode(' '+ msgObj.title.sortedCustomTitles[0]['lastVersion'].text));
    
                    el.appendChild(newFirstChild);
                    el.appendChild(newSecondChild);
                }

            }
        })
        observer.observe(targetNode, config);
        sendResponse(nonScriptResultsCount);
    }
    
});