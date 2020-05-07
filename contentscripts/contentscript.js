const dateRegex = {
  type0: '[0-9]{13}',
  type1: '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} (\\+|\\-)[0-9]{4}',
  type2: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z',
  type3: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})Z',
  type4: '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}',
  type5: '(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\\,\\ (January|February|March|April|May|June|July|August|September|October|November|December)\\ [0-9]{1,2},\\ [0-9]{4}\\ [0-9]{1,2}:[0-9]{2}\\ (AM|PM)',
  type6: '((Sun|Mon|Tue|Wed|Thu|Fri|Sat)\\,\\ )?[a-zA-Z]{3}\\ [0-9]{1,2},\\ [0-9]{4}\\ [0-9]{1,2}:[0-9]{2}\\ (AM|PM)',
};

const replace = (rawText, regex, highlight, replacementFormat) => {
  try {
    const matchedText = rawText.match(regex)[0];
    let replacementText = new Date(isNaN(Number(matchedText)) ? matchedText : Number(matchedText)).toLocaleTimeString('en-US', replacementFormat);
    return rawText.replace(regex, highlight ? `<mark>${replacementText}</mark>` : replacementText);
  } catch(e) {
    console.log('Couldn\'t convert a date');
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
    findAndReplace(regEx, dateFormat, outputFormat.highlight, document.body);
  });
});
