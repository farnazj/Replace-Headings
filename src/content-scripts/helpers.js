
class Helper {

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
    
    htmlDecode(input) {
        let doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }
    
    /*
    changes curly quotes to their non-curly counterparts
    */
    static uncurlify(s) {
        return s
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');
    }
    
    
    getElementsContainingText(text) {
        let xpath, query;
        let uncurlifiedText = Helper.uncurlify(text);
    
        try {
            xpath = `//*[contains(text(), "${text}") or contains(text(), "${uncurlifiedText}")]`;
            query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);    
        }
        catch (error) {
            if (error.name == 'DOMException') {
                xpath = `//*[contains(text(), '${text}') or contains(text(), '${uncurlifiedText}')]`;
                query = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);  
            }
        }
    
        let results = [];
    
        for (let i = 0, length = query.snapshotLength; i < length; ++i) {
            results.push(query.snapshotItem(i));
        }
    
        console.log(results)
        return results;
    }
}

globalHelper = new Helper();