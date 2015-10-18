// chrome apis
var t = chrome.tabs;

// develop mode
var develop = true;
var hostname = (develop)? 'localhost:3000' : 'cur8.io';

var siteName = $('.site-name');
var saveBtn = $('.save-btn');
var searchInput = $('.srch-term');

//p age elaments
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
      'http://'+hostname+'/api/search/' + localStorage.token, { terms: query }, 'POST', 'json', function(data) {
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
  var tab = tabs[0];
  if(!validUrl(tab.url)) {
    console.log('This page cannot be saved.');
  } else {
    curDomain = getDomain(tab.url);
    curUrl = tab.url;
    
    //localStorage.removeItem('token');
    
    // check if logged in
    if(localStorage.token) {
      
      // hide log in form if logged in
      loginForm.hide();
      console.log('is logged in');
      
      // check if current url is already saved
      if(isInLocalStorage('savedSites', curDomain)) {
        console.log('domain has been saved');
        siteName.text('Site ' + curDomain + ' is already saved.');
        saveBtn.hide();
      } else {
        siteName.text(curDomain);
        saveBtn.show();
      }
      
      addForm.show();
      searchInput.focus();
    } else {
      addForm.hide();
      loginForm.show();
    }
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

// POST the data to the server using XMLHttpRequest
function addSite() {
  var url = 'http://'+hostname+'/api/' + localStorage.token;
  var params = { url: curUrl, uid: localStorage.uid };
  ajaxCall(url, params, 'POST', 'json', function(data) {
    if(data && data.message == 'Saved!') {
      saveArrayInLocalStorage('savedSites', curDomain);
      siteName.text('Site ' + curDomain + ' saved!');
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

// POST the data to the server using XMLHttpRequest
function logIn() {
  var url = 'http://'+hostname+'/api/login';
  var params = getEmailAndPassword();
  console.log('params: ', params);
  ajaxCall(url, params, 'POST', 'json', function(data) {
    console.log('data returned: ', data);
    if(data.loginToken) {
      console.log('token found: ', data.loginToken);
      localStorage.token = data.loginToken;
      localStorage.uid = data.userId;
      loginForm.hide();
      addForm.show();
    }
  }, handleAjaxError);
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