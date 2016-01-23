'use strict';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let actions = {
    selectArea: () => {
      alert('puyopuyo');
    }
  }

  if (message.action in actions) {
    actions[message.action]();
  }

  return true;
});
