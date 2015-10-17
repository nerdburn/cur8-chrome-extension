//chrome apis
var t = chrome.tabs;

//page elaments
var addForm = $("#addsite"),
    saveAddBtn = $("#submitSave"),
    loginForm = $("#login"),
    emailIpt = $("#email"),
    passwordIpt = $("#password"),
    loginBtn = $("#loginBtn"),
    statusMsg = $("#status-display"),
    savedInfo = $("#saveSuccess"),
    messageLabel = $(".message"),
    curDomain = "",
    curUrl = "",
    searchInput = $("#searchSites"),
    searchBtn = $("#searchIcon");

searchInput.keypress(function (e) {
    if (e.keyCode === 13) {
        queryWord();
    }
});

searchBtn.click(function (e) {
    queryWord();
});
function queryWord() {
    var query = searchInput.val().trim();
    if (query != "") {
        ajaxCall(
            "http://cur8.io/api/search/" + localStorage.token,
            {terms: query},
            "POST",
            "json",
            function (data) {
                if (data && data.search_url) {
                    window.open(data.search_url);
                } else {
                    if (data.message) {
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

//get current tab
t.query({currentWindow: true, active: true}, function (tabs) {
    var tab = tabs[0];
    if (!validUrl(tab.url)) {
        statusMsg.text("you are not on a valid page");
    } else {
        curDomain = getDomain(tab.url);
        curUrl = tab.url;
        messageLabel.text(curDomain);
        //check if token stored
        if (localStorage.token) {
            if (isInLocalStorage("savedSites", curDomain)) {
                savedInfo.show().find("h2").text("Already Saved");
            } else {
                $(".header").hide();
                $(".siteName").text(curDomain);
                addForm.show();
            }

        } else {
            loginForm.show();
        }
    }
});

saveAddBtn.click(addSite);
loginBtn.click(logIn);


function getDomain(url) {
    try {
        return (new URL(url)).hostname;
    } catch (e) {
        return null;
    }
}

// POST the data to the server using XMLHttpRequest
function addSite() {
    statusMsg.text('Saving...');
    var url = 'http://cur8.io/api/' + localStorage.token;
    var params = {url: curUrl, uid: localStorage.uid};
    ajaxCall(url, params, "POST", "json", function (data) {
        if (data && data.message == "Saved!") {
            saveArrayInLocalStorage("savedSites", curDomain);
            statusMsg.hide();
            addForm.slideUp("fast");
            $("#saveSuccess").slideDown();
        } else {
            statusMsg.text("error, please try again later");
        }
    }, handleAjaxError);

}

// POST the data to the server using XMLHttpRequest
function logIn() {
    statusMsg.text("log in...");
    var url = 'http://cur8.io/api/login';
    var params = getEmailAndPassword();
    ajaxCall(url, params, "POST", "json", function (data) {
        if (data.loginToken) {
            console.log('token found: ', data.loginToken);
            localStorage.token = data.loginToken;
            localStorage.uid = data.userId;
            $('#login').hide();
            $('#addsite').show();
            statusMsg.text('');
        }
    }, handleAjaxError);
}

function getEmailAndPassword() {
    var email = emailIpt.val().trim(),
        password = passwordIpt.val().trim();
    if (email == "" || password == "" && !validateEmail(email)) {
        alert("input valid things");
    } else {
        return {email: email, password: password};
    }
}

function handleAjaxError(msg) {
    console.log(msg);
}


