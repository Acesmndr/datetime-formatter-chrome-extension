chrome.browserAction.onClicked.addListener(function(activeTab) {
  chrome.tabs.executeScript({
    file: 'assets/contentscript.js',
    allFrames : true,
    matchAboutBlank: true,
  });
  chrome.browserAction.setBadgeBackgroundColor({
    color: '#1AA260',
    tabId: activeTab.id,
  }, () => {
    chrome.browserAction.setBadgeText({
      text: '✓',
      tabId: activeTab.id,
    });
  });
});

chrome.runtime.onInstalled.addListener((details) => {
  if(details.reason === 'install') {
    chrome.storage.local.clear();
    chrome.storage.local.set({
      regexList: {
        type0: true,
        type1: true,
        type2: true,
        type3: true,
        type4: true,
        type5: true,
      },
      outputFormat: {
        hour: true,
        minute: true,
        month: true,
        day: true,
        highlight: true,
        validFor100Years: true,
      },
      alertBoxes: {
        info: true,
        whatsnew: true,
      },
    }, () => {
      chrome.runtime.openOptionsPage();
    });
  }
});
