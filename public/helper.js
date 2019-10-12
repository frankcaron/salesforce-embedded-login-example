function onLogin(identity) {
    //responseJSON = JSON.parse(identity);
    console.log("Identity = " + identity);
}

function onLogout() {
    SFIDWidget.init();
}