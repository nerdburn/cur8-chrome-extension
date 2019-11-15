// chrome apis
var t = chrome.tabs;
var activeTab = false; // load on page load

// develop mode
var develop = false;
var hostname = (develop)? 'localhost:3000' : 'www.cur8.io';
var protocol = (develop)? 'http://' : 'https://';

var siteName = $('.site-name');
var saveBtn = $('.save-btn');
var searchInput = $('.srch-term');

//page elements
var addForm = $(".add-site"),
    saveAddBtn = $("#submitSave"),
    loginForm = $(".log-in"),
    emailIpt = $("#email"),
    passwordIpt = $("#password"),
    loginBtn = $("#loginBtn"),
    statusMsg = $("#status-display"),
    savedInfo = $(".save-success"),
    messageLabel = $(".message"),
    curDomain = "",
    curUrl = "",
    searchInput = $("#searchSites"),
    searchBtn = $("#searchIcon");

// search
searchInput.keypress(function(e) {
  if(e.keyCode === 13) {
    queryWord();
  }
});

function queryWord() {
  var query = searchInput.val().trim();
  if(query != '') {
    ajaxCall(
      protocol+hostname+'/api/search/' + localStorage.token, { terms: query }, 'POST', 'json', function(data) {
        if(data && data.search_url) {
          window.open(data.search_url);
        } else {
          if(data.message) {
            alert(data.message);
          } else {
            alert("something is wrong");
          }
        }
      },
      handleAjaxError
    );
  }
}

// on page load - get current tab
t.query({ currentWindow: true, active: true }, function(tabs) {
  activeTab = tabs[0];

  //localStorage.removeItem('token');

  // check if logged in
  if(localStorage.token) {

    // hide log in form if logged in
    loginForm.hide();
    console.log('is logged in');

    // show the add form
    showAddForm(activeTab);
  } else {

    // show login form
    addForm.hide();
    loginForm.show();
  }
});

saveAddBtn.click(addSite);
loginBtn.click(logIn);

function getDomain(url) {
  try {
    return (new URL(url)).hostname;
  } catch(e) {
    return null;
  }
}

// POST the data to the server using XMLhttpsRequest
function addSite() {
  var url = protocol+hostname+'/api/' + localStorage.token;
  var params = { url: curUrl, uid: localStorage.uid };
  ajaxCall(url, params, 'POST', 'json', function(data) {
    if(data && data.message == 'Saved!') {
      saveArrayInLocalStorage('savedSites', curDomain);
      siteName.text('This site is now saved!');
      saveBtn.hide();
    } else {
      siteName.text('Error saving...');
    }
  }, handleAjaxError);
}

// return false on form login
$('form.log-in').submit(function(){
  return false;
});

/*
// POST the data to the server using XMLhttpsRequest
function logIn() {
  var url = 'https://'+hostname+'/api/login';
  var params = getEmailAndPassword();
  console.log('params: ', params);
  var message = {
    body: "message body"
  }
  chrome.runtime.sendMessage(message);
}
*/


// POST the data to the server using XMLhttpsRequest
function logIn() {
  var url = protocol+hostname+'/api/login';
  var params = getEmailAndPassword();
  console.log('params: ', params);
  ajaxCall(url, params, 'POST', 'json', function(data) {
    console.log('data returned: ', data);
    if(data.loginToken) {
      console.log('token found: ', data.loginToken);
      localStorage.token = data.loginToken;
      localStorage.uid = data.userId;

      // show add form
      if(activeTab) {
        loginForm.hide();
        showAddForm(activeTab);
      } else {
        console.log('no active tab found');
      }
    }
  }, handleAjaxError);
}


function showSavedUrlMessageOrSaveButton(curDomain) {
  // check if current url is already saved
  if(isInLocalStorage('savedSites', curDomain)) {
    console.log('domain has been saved');
    siteName.text('This site has already been saved.');
    saveBtn.hide();
  } else {
    siteName.text(curDomain);
    saveBtn.show();
  }
}

function showAddForm(tab) {
  // check if current url is able to be saved
  if(validUrl(tab.url)) {
    curDomain = getDomain(tab.url);
    curUrl = tab.url;
    showSavedUrlMessageOrSaveButton(curDomain);
  } else {
    siteName.text('Invalid domain.');
    saveBtn.hide();
  }

  // show add form
  addForm.show();
  searchInput.focus();
}

function getEmailAndPassword() {
  var email = emailIpt.val().trim();
  var password = passwordIpt.val().trim();
  if(email == "" || password == "" && !validateEmail(email)) {
    console.log('Invalid credentials.');
  } else {
    return { email: email, password: password };
  }
}

function handleAjaxError(msg) {
  console.log(msg);
}
