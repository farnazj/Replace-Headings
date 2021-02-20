console.log('Hello from the content-script')

let iframe = document.createElement('iframe');
iframe.classList.add('extension-side-bar', 'extension-hidden');
iframe.src = chrome.extension.getURL("popup.html")
console.log(chrome.extension.getURL("popup.html"))

document.body.appendChild(iframe);


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


function openCustomTitlesDialog(ev) {
    browser.runtime.sendMessage({
        type: 'direct_to_custom_titles',
        data: {
            titleText: ev.target.innerText,
            titleElementId: ev.target.getAttribute('data-headline-id')
        }
    })
}

function addAltTitleNodeToHeadline(altTitle) {
    const newEl = document.createElement('em');
    newEl.classList.add('new-alt-headline', `title-${altTitle.id}`);
    newEl.addEventListener('click', function(ev) {
        browser.runtime.sendMessage({
            type: 'direct_to_custom_titles',
            data: {
                titleId: altTitle.id
            }
        })
    })

    newEl.appendChild(document.createTextNode(' '+ altTitle.sortedCustomTitles[0]['lastVersion'].text));
    return newEl;
}

browser.runtime.onMessage.addListener( (msgObj, sender, sendResponse) => {

    console.log(msgObj, sender)
    if (msgObj.type == 'open_sidebar') {
        iframe.classList.remove('extension-hidden');
        if (!iframe.classList.contains('extension-side-bar'))
            iframe.classList.add('extension-side-bar');
    }
    else if (msgObj.type == 'close_sidebar') {
        iframe.classList.add('extension-hidden');
    }
    else if (msgObj.type == 'open_custom_titles') {
        iframe.classList.remove('extension-side-bar');
        iframe.classList.remove('extension-hidden');
        iframe.classList.add('extension-dialog');
        document.body.classList.add('body-no-scroll');
    }
    else if (msgObj.type == 'close_custom_titles') {
        iframe.classList.remove('extension-dialog');
        document.body.classList.remove('body-no-scroll');
    }
    else if (msgObj.type == 'get_document_innertext') {
        let pageContent = document.body.innerText;
        sendResponse(pageContent);
    }
    else if (msgObj.type == 'get_page_url') {
        sendResponse(window.location.href);
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
            console.log(el, 'element')
            if (el.nodeName != 'SCRIPT') {
                nonScriptResultsCount += 1;
                console.log(el.classList)

                //if headline has not been modified yet
                if (!el.classList.contains('headline-modified')) {

                    const originalTitle = el.textContent;
                    el.textContent = "";
                    
                    const newFirstChild = document.createElement('del');
                    newFirstChild.classList.add('headline-modified');
                    newFirstChild.appendChild(document.createTextNode(originalTitle));
    
                    let newSecondChild = addAltTitleNodeToHeadline(msgObj.title)
    
                    el.appendChild(newFirstChild);
                    el.appendChild(newSecondChild);
                }
                else {
                    //if headline has already been modified, the displayed alt headline either needs to change to another (in case of headline editing or removing), or the alt headline should be removed altogether and the style of the original headline should be restored back to its original state (in case there is no alt headline left for the headline)
                    let headlineContainer = el.parentNode;
                    
                    if (headlineContainer.children.length == 2) {
                        headlineContainer.removeChild(headlineContainer.children[1]);
                        if (msgObj.remove == true) {
                            headlineContainer.appendChild(document.createTextNode(headlineContainer.children[0].textContent));
                            headlineContainer.removeChild(headlineContainer.children[0]);

                            headlineContainer.setAttribute('data-headline-id', Math.random().toString(36).substring(2, 15));
                            headlineContainer.addEventListener('click', openCustomTitlesDialog )

                        }
                        else {
                            let newSecondChild = addAltTitleNodeToHeadline(msgObj.title)
                            headlineContainer.appendChild(newSecondChild)
                        }
                        
                    }
                }

            }
        })
        observer.observe(targetNode, config);
        sendResponse(nonScriptResultsCount);
    }
    else if (msgObj.type == 'identify_potential_titles') {

        //TODO
        //find h1 elements
        let headings = document.querySelectorAll('h1');

        headings.forEach(heading => {
            heading.setAttribute('data-headline-id', Math.random().toString(36).substring(2, 15));
            heading.addEventListener('click', openCustomTitlesDialog )
        })

    }
    else if (msgObj.type == 'remove_event_listener_from_title') {
        let heading = document.querySelector(`[data-headline-id="${msgObj.data.headlineId}"]`);
        heading.removeEventListener('click', openCustomTitlesDialog);
    }
    
});