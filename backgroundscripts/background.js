chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    console.log('running');
    chrome.tabs.sendMessage(tabs[0].id, {action: "replaceDate"}, function(response) {});  
  });
})