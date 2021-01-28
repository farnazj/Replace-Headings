browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request, sender)
  console.log('Hello from the background')

  
})

// function handleCreated(tab) {
//   console.log(tab.id);

// }

// browser.tabs.onCreated.addListener(handleCreated);
// console.log('y9')

browser.browserAction.onClicked.addListener(function(tab) { 

  browser.tabs.executeScript({
    file: 'js/content-script.js',
  });
  browser.tabs.sendMessage(tab.id,"toggle");

});
