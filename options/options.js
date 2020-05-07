const generateOutputDate = (format) => {
  return new Date().toLocaleDateString('en-US', {
    year: format.year ? 'numeric' : undefined,
    month: format.month ? 'short' : undefined,
    day: format.day ? '2-digit' : undefined,
    hour: format.hour ? '2-digit' : undefined,
    minute: format.minute ? '2-digit' : undefined,
    second: format.second ? '2-digit' : undefined,
    hour12: !format.hour24,
    timeZone: format.utc ? 'utc' : Intl.DateTimeFormat().resolvedOptions().timeZone ,
  });
};

const updateOutput = (format) => {
  const outputDate = generateOutputDate(format);
  document.querySelector('#outputFormat').innerHTML = format.highlight ? `<mark>${outputDate}</mark>` : outputDate;
};

(function(){
  let regexList, outputFormat;
  chrome.storage.local.get(storeData => {
    regexList = storeData.regexList || {};
    outputFormat = storeData.outputFormat || {};
    if(regexList && Object.keys(regexList).length) {
      Object.keys(regexList).forEach(regEx => {
        regexList[regEx] && document.querySelector(`input[type="checkbox"][name="${regEx}"]`).setAttribute('checked', true);
      }); 
    }
    if(outputFormat && Object.keys(outputFormat).length) {
      Object.keys(outputFormat).forEach(outputKey => {
        if (outputFormat[outputKey]) {
          document.querySelector(`input[type="checkbox"][name="${outputKey}"]`).setAttribute('checked', true);
          document.querySelector(`label[for=${outputKey}]`).classList.add('active');
        }
      });
      updateOutput(outputFormat);
    }
  });

  var checkboxes = document.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('click', function(e) {
      const targetName = e.target.name;
      if(/type/.test(targetName)) {
        regexList[targetName] = e.target.checked;
      } else {
        outputFormat[targetName] = e.target.checked;
      }
      chrome.storage.local.set({ regexList, outputFormat }, () => {
        updateOutput(outputFormat);
        e.target.checked ? document.querySelector(`label[for=${targetName}]`).classList.add('active') : document.querySelector(`label[for=${targetName}]`).classList.remove('active');
      });
    });
  });
})();
