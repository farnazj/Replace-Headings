console.log('Hello from the content-script');
import Fuse from 'fuse.js'

let throttle = globalHelper.throttle;

let iframe = document.createElement('iframe');
iframe.classList.add('extension-side-bar', 'extension-hidden');
iframe.src = chrome.extension.getURL("popup.html")
document.body.appendChild(iframe);



const targetNode = document.body;
const config = { attributes: false, childList: true, subtree: true };

const callback = throttle(function(mutationsList, observer) {
    console.log('going to execute callback **')
    let childMutation = false;
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            childMutation = true;
        }
    }
    if (childMutation) {
        console.log('A child node has been added or removed.');
        observer.takeRecords();
        observer.disconnect();
        browser.runtime.sendMessage({
            data: "Hello popup, how are you",
            type: 'fetch_titles'
        }).then( (resp) => {
            console.log(resp);
        });
    }
}, 5000);

const observer = new MutationObserver(callback);
document.addEventListener('DOMContentLoaded', function() {
    observer.observe(targetNode, config);    
}, false);


globalHelper.setFuse(Fuse);

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
        observer.disconnect();
        iframe.classList.remove('extension-side-bar');
        iframe.classList.remove('extension-hidden');
        iframe.classList.add('extension-dialog');
        document.body.classList.add('body-no-scroll');

    }
    else if (msgObj.type == 'close_custom_titles') {
        iframe.classList.remove('extension-dialog');
        document.body.classList.remove('body-no-scroll');
        observer.observe(targetNode, config);
    }
    else if (msgObj.type == 'get_document_innertext') {
        let pageContent = document.body.innerText;
        sendResponse(pageContent);
    }
    else if (msgObj.type == 'get_page_url') {
        sendResponse(window.location.href);
    }
    else if (msgObj.type == 'find_and_replace_title') {

        let results = globalHelper.getElementsContainingText(msgObj.title.text);

        console.log('results of els', results)
        if (!results.length) {
            let similarText = globalHelper.getFuzzyTextSimilarToHeading(msgObj.title.text);
            if (similarText)
                results = globalHelper.getElementsContainingText(similarText);
        }

        let nonScriptResultsCount = 0;

        observer.disconnect();

        results.forEach(el => {
            console.log(el, 'element')
            if (el.nodeName != 'SCRIPT') {
                nonScriptResultsCount += 1;

                console.log('element found')

                //if headline has not been modified yet
                if (!el.classList.contains('headline-modified')) {

                    const originalTitle = el.textContent;
                    el.textContent = "";
                    let newFirstChild = globalHelper.addAltTitleNodeToHeadline(msgObj.title)

                    const newSecondChild = document.createElement('del');
                    newSecondChild.classList.add('headline-modified');
                    newSecondChild.appendChild(document.createTextNode(originalTitle));
    
    
                    el.appendChild(newFirstChild);
                    el.appendChild(newSecondChild);
                }
                else {
                    //if headline has already been modified, the displayed alt headline either needs to change to another (in case of headline editing or removing), or the alt headline should be removed altogether and the style of the original headline should be restored back to its original state (in case there is no alt headline left for the headline)
                    let headlineContainer = el.parentNode;

                    if (headlineContainer.children.length == 2) {
                        headlineContainer.removeChild(headlineContainer.children[0]);
                        if (msgObj.remove == true) {
                            headlineContainer.appendChild(document.createTextNode(headlineContainer.children[0].textContent));
                            headlineContainer.removeChild(headlineContainer.children[0]);

                            globalHelper.acceptInputOnHeadline(headlineContainer)

                            /*
                            manually redirecting to the headline view with the correct params (the dialog that is open now corresponds to a view that has titleId as a param. And that titleId along with its corresponding standaloneTitle has been deleted from the store and no longer exists)
                            */
                            browser.runtime.sendMessage({
                                type: 'direct_to_custom_titles',
                                data: {
                                    titleText: headlineContainer.textContent,
                                    titleElementId: headlineContainer.getAttribute('data-headline-id'),
                                    titleId: null
                                }
                            })

                        }
                        else {
                            let newFirstChild = globalHelper.addAltTitleNodeToHeadline(msgObj.title)
                            headlineContainer.insertBefore(newFirstChild, headlineContainer.children[0])
                        }
                        
                    }
                }

            }
        })
        observer.observe(targetNode, config);
        sendResponse(nonScriptResultsCount);
    }
    else if (msgObj.type == 'identify_potential_titles') {

        let elResults;
        try {
            let ogTitle = globalHelper.htmlDecode(document.querySelector('meta[property="og:title"]').getAttribute('content'));
            elResults = globalHelper.getElementsContainingText(ogTitle).filter(el => !(['SCRIPT', 'TITLE'].includes(el.nodeName)));
            console.log(elResults)
        }
        catch(err) {
            console.log('in og:title, error is', err)
        }

        try {
            if (!elResults.length) {
                let twitterTitle = globalHelper.htmlDecode(document.querySelector('meta[name="twitter:title"]').getAttribute('content'));
                elResults = globalHelper.getElementsContainingText(twitterTitle).filter(el => !(['SCRIPT', 'TITLE'].includes(el.nodeName)));
                console.log(elResults)
            }
        }
        catch(err) {
            console.log('in twitter:title, error is', err)
        }

        if (!elResults.length) {
            elResults = document.querySelectorAll('h1');
        }
    
        elResults.forEach(heading => {
            console.log('title found', heading, heading.nodeName)
            
            globalHelper.acceptInputOnHeadline(heading)
        })

        observer.observe(targetNode, config);

    }
    else if (msgObj.type == 'remove_event_listener_from_title') {
        let heading = document.querySelector(`[data-headline-id="${msgObj.data.headlineId}"]`);
        heading.removeEventListener('click', globalHelper.openCustomTitlesDialog);
        heading.classList.remove('headline-clickable');
    }
    
    
});