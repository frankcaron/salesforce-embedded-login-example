function onLogin(identity) {
    //responseJSON = JSON.parse(identity);
    console.log("Identity = " + SFIDWidget.openid_response);
    console.log("Access Token = " + SFIDWidget.openid_response.access_token);
		
    var targetDiv = document.querySelector(SFIDWidget.config.target);	
    
    var avatar = document.createElement('a'); 
    avatar.href = "javascript:showIdentityOverlay();";

    var username = document.createElement('span'); 
    username.innerHTML = identity.username;
    username.className = "sfid-avatar-name";

    var img = document.createElement('img'); 
    img.src = identity.photos.thumbnail; 
    img.className = "sfid-avatar";

    var iddiv = document.createElement('div'); 
    iddiv.id = "sfid-identity";

    avatar.appendChild(username);
    avatar.appendChild(img);
    iddiv.appendChild(avatar);		

    targetDiv.innerHTML = '';
    targetDiv.appendChild(iddiv);	
}

function onLogout() {
    SFIDWidget.init();
}