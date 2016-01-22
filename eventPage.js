function disableButton(tabId) {
  // TODO setIcon
  chrome.browserAction.disable(tabId);
}

function enableButton(tabId) {
  // TODO setIcon
  chrome.browserAction.enable(tabId);
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.status === 'loading'
        || !tab.url.match(/^https?:/)) {
      return disableButton(tab.id);
    }

    enableButton(tab.id);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    return disableButton(tabId);
  }

  if (changeInfo.status === 'complete') {
    if (!tab.url.match(/^https?:/)) {
      return;
    }

    enableButton(tab.id);
  }
});

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, 'myAction', (response) => {
    chrome.runtime.lastError && window.confirm(chrome.i18n.getMessage('confirmReload')) && chrome.tabs.reload(tab.id);
  });
});
