chrome.browserAction.onClicked.addListener(function(activeTab) {
  console.log(activeTab);
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    regexList: {
      type0: true,
      type1: true,
      type2: true,
      type3: true,
      type4: true,
    },
    outputFormat: {
      hour: true,
      minute: true,
      month: true,
      day: true,
      highlight: true,
    },
  }, () => {
    chrome.runtime.openOptionsPage();
  });
})