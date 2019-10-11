function onLogin(identity) {
    var targetDiv = document.querySelector(SFIDWidget.config.target);
    var avatar = document.createElement('a');
        avatar.href = "javascript:showIdentityOverlay();";
    var img = document.createElement('img');
        img.src = identity.photos.thumbnail;
    img.className = "sfid-avatar";

    var logout = document.getElementById("logoutItem");
    logout.style.visibility = "visible";

    var username = document.createElement('span');
    username.innerHTML = identity.username;
    username.className = "sfid-avatar-name";
    var iddiv = document.createElement('div');
        iddiv.id = "sfid-identity";
        avatar.appendChild(img);
        avatar.appendChild(username);
        iddiv.appendChild(avatar);
        targetDiv.innerHTML = '';
        targetDiv.appendChild(iddiv);
    }

    function showIdentityOverlay() {

    var lightbox = document.createElement('div'); 
    lightbox.className = "sfid-lightbox";
    lightbox.id = "sfid-login-overlay";
    lightbox.setAttribute("onClick", "SFIDWidget.cancel();");
    var wrapper = document.createElement('div'); 
    wrapper.id = "identity-wrapper";
    wrapper.onclick = function(event) {
        event = event || window.event // cross-browser event
        if (event.stopPropagation) {
            // W3C standard variant
            event.stopPropagation()
        } else {
            // IE variant
            event.cancelBubble = true
        }
    }
    var content = document.createElement('div'); 
    content.id = "sfid-content";
    var community = document.createElement('a');
    var commURL = document.querySelector('meta[name="salesforce-community"]').content;
    community.href = commURL;
    community.innerHTML = "Go to the Community";
    community.setAttribute("style", "float:left");
    content.appendChild(community);

    var t = document.createElement('div'); 
    t.id = "sfid-token";
    t.className = "sfid-mb24";
    var p = document.createElement('pre'); 
    p.innerHTML = JSON.stringify(SFIDWidget.openid_response, undefined, 2);
    t.appendChild(p);
    content.appendChild(t);
    wrapper.appendChild(content);
    lightbox.appendChild(wrapper);
    document.body.appendChild(lightbox);	

}
	
	
function onLogout() {
        //SFIDWidget.init();
    var logout = document.getElementById("logoutItem");
            logout.style.display = "none";
    location.reload();


}