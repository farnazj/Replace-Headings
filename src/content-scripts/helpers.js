class Helper {
    constructor() {
        this.fuse = null;
        this.fuzzyScoreThreshold = 0.77;
    }

    openCustomTitlesDialog(ev) {
        browser.runtime.sendMessage({
            type: 'direct_to_custom_titles',
            data: {
                titleText: ev.target.innerText,
                titleElementId: ev.target.getAttribute('data-headline-id')
            }
        })
    }
    
    addAltTitleNodeToHeadline(altTitle) {
        const newEl = document.createElement('em');
        newEl.classList.add('new-alt-headline', `title-${altTitle.id}`);
        newEl.addEventListener('click', function(ev) {
            ev.preventDefault();

            browser.runtime.sendMessage({
                type: 'direct_to_custom_titles',
                data: {
                    titleId: altTitle.id
                }
            })
        })
    
        newEl.appendChild(document.createTextNode(altTitle.sortedCustomTitles[0]['lastVersion'].text + ' '));
        return newEl;
    }
    
    htmlDecode(input) {
        let doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }
    
    /*
    changes curly quotes to their non-curly counterparts
    */
    uncurlify(s) {
        return s
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');
    }
    
    
    getElementsContainingText(text) {

        let xpath, query;
        let uncurlifiedText = this.uncurlify(text);

        let results = [];

        try {
            xpath = `//*[contains(text(), "${text}") or contains(text(), "${uncurlifiedText}")]`;
            query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);    
        }
        catch (error) {
            console.log('error khord', error)
            if (error.name == 'DOMException') {
                xpath = `//*[contains(text(), '${text}') or contains(text(), '${uncurlifiedText}')]`;
                query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  
            }
        }
            
        for (let i = 0, length = query.snapshotLength; i < length; ++i) {
            results.push(query.snapshotItem(i));
        }
    
        return results;
    }

    getFuzzyTextSimilarToHeading(serverReturnedTitleText) {

        let pageContent = document.body.innerText.split('\n');
        const options = {
            includeScore: true,
            distance: 150
        }
        let Fuse = this.fuse;
       
        const fuse = new Fuse(pageContent, options)
        let uncurlifiedText = this.uncurlify(serverReturnedTitleText);

        let texts = uncurlifiedText != serverReturnedTitleText ? [uncurlifiedText, serverReturnedTitleText] : [serverReturnedTitleText];
        
        let finalResults = [], tempResults = [];
        for (let text of texts) {
            tempResults = fuse.search(text);
            if (!finalResults.includes(tempResults[0]))
                finalResults.push(tempResults[0]);
        }
        
        console.log('fuzzy search all results were', tempResults, this.fuzzyScoreThreshold, finalResults[0])
        return finalResults[0].score <= this.fuzzyScoreThreshold ? finalResults[0].item : null;
    }

    debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(context, args);
        }
    }

    throttle (callback, limit) {
        var waiting = false;                      // Initially, we're not waiting
        return function () {                      // We return a throttled function
            if (!waiting) {                       // If we're not waiting
                callback.apply(this, arguments);  // Execute users function
                waiting = true;                   // Prevent future invocations
                setTimeout(function () {          // After a period of time
                    waiting = false;              // And allow future invocations
                }, limit);
            }
        }
    }


    acceptInputOnHeadline (headlineContainer) {
        headlineContainer.setAttribute('data-headline-id', Math.random().toString(36).substring(2, 15));
        headlineContainer.addEventListener('click', this.openCustomTitlesDialog )
        headlineContainer.classList.add('headline-clickable');
    }

    setFuse (fuse) {
        this.fuse = fuse;
    }
}


globalHelper = new Helper();