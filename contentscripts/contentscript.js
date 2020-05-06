chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  console.log("Hello", msg);
  if (msg.action == 'replaceDate') {
    findAndReplace('[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(.[0-9]{3})Z', '', document.body);
  }
});

function findAndReplace(searchText, replacementFormat, searchNode) {
  /** This function was derived from https://j11y.io/javascript/find-and-replace-text-with-javascript/ */
  if (!searchText || typeof replacementFormat === 'undefined') {
    // Throw error here if you want...
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