'use strict';

chrome.runtime.sendMessage({
  action: 'getStorageData'
}, (data) => {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message);
  }

  draw(data);
});

const draw = (data) => {
  let docflag = document.createDocumentFragment();

  for (let link of data) {
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
