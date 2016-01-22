chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request == 'myAction') {
    hogehoge();
  }
});

function hogehoge() {
  alert('puyopuyo');
}
