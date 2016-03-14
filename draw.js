'use strict';

chrome.storage.sync.get((items) => {
  if (chrome.runtime.lastError) {
    return console.log(chrome.runtime.lastError.message);
  }

  Promise.all(items.selection.links.map((link) => {
    return http(link).get();
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

const generate = (link, parent) => {
  let section = document.createElement('section');
  parent.appendChild(section);

  let h1 = document.createElement('h1');
  section.appendChild(h1);
  h1.textContent = link.title;

  let footer = document.createElement('footer');
  section.appendChild(footer);

  let via = document.createElement('p');
  footer.appendChild(via);
  via.textContent = 'via';

  let a = document.createElement('a');
  via.appendChild(a);
  a.href = link.via.url;
  a.textContent = link.via.title;

  for (let text of link.body) {
    let p = document.createElement('p');
    section.appendChild(p);
    p.textContent = text;
  }
};

const http = (link) => {
  let ajax = (method, link, args) => {
    return new Promise((resolve, reject) => {
      let client = new XMLHttpRequest();

      client.open(method, link.url);
      client.responseType = 'document';
      client.send();

      client.onload = () => {
        if (200 <= client.status && client.status < 300) {
          let response = client.responseXML;
          response.via = link;
          return resolve(response);
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
      return ajax('GET', link, args);
    }
  };
};

const sift = (response, option) => {
  let target = response.body;
  let via = response.via;
  let data = {};

  data.via = {};
  data.via.title = via.title || via.text;
  data.via.url = via.url;

  if (option.titleSelector) {
    data.title = target.querySelector(option.titleSelector).innerText;

    console.log(data.title);
  }

  data.body = [];
  option.bodySelectors.split(',').forEach((selector) => {
    let text = target.querySelector(selector).innerText;
    data.body.push(text);

    console.log(text);
  });

  return data;
};
