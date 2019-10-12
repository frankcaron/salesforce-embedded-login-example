function onLogin(identity) {
    alert("logged in" + identity);
}

function onLogout() {
    SFIDWidget.init();
}

//* Get value from local storage *//
var identity = localStorage.getItem('identity');
if (identity != null) {
    document.write("Identity is " + identity);
}
