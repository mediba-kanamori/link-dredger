'use strict';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let actions = {
    draw: () => {
      let docflag = document.createDocumentFragment();
      for (let link of message.data) {
        let section = document.createElement('section');
        docflag.appendChild(section);

        let h1 = document.createElement('h1');
        section.appendChild(h1);
        h1.textContent = link.title;

        for (let text of link.body) {
          let p = document.createElement('p');
          section.appendChild(p);
          p.textContent = text;
        }
      }

      document.body.appendChild(docflag);
    }
  };

  if (message.action in actions) {
    actions[message.action]();
  }

  return true;
});
