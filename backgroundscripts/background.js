const dateRegex = {
  type1: '[0-9]{13}',
  type2: '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} \\+[0-9]{4}',
  type3: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})Z',
  type4: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\ [0-9]{2}:[0-9]{2})?',
};

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    console.log('running');
    chrome.tabs.sendMessage(tabs[0].id, {action: "replaceDate"}, function(response) {});  
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    regexList: {
      type0: true,
      type1: true,
      type2: true,
      type3: true,
    },
    outputFormat: {
      hour: true,
      minute: true
    },
  });
})