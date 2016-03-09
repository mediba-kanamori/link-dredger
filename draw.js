'use strict';

chrome.storage.sync.get((items) => {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message);
  }

  Promise.all(items.selection.links.map((link) => {
    return http(link.url).get();
  }))
  .then((responses) => {
    let docflag = document.createDocumentFragment();

    for (let response of responses) {
      for (let option of items.options) {
        let targetURI = new RegExp(option.targetURI);

        if (!response.documentURI.match(targetURI)) {
          continue;
        }

        generate(sift(response, option), docflag);
      }
    }

    document.body.appendChild(docflag);
  })
  .catch((error) => {
    console.log(error);
  });
});

//chrome.runtime.sendMessage({
//  action: 'getSelection'
//}, (selection) => {
//  if (chrome.runtime.lastError) {
//    console.log(chrome.runtime.lastError.message);
//  }
//
//  draw(data);
//});

const generate = (link, parent) => {
  let section = document.createElement('section');
  parent.appendChild(section);

  let h1 = document.createElement('h1');
  section.appendChild(h1);
  h1.textContent = link.title;

  for (let text of link.body) {
    let p = document.createElement('p');
    section.appendChild(p);
    p.textContent = text;
  }
};

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
};

const sift = (target, option) => {
  let data = {};
  data.body = [];

  if (option.titleSelector) {
    data.title = target.querySelector(option.titleSelector).innerText;

    console.log(data.title);
  }

  option.bodySelectors.split(',').forEach((selector) => {
    let text = target.querySelector(selector).innerText;
    data.body.push(text);

    console.log(text);
  });

  return data;
};
