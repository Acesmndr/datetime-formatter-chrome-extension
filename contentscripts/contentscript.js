chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  const { action, payload } = msg;
  switch(action) {
    case 'replaceDate':
      payload.applicableRegex.forEach(regEx => {
        findAndReplace(regEx, payload.dateFormat, payload.highlight, document.body);
      });
  }
});


function findAndReplace(searchText, replacementFormat, highlight, searchNode) {
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
}

function replace(rawText, regex, highlight, replacementFormat) {
  try {
    const matchedText = rawText.match(regex)[0];
    const replacementText = new Date(isNaN(Number(matchedText)) ? matchedText : Number(matchedText)).toLocaleTimeString('en-US', replacementFormat);
    return rawText.replace(regex, highlight ? `<mark>${replacementText}</mark>` : replacementText);
  } catch(e) {
    console.log('Couldn\'t convert a date');
    return rawText;
  }
}