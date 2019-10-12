function onLogin(identity) {
    alert("logged in" + identity);
}

function onLogout() {
    SFIDWidget.init();
}

//* Get value from local storage *//
var identity = localStorage.getItem(localStorage.key(1));
if (identity != null) {
    document.write("Identity is " + identity);
} else {
    document.write("Looks like the localStorage is empty because there's nothing at " + localStorage.key(0));
}
