/**
 * Created by hank on 6/1/2015.
 */

// make ajax call, in chrome, is same as jquery ajax
function ajaxCall(url, data, type, dataType, successCallback, errorCallback) {
/*
  var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
  xmlhttp.open(type, url);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.addEventListener("loadend", successCallback);
  xmlhttp.addEventListener("error", errorCallback);
  xmlhttp.send(JSON.stringify(data));
*/
  $.ajax({
    url: url,
    data: data,
    type: type,
    dataType: dataType,
    success: successCallback,
    error: errorCallback
  });
}

// validate email
function validateEmail(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
}

// validate URL
function validUrl(url){
  return  /^(http|https):\/\/[^ "]+$/.test(url);
}

// save to local storage
function saveArrayInLocalStorage(dbName, item) {
  var db = getArrayFromLocalStorage(dbName);
  if(db.indexOf(item) === -1) {
    db.push(item);
  }
  localStorage[dbName] = JSON.stringify(db);
}

// get from local storage
function getArrayFromLocalStorage(dbName) {
  var db = localStorage[dbName];
  if(db) {
    return JSON.parse(db);
  } else {
    return [];
  }
}

// check for item in local storage
function isInLocalStorage(dbName, item) {
  var db = getArrayFromLocalStorage(dbName);
  return db.indexOf(item) !== -1;
}