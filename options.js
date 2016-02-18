'use strict'

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get({
    options: [
      {
        targetURI: '',
        titleSelector: '',
        bodySelectors: ''
      },
      {
        targetURI: '',
        titleSelector: '',
        bodySelectors: ''
      }
    ]
  }, (items) => {
    let docflag = document.createDocumentFragment();

    items.options.forEach((option, index) => {
      let section = document.createElement('section');
      docflag.appendChild(section);

      let targetURILabel = document.createElement('label');
      section.appendChild(targetURILabel);
      targetURILabel.textContent = chrome.i18n.getMessage('targetURI') + (index + 1);

      let targetURI = document.createElement('input');
      targetURILabel.appendChild(targetURI);
      targetURI.className = 'targetURI';
      targetURI.value = option.targetURI;

      let titleLabel = document.createElement('label');
      section.appendChild(titleLabel);
      titleLabel.textContent = chrome.i18n.getMessage('title') + (index + 1);

      let title = document.createElement('input');
      titleLabel.appendChild(title);
      title.className = 'title';
      title.value = option.titleSelector;

      let bodyLabel = document.createElement('label');
      section.appendChild(bodyLabel);
      bodyLabel.textContent = chrome.i18n.getMessage('body') + (index + 1);

      let body = document.createElement('input');
      bodyLabel.appendChild(body);
      body.className = 'body';
      body.value = option.bodySelectors;
    });

    document.body.appendChild(docflag);
  })
});


document.getElementById('save').addEventListener('click', () => {
  let options = siftOptions();

  chrome.storage.sync.set({
    options: options
  }, () => {
    console.log('saved');
  });
});

const siftOptions = () => {
  let options = [];
  let titles = document.getElementsByClassName('title');
  let bodys = document.getElementsByClassName('body');
  let targets = document.getElementsByClassName('targetURI');

  for (let i = 0, l = targets.length; i < l; i++) {
    let targetURI = targets[i];

    if (!targetURI.value) {
      continue;
    }

    let option = {};

    option.targetURI = targetURI.value;
    option.titleSelector = titles[i].value;
    option.bodySelectors = bodys[i].value;

    options.push(option);
  }

  return options;
}
