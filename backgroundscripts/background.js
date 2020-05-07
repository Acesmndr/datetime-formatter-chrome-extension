const dateRegex = {
  type0: '[0-9]{13}',
  type1: '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} \\+[0-9]{4}',
  type2: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})Z',
  type3: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\ [0-9]{2}:[0-9]{2})?',
  type4: '(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\\,\\ (January|February|March|April|May|June|July|August|September|October|November|December)\\ [0-9]{1,2},\\ [0-9]{4}\\ [0-9]{1,2}:[0-9]{2}\\ (AM|PM)',
  type5: '((Sun|Mon|Tue|Wed|Thu|Fri|Sat)\\,\\ )?[a-zA-Z]{3}\\ [0-9]{1,2},\\ [0-9]{4}\\ [0-9]{1,2}:[0-9]{2}\\ (AM|PM)',
};

chrome.browserAction.onClicked.addListener(() => {
  chrome.storage.local.get((storageData) => {
    const { regexList, outputFormat } = storageData;
    const applicableRegex = Object.keys(dateRegex).filter(regEx => regexList[regEx]).map(regEx => dateRegex[regEx]);
    const dateFormat = {
      year: outputFormat.year ? 'numeric' : undefined,
      month: outputFormat.month ? 'short' : undefined,
      day: outputFormat.day ? '2-digit' : undefined,
      hour: outputFormat.hour ? '2-digit' : undefined,
      minute: outputFormat.minute ? '2-digit' : undefined,
      second: outputFormat.second ? '2-digit' : undefined,
      hour12: !outputFormat.hour24,
      timeZone: outputFormat.utc ? 'utc' : Intl.DateTimeFormat().resolvedOptions().timeZone ,
    }
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'replaceDate',
        payload: {
          applicableRegex,
          dateFormat,
          highlight: outputFormat.highlight,
        }
      },
      (response) => {});
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