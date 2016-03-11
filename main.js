'use strict'

const disableButton = (tabId) => {
  // TODO setIcon
  chrome.browserAction.disable(tabId);
}

const enableButton = (tabId) => {
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

  if (changeInfo.status !== 'complete'
      || !tab.url.match(/^https?:/)) {
    return;
  }

  chrome.tabs.executeScript(tabId, {
    file: './content.js'
  }, () => {
    enableButton(tab.id);
  });
});

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {
    action: 'selectArea'
  }, (selection) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
      return window.confirm(chrome.i18n.getMessage('confirmReload')) && chrome.tabs.reload(tab.id);
    }

    chrome.storage.sync.set({
      selection: selection
    }, () => {
      chrome.tabs.create({
        url: 'dredged.html'
      });
    });
  });
});
