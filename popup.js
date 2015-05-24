// This callback function is called when the content script has been 
// injected and returned its results
function onPageDetailsReceived(pageDetails)  { 
  document.getElementById('url').value = pageDetails.url; 
} 

// Global reference to the status display SPAN
var statusDisplay = null;

// POST the data to the server using XMLHttpRequest
function addSite() {
    // cancel the form submit
    event.preventDefault();
    
    var status = $('#status-display');
    status.html('Saving...');
    
    chrome.storage.sync.get('token', function(obj){
      console.log('in token: ', obj.token);
      
      if(!obj.token) {
        status.html('No token found.');
      }

      var api = 'http://cur8.io/api/' + obj.token;
      console.log('api url: ', api);
      var params = { url: $('#url').val() };
      console.log('params: ', params);

      console.log('posting...');
      $.post(api, params, function(data) {
        console.log('posted.');
        console.log('data from post: ', data);
        status.html(data.message);
      });
      
    });
}

// POST the data to the server using XMLHttpRequest
function logIn() {
    // cancel the form submit
    event.preventDefault();
    
    var status = $('#login-status-display');
    var url = 'http://cur8.io/api/login';
    var params = { email: $('#email').val(), password: $('#password').val() };

    $.post(url, params, function(data) {
      
      var data = $.parseJSON(data);
      console.log('data returned: ', data);
      console.log('data token', data.loginToken);
      
      if(data.loginToken) {
        console.log('token found: ', data.loginToken)
        chrome.storage.sync.set({ 'token': data.loginToken }, function() {
          //message('Token saved.');
          status.html(data);
          $('#login').hide();
          $('#addsite').show();          
        });
      }
          
    });

    status.html('Logging in...');
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
  
  $('#login, #addsite').hide();
  chrome.storage.sync.get('token', function(obj) {
    console.log('on load, is there a token? ', obj.token);
    if(!obj.token) {
      document.getElementById('login').addEventListener('submit', logIn);      
      $('#login').show()
    } else {
      // Handle the bookmark form submit event with our addBookmark function
      document.getElementById('addsite').addEventListener('submit', addSite);
      $('#addsite').show();
    }
    
  });
    
  // Get the event page
  chrome.runtime.getBackgroundPage(function(eventPage) {
    // Call the getPageInfo function in the event page, passing in 
    // our onPageDetailsReceived function as the callback. This injects 
    // content.js into the current tab's HTML
    eventPage.getPageDetails(onPageDetailsReceived);
  });
});