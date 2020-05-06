const dateRegex = {
  type1: '[0-9]{13}',
  type2: '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} \\+[0-9]{4}',
  type3: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})Z',
  type4: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\ [0-9]{2}:[0-9]{2})?',
};

chrome.browserAction.onClicked.addListener(() => {
  chrome.storage.local.get((storageData) => {
    const { regexList, outputFormat } = storageData;
    const applicableRegex = Object.keys(dateRegex).filter(regEx => regexList[regEx]).map(regEx => dateRegex[regEx]);
    const dateFormat = {
      year: outputFormat.year && 'numeric',
      month: outputFormat.month && 'short',
      day: outputFormat.day && '2-digit',
      hour: outputFormat.hour && '2-digit',
      minute: outputFormat.minute && '2-digit',
      second: outputFormat.second && '2-digit',
      timeZone: outputFormat.utc ? 'utc' : Intl.DateTimeFormat().resolvedOptions().timeZone ,
    }
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'replaceDate',
        payload: {
          applicableRegex,
          dateFormat,
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
    },
  });
})