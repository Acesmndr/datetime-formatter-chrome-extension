const dateRegex = {
  type0: '[0-9]{12,13}',
  type1: '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} (\\+|\\-)[0-9]{4}',
  type2: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z',
  type3: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})Z',
  type4: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}',
  type5: '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} UTC',
  type6: '(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\\,\\ (January|February|March|April|May|June|July|August|September|October|November|December)\\ [0-9]{1,2},\\ [0-9]{4}\\ [0-9]{1,2}:[0-9]{2}\\ (AM|PM)',
  type7: '((Sun|Mon|Tue|Wed|Thu|Fri|Sat)\\,\\ )?[a-zA-Z]{3}\\ [0-9]{1,2},\\ [0-9]{4}\\ [0-9]{1,2}:[0-9]{2}\\ (AM|PM)',
};

const dateLiesOutsideTimeFrame = (dateText, validFor100Years) => {
  if (validFor100Years) {
    const dateTime = new Date(dateText) && new Date(dateText).getTime();
    const oneHundredYears = 31556952000000; // 10 x 365 x 24 x 60 x 60 x 1000 milliseconds
    if ((dateTime - Date.now()) > oneHundredYears && dateTime !== 0) {
      return true;
    }
  }
  return false;
}

const replace = (rawText, regex, outputConfig, replacementFormat) => {
  try {
    const matchedText = rawText.match(regex)[0];
    let replacementText = matchedText;
    if (dateRegex.type0 === regex.source) {
      replacementText = Number(matchedText.match(regex)[0]);
    }
    if(dateLiesOutsideTimeFrame(replacementText, outputConfig.validFor100Years)) {
      return rawText;
    }
    replacementText = new Date(replacementText).toLocaleTimeString('en-US', replacementFormat);
    if (replacementText === 'Invalid Date') {
      return rawText;
    }
    return rawText.replace(regex, outputConfig.highlight ? `<mark title='${rawText}'>${replacementText}</mark>` : replacementText);
  } catch(e) {
    console.log('Couldn\'t convert a date', rawText, regex);
    return rawText;
  }
};

const findAndReplace = (searchText, replacementFormat, highlight, searchNode) => {
  /** This function was derived from https://j11y.io/javascript/find-and-replace-text-with-javascript/ */
  if (!searchText || typeof replacementFormat === 'undefined') {
    return;
  }
  var regex = typeof searchText === 'string' ?
  new RegExp(searchText, 'g') : searchText,
  childNodes = (searchNode || document.body).childNodes,
  cnLength = childNodes.length,
  excludes = 'html,head,style,title,link,meta,script,object,iframe';
  while (cnLength--) {
    var currentNode = childNodes[cnLength];
    if (currentNode.nodeType === 1 &&
      (excludes + ',').indexOf(currentNode.nodeName.toLowerCase() + ',') === -1) {
      findAndReplace(searchText, replacementFormat, highlight, currentNode);
    }
    if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
      continue;
    }
    var parent = currentNode.parentNode,
    frag = (function(){
      var html = replace(currentNode.data, regex, highlight, replacementFormat),
      wrap = document.createElement('div'),
      frag = document.createDocumentFragment();
      wrap.innerHTML = html;
      while (wrap.firstChild) {
        frag.appendChild(wrap.firstChild);
      }
      return frag;
    })();
    parent.insertBefore(frag, currentNode);
    parent.removeChild(currentNode);
  }
};

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
    timeZone: outputFormat.utc ? 'utc' : Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
  applicableRegex.forEach(regEx => {
    findAndReplace(regEx, dateFormat, { highlight: outputFormat.highlight, validFor100Years: outputFormat.validFor100Years }, document.body);
  });
});
