'use strict';

// Symbol.iteratorが実装されていないためのpolyfill
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

const ESC_KEY_CODE = 27;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let actions = {
    selectArea: () => {
      let startX, startY, data = {};
      let tempUserSelect = document.body.style.webkitUserSelect;

      // TODO このへんClassに切り出す
      let layer = document.createElement('div');
      layer.style.position = 'absolute'
      layer.style.left = document.body.clientLeft + 'px';
      layer.style.top = document.body.clientTop + 'px';
      layer.style.width = Math.max(document.body.clientWidth, document.body.offsetWidth, document.body.scrollWidth) + 'px';
      layer.style.height = Math.max(document.body.clientHeight, document.body.offsetHeight, document.body.scrollHeight) + 'px';
      layer.style.zIndex = 2147483646; // Maximum number of 32bit Int - 1
      layer.style.cursor = 'crosshair';
      layer.className = 'dredge-select-layer';

      document.body.style.webkitUserSelect = 'none';

      let selectionElement = document.createElement('div');
      layer.appendChild(selectionElement);
      document.body.appendChild(layer);

      selectionElement.updateStyle = (styles) => {
        Object.keys(styles).forEach((key) => {
          selectionElement.style[key] = styles[key];
        });
      };

      selectionElement.updateStyle({
        background: 'rgba(92, 92, 92, 0.3)',
        position: 'absolute'
      });

      let cancelDredge = () => {
        document.body.removeChild(layer);
        document.body.style.webkitUserSelect = tempUserSelect;
        document.removeEventListener('keydown', keydownHandler);
        window.removeEventListener('contextmenu', cancelDredge);
      }

      let keydownHandler = (event) => {
        debugger; //@ sourceURL=content.js
        if (event.keyCode === ESC_KEY_CODE) {
          cancelDredge();
        }
      }

      let mousedownHandler = (event) => {
        startX = event.pageX;
        startY = event.pageY;

        selectionElement.updateStyle({
          border: '1px solid rgba(255, 255, 255, 0.8)',
          left: startX + 'px',
          top: startY + 'px'
        });

        layer.removeEventListener('mousedown', mousedownHandler);
        layer.addEventListener('mousemove', mousemoveHandler);
        layer.addEventListener('mouseup', mouseupHandler);
      }

      let mousemoveHandler = (event) => {
        selectionElement.updateStyle({
          width: Math.abs(event.pageX - startX) - 1 + 'px',
          height: Math.abs(event.pageY - startY) - 1 + 'px',
          left: Math.min(event.pageX, startX) + 'px',
          top: Math.min(event.pageY, startY) + 'px'
        });
      }

      let mouseupHandler = (e) => {
        document.body.style.webkitUserSelect = tempUserSelect;
        document.removeEventListener('keydown', keydownHandler);
        window.addEventListener('contextmenu', (event) => {
          cancelDredge();
          event.preventDefault();
        });

        let rectangle = selectionElement.getBoundingClientRect();
        data.width = rectangle.width;
        data.height = rectangle.height;
        data.x = rectangle.left + window.scrollX;
        data.y = rectangle.top + window.scrollY;

        let anchors = document.getElementsByTagName('a');
        data.links = [];

        for (let anchor of anchors) {
          let link = {};
          link.url = anchor.href;
          link.title = anchor.title;
          link.text = anchor.textContent;

          data.links.push(link);
        }

        document.body.removeChild(layer);

        let finish = () => {
          chrome.runtime.sendMessage(chrome.runtime.id, {
            action: 'dredgeWithSize',
            data: data
          });
        }

        window.requestAnimationFrame(finish);
      }

      layer.addEventListener('mousedown', mousedownHandler);
      document.addEventListener('keydown', keydownHandler);
      window.addEventListener('contextmenu', cancelDredge);
    }
  }

  if (message.action in actions) {
    actions[message.action]();
  }

  return true;
});
