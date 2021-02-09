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

    console.log(msgObj, sender)
    if (msgObj.type == 'get_document_innertext') {
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

        results.forEach(el => {
            if (el.nodeName != 'SCRIPT') {

                nonScriptResultsCount += 1;

                const originalTitle = el.textContent;
                el.textContent = ""
                
                const newFirstChild = document.createElement('del');
                newFirstChild.appendChild(document.createTextNode(originalTitle));

                const newSecondChild = document.createElement('em');
                newSecondChild.style.color = '#9E9D24';
                console.log(msgObj.title.sortedCustomTitles[0]['lastVersion'].text)
                newSecondChild.appendChild(document.createTextNode( msgObj.title.sortedCustomTitles[0]['lastVersion'].text));

                el.appendChild(newFirstChild)
                el.appendChild(newSecondChild)
                // el.insertBefore(document.createElement('br'), newSecondChild)
            }
        })
        
        sendResponse(nonScriptResultsCount);
    }
    

});