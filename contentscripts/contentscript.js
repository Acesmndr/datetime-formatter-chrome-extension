chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'replaceDate') {
    // 1588783462775
    findAndReplace('[0-9]{13}', '', document.body);
    // 2020-05-06 15:53:07 +0000
    findAndReplace('[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2} \\+[0-9]{4}', '', document.body);
    // 2020-05-03T00:00:00 05:45
    findAndReplace('[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})Z', '', document.body);
    findAndReplace('[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\ [0-9]{2}:[0-9]{2})?', '', document.body);
  }
});


function findAndReplace(searchText, replacementFormat, searchNode) {
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
      findAndReplace(searchText, replacementFormat, currentNode);
    }
    if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
      if(/2020-05-06/.test(currentNode.data)) {
        console.log(currentNode.data, regex.test(currentNode.data), regex);
      }
      continue;
    }
    var parent = currentNode.parentNode,
    frag = (function(){
      var html = replace(currentNode.data, regex, replacementFormat),
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
}

function replace(rawText, regex, replacementFormat) {
  try {
    const matchedText = rawText.match(regex)[0];
    console.log(matchedText);
    const replacementText = new Date(matchedText).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' });
    return rawText.replace(regex, replacementText);
  } catch(e) {
    console.log('Couldn\'t convert a date');
    return rawText;
  }
}