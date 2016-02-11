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
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
      window.confirm(chrome.i18n.getMessage('confirmReload')) && chrome.tabs.reload(tab.id);
    }
  });
});

let options = [
  {
    targetURI: /https:\/\/7andinm.s.cybozu.com\/o\/ag.cgi\?page=ReportView/,
    titleSelector: '.vr_viewTitleSub b',
    bodySelectors: [
      '#reportText74'
    ]
  }
];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let actions = {
    dredgeWithSize: () => {
      console.log(message.data);

      Promise.all(message.data.links.map((link) => {
        return http(link.url).get();
      }))
      .then((results) => {
        for (let result of results) {
          sift(result, options);
        }
      })
      .catch((error) => {
        console.log(error);
      });

      chrome.tabs.create({
      });
    }
  }

  if (message.action in actions) {
    actions[message.action]();
    return true;
  }
});

const sift = (document, options) => {
  for (let option of options) {
    if (!document.documentURI.match(option.targetURI)) {
      continue;
    }

    if (option.titleSelector) {
      console.log(document.querySelector(option.titleSelector).innerText);
    }

    for (let selector of option.bodySelectors) {
      console.log(document.querySelector(selector).innerText);
    }
  }
}

const http = (url) => {
  let ajax = (method, url, args) => {
    return new Promise((resolve, reject) => {
      let client = new XMLHttpRequest();

      client.open(method, url);
      client.responseType = 'document';
      client.send();

      client.onload = () => {
        if (200 <= client.status && client.status < 300) {
          return resolve(client.responseXML);
        }

        reject(client.statusText);
      }

      client.onerror = () => {
        reject(client.statusText);
      }
    });
  };

  return {
    get: (args) => {
      return ajax('GET', url, args);
    }
  };
}
