console.log('background script...');

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    console.log('in background', request);
    console.log('message', request.body)

    if (request.contentScriptQuery == "login") {
      ajaxCall(request.url, request.params, request.requestType, request.contentType, function(data) {
        console.log('data returned: ', data);
        if(data.loginToken) {
          return data;
        }
      });
    }
  }
);