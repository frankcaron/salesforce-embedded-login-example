/*
    Copyright  Salesforce.com 2015
    Copyright 2010 Meebo Inc.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

var SFIDWidget_loginHandler;
var SFIDWidget_logoutHandler;

var SFIDWidget = function() {

    this.config = null;
    this.access_token = null;
    this.openid = null;
    this.openid_response = null;

    // Reference shortcut so minifier can save on characters
    this.win = window;

    // Check for browser capabilities
    this.unsupported = !(this.win.postMessage && storageAvailable('localStorage') && this.win.JSON);

    this.XAuthServerUrl = null;
    this.iframe = null;
    this.postWindow = null;

    // Requests are done asynchronously so we add numeric ids to each
    // postMessage request object. References to the request objects
    // are stored in the openRequests object keyed by the request id.
    this.openRequests = {};
    this.requestId = 0; 

    // All requests made before the iframe is ready are queued (referenced by
    // request id) in the requestQueue array and then called in order after
    // the iframe has messaged to us that it's ready for communication
    this.requestQueue = [];
    
    // Cleaner way to determine if local storage is available
    function storageAvailable(type) {
    	try {
    		var storage = window[type],
    		    x = '__storage_test__';
    		storage.setItem(x,x);
    		storage.removeItem(x);
    		return true;
    	}catch(e){
    		return e instanceof DOMException && (
    	            // everything except Firefox
    	            e.code === 22 ||
    	            // Firefox
    	            e.code === 1014 ||
    	            // test name field too, because code might not be present
    	            // everything except Firefox
    	            e.name === 'QuotaExceededError' ||
    	            // Firefox
    	            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
    	            // acknowledge QuotaExceededError only if there's something already stored
    	            storage.length !== 0;
    	}
    }
    
    // Helper method to add button to launch the login widget.
    function addButton(targetDiv) {
        targetDiv.innerHTML = '';
        var button = document.createElement("button"); 
        button.id = "sfid-login-button";
        button.className = "sfid-button";
        button.innerHTML = "Log in";
        button.setAttribute("onClick", "SFIDWidget.login()");

        if(SFIDWidget.config.useCommunityPrimaryColor) {
        	button.style.backgroundColor = SFIDWidget.authconfig.LoginPage.PrimaryColor;
        }

        targetDiv.appendChild(button);
    }

    function addExpIdToUrl(url) {
    	 if(SFIDWidget.config.expid) {
    		if(url.indexOf("?") === -1) {
         	    url += "?expid=" + encodeURIComponent(SFIDWidget.config.expid);
    		} else {
    			url += "&expid=" + encodeURIComponent(SFIDWidget.config.expid);
    		}
         }
    	 return url;
    }

    function addLocaleToUrl(url) {
         if(SFIDWidget.config.locale) {
            if(url.indexOf("?") === -1) {
                url += "?locale=" + SFIDWidget.config.locale;
            } else {
                url += "&locale=" + SFIDWidget.config.locale;
            }
         }
         return url;
    }
    
    function getQueryParameterByName(name) {
    	  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    	  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    	      results = regex.exec(location.search);
    	  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
    	}
    
    function addStartURLToUrl(url) {
        //Kick off useragent flow to grab them a token and log into the widget automatically

        /* 
            This following section has been overridden based on coaching from Chuck Mortimore of Frank Caron,
            who is a Platform Solution Engineer at Salesforce. This is a bug in the existing production JS
            which is generally referenced directly from the platform instead of self-hosted.
            
            This bug should be fixed in the production JS before you use this example. For more details, refer
            to the readme and to the SalesforceIdentity Github account.

            Dated October 14, 2019

        */

        var startURLToUse = "/services/oauth2/authorize?response_type=code&client_id="+SFIDWidget.config.client_id+"&redirect_uri="+encodeURIComponent(SFIDWidget.config.redirect_uri)+"&state="+encodeURIComponent(window.location);    
        
        /* =========== */
        
        if(SFIDWidget.config.addStartUrlToSelfReg === "true") {
   	 		if(url.indexOf("?") === -1) {
        	    url += "?startURL=" + encodeURIComponent(startURLToUse);
	    	} else {
	    		url += "&startURL=" + encodeURIComponent(startURLToUse);
    		}
        }
   	 	return url;
   }

    function addLogin(targetDiv) {

        if (targetDiv != null) targetDiv.innerHTML = '';

        var content = document.createElement('div'); 
        if (SFIDWidget.config.mode === 'modal') {
        	content.id = "sfid-content";
        }
        else if (SFIDWidget.config.mode === 'inline') content.id = "sfid-inline-content";

        if(SFIDWidget.config.useCommunityBackgroundColor) {
        	content.style.backgroundColor = SFIDWidget.authconfig.LoginPage.BackgroundColor;
        }

        if (SFIDWidget.config.mode === 'modal')  {
            if (SFIDWidget.authconfig.LoginPage.LogoUrl != null ) {
                var logowrapper = document.createElement('div'); 
                logowrapper.id = "sfid-logo_wrapper";
                logowrapper.className = "sfid-standard_logo_wrapper sfid-mt12";

                var img = document.createElement('img'); 
                img.src = SFIDWidget.authconfig.LoginPage.LogoUrl; 
                img.className = "sfid-standard_logo";
                img.alt = "Salesforce";

                logowrapper.appendChild(img);
                var dialogTitle = document.createElement('h2');
                dialogTitle.id = "dialogTitle";
                var textNode = document.createTextNode("Salesforce Login");
                dialogTitle.appendChild(textNode);
                content.setAttribute("role", "dialog");
                content.setAttribute("aria-labelledby", dialogTitle.id);
                content.tabIndex = "-1";
                content.addEventListener("keydown", function(event) {
                	if (event.keyCode === 27) { // Escape Key Trap
                	    SFIDWidget.cancel();
                    }
                }, true);
                content.appendChild(logowrapper);
             }
        }

        var error = document.createElement('div'); 
        error.className = "sfid-mb1";
        error.id = "sfid-error";
        error.innerHTML = "We can\'t log you in. Make sure your username and password are correct.";
        error.style.display = "none";
        error.setAttribute("role", "alert");
        content.appendChild(error);
        if (SFIDWidget.authconfig.LoginPage.UsernamePasswordEnabled) {
            var form = document.createElement('form'); 
            form.setAttribute("onSubmit", "SFIDWidget.authenticate();return false;");
            var un = document.createElement('input'); 
            un.className = "sfid-wide sfid-mb12";
            un.type = "text";
            un.name = "username";
            un.id = "sfid-username";
            un.setAttribute("autofocus", "autofocus");
            
            var labelEmail = document.createElement("LABEL");
            labelEmail.htmlFor = un.id;
            labelEmail.className = "sfid-button-label";
            labelEmail.innerText = "Username";

            var pw = document.createElement('input'); 
            pw.className = "sfid-wide sfid-mb12";
            pw.type = "password";
            pw.name = "password";
            pw.id = "sfid-password";

            var labelPw = document.createElement("LABEL");
            labelPw.innerText = "Password";
            labelPw.htmlFor = pw.id; 
            labelPw.className = "sfid-button-label";

            var button = document.createElement("input"); 
            button.className = "sfid-button sfid-wide sfid-mb16";
            button.type = "submit";
            button.id = "sfid-submit";
            button.value = "Log In";

            if(SFIDWidget.config.useCommunityPrimaryColor) {
            	button.style.backgroundColor = SFIDWidget.authconfig.LoginPage.PrimaryColor;
            }

            form.appendChild(labelEmail);
            form.appendChild(un);
            form.appendChild(labelPw);
            form.appendChild(pw);
            form.appendChild(button);

            content.appendChild(form);
        }

        //  Adding 'forgot password' and 'self registration' to this div
        var divForgotPswdSelfReg = document.createElement("div");
        divForgotPswdSelfReg.id = 'sfid-selfreg-password';

        // Add forgot password is meta tag present and true
        if(SFIDWidget.config.forgotPasswordEnabled === "true") {
            var fp = document.createElement('a');
            fp.id = 'sfid-forgot-password';
            var fpUrl = addExpIdToUrl(addLocaleToUrl(SFIDWidget.authconfig.LoginPage.ForgotPasswordUrl));
            fp.href = decodeURIComponent(fpUrl);
            fp.text = "Forgot your password?";
            divForgotPswdSelfReg.appendChild(fp);
        }

        // Add self reg is communities pref is enabled and meta tag present and true
        if(SFIDWidget.authconfig.LoginPage.SelfRegistrationEnabled && (SFIDWidget.config.selfRegistrationEnabled === "true")) {
            var sr = document.createElement('a');
            sr.id = 'sfid-self-registration';
            var urlCheck = addExpIdToUrl(addLocaleToUrl(SFIDWidget.authconfig.LoginPage.SelfRegistrationUrl));
            sr.href = addStartURLToUrl(urlCheck);
            sr.text = "Not a member?";
            divForgotPswdSelfReg.appendChild(sr);
        }

        if( divForgotPswdSelfReg.children.length > 0) {
            content.appendChild(divForgotPswdSelfReg);
        }

        var isUsernamePassEnabled = SFIDWidget.authconfig.LoginPage.UsernamePasswordEnabled;
        var numOfAuthProv = SFIDWidget.authconfig.AuthProviders.length;
        var numOfSamlProv = SFIDWidget.authconfig.SamlProviders.length;

        if ((isUsernamePassEnabled) && ((numOfAuthProv > 0) || (numOfSamlProv > 0))) {

        	var orloginwithspace = document.createElement("br");
            var orloginwith = document.createElement("p"); 
            orloginwith.className = "sfid-small";
            orloginwith.innerHTML = "or log in using";
            content.appendChild(orloginwithspace);
            content.appendChild(orloginwith);

        } else if ((!isUsernamePassEnabled) && ((numOfAuthProv > 0) || (numOfSamlProv > 0))) {

            var orloginwith = document.createElement("p"); 
            orloginwith.className = "sfid-small sfid-mb16";
            orloginwith.innerHTML = "Choose an authentication provider.";
            content.appendChild(orloginwith);
        }

        if (SFIDWidget.authconfig.AuthProviders.length > 0) {

            var social = document.createElement('div');
            social.id = "sfid-social";

            var socialul = document.createElement('ul');

            for (var i = 0; i < SFIDWidget.authconfig.AuthProviders.length; i++) {

                var socialli = document.createElement('li');

			    var iconUrl = SFIDWidget.authconfig.AuthProviders[i].IconUrl;
                var hrefUrl = SFIDWidget.authconfig.AuthProviders[i].SsoUrl;
                if(hrefUrl.indexOf("?") === -1) {
                    hrefUrl += '?startURL=' + encodeURIComponent(SFIDWidget.config.authorizeURL);
                } else {
                    hrefUrl += '&startURL=' + encodeURIComponent(SFIDWidget.config.authorizeURL);
                }
                
                var authProvName = SFIDWidget.authconfig.AuthProviders[i].Name;
                
                socialli.className = "sfid-button-ap";
                socialli.id = "sfid-button-ap-" + authProvName;
                
                if ( iconUrl != null)
                {
                    var icon = document.createElement('img'); 
                    icon.className = "sfid-social-buttonimg";
                    icon.src = iconUrl;
                    icon.alt = "Login with "+ authProvName;
                    
                    var a = document.createElement('a');
                    a.href = hrefUrl;
                    a.appendChild(icon);
                    a.title = authProvName;
                    socialli.appendChild(a);
                }
                else 
                {
                	var button = document.createElement('button');
                    button.setAttribute("onclick", "location.href='" + hrefUrl + "';");
                    var t = document.createTextNode(authProvName); 
                    button.appendChild(t); 
                    socialli.appendChild(button);
                }
                	
                socialul.appendChild(socialli);	

            }
            social.appendChild(socialul);
            content.appendChild(social);
        }

        if (SFIDWidget.authconfig.SamlProviders.length > 0) {
            var social = document.createElement('div'); 
            social.id = "sfid-social";

            var socialul = document.createElement('ul'); 

            for (var samlProv in SFIDWidget.authconfig.SamlProviders) {

                var socialli = document.createElement('li');               
                var button = document.createElement('button'); 
                var ssoProvUrlRemoveWrongRelay = removeUrlParam(SFIDWidget.authconfig.SamlProviders[samlProv].SsoUrl, 'RelayState');
                var relayStateParam = '&RelayState=' + encodeURIComponent(SFIDWidget.config.authorizeURL);
                var SamlName = SFIDWidget.authconfig.SamlProviders[samlProv].Name;
                
                socialli.className = "sfid-button-saml";
                socialli.id = "sfid-button-saml-" + SamlName;
                
                button.setAttribute("onclick", "location.href='" + ssoProvUrlRemoveWrongRelay + relayStateParam + "';");

                var t = document.createTextNode(SamlName); 
                button.appendChild(t); 
                socialli.appendChild(button);
                socialul.appendChild(socialli);
            }

            social.appendChild(socialul);
            content.appendChild(social);
        }

        if (SFIDWidget.config.mode === 'modal') {

            var lightbox = document.createElement('div'); 
            lightbox.className = "sfid-lightbox";
            lightbox.id = "sfid-login-overlay";
            lightbox.setAttribute("onClick", "SFIDWidget.cancel()");

            var wrapper = document.createElement('div'); 
            wrapper.id = "sfid-wrapper";
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

            wrapper.appendChild(content);
            lightbox.appendChild(wrapper);

            document.body.appendChild(lightbox);
        } else {
            targetDiv.appendChild(content);
        }
    }

    function closeLogin() {
        var lightbox = document.getElementById("sfid-login-overlay");
        lightbox.style.display = "none";
        var button = document.getElementById("sfid-login-button");
        if (lightbox.parentNode) {
          lightbox.parentNode.removeChild(lightbox);
        }
        if(button) {
        	button.focus();
        }
    }
    
    function removeUrlParam(url, parameter) {
        var urlparts= url.split('?');   
        if (urlparts.length>=2) {
            var prefix= encodeURIComponent(parameter)+'=';
            var pars= urlparts[1].split(/[&;]/g);
            for (var i= pars.length; i-- > 0;) {    
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {  
                    pars.splice(i, 1);
                }
            }
            url= urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : "");
            return url;
        } else {
            return url;
        }
    }

    // Listener for window message events, receives messages from only
    // the xauth domain that we set up in the iframe
    function onMessage(event) {
        // unfreeze request message into object
        var msg;

        if(typeof event.data === "string") {
            msg = JSON.parse(event.data);
        }

        if(!msg || !msg.cmd || (typeof msg.cmd !== "string")) {
            return;
        }

        if("sfdcCallback::extendDone" === msg.cmd) {
            handleCallbackExtendDone(event);
        } else {
            handleXAuthMessages(event);
        }
    }

    function handleCallbackExtendDone(event) {
        // event.origin will always be of the format scheme://hostname:port
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#dom-messageevent-origin
        var originHostname = event.origin.split('://')[1].split('/')[0];

        // unfreeze request message into object
        var msg = JSON.parse(event.data);
        if(!msg) {
            return;
        }

        if( (originHostname !== location.host) && ( !requestingHostInAllowedDomainsList(originHostname)) ) {
            console.log('message from host not allowed : ' + originHostname);
            return;
        }

        window.location = msg.redirectUri;
    }

    //check if requester is allowed to view storage contents based on domain
    function requestingHostInAllowedDomainsList(originHostname) {
        if(!originHostname || !SFIDWidget.config.allowedDomains){
            return false;
        }

        for(var j = 0; j < SFIDWidget.config.allowedDomains.length; j = j + 1) {
            var thisAllowedDomains = SFIDWidget.config.allowedDomains[j];
            if(thisAllowedDomains === originHostname ) {
                return true;
            }

            if (thisAllowedDomains.indexOf('*.') === 0) {
                var thisDomain = thisAllowedDomains.substring(2, thisAllowedDomains.length);
                if( stringEndsWith(originHostname, thisDomain)) {
                    return true;
                }
            }
        }
        return false;
    }

    function stringEndsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function handleXAuthMessages(event) {
        // event.origin will always be of the format scheme://hostname:port
        // http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#dom-messageevent-origin
        var originHostname = event.origin.split('://')[1].split('/')[0];

        if(originHostname !== SFIDWidget.config.domain ) {
            // Doesn't match xauth.org, reject
            console.log('doesnt match domain: ' + originHostname + " : " + SFIDWidget.config.domain);
            return;
        }

        // unfreeze request message into object
        var msg = JSON.parse(event.data);
        if(!msg) {
            return;
        }

        // Check for special iframe ready message and call any pending
        // requests in our queue made before the iframe was created.
        if(msg.cmd === 'sfdcxauth::ready') {
            // Cache the reference to the iframe window object
            postWindow = iframe.contentWindow;
            setTimeout(makePendingRequests, 0);
            return;
        }

        // Look up saved request object and send response message to callback
        var request = openRequests[msg.id];
        if(request) {
            if(request.callback) {
                request.callback(msg);
            }
            delete openRequests[msg.id];
        }
    }

    // Called once on first command to create the iframe to xauth.org
    function setupWindow() {
        if(iframe || postWindow) { return; }

        // Create hidden iframe dom element
        var doc = win.document;
        iframe = doc.createElement('iframe');
        iframe.id = 'sfid_xdomain';
        iframe.style.display = "none";

        // Setup postMessage event listeners
        if (win.addEventListener) {
            win.addEventListener('message', onMessage, false);
        } else if(win.attachEvent) {
            win.attachEvent('onmessage', onMessage);
        }

        // Append iframe to the dom and load up xauth.org inside
        doc.body.appendChild(iframe);
        iframe.src = SFIDWidget.XAuthServerUrl;
    }

    // Called immediately after iframe has told us it's ready for communication
    function makePendingRequests() {
        for(var i=0; i<requestQueue.length; i++) {
            makeRequest(openRequests[requestQueue.shift()]);
        }
    }

    // Simple wrapper for the postMessage command that sends serialized requests
    // to the xauth.org iframe window
    function makeRequest(requestObj) {
        document.getElementById('sfid_xdomain').contentWindow.postMessage(JSON.stringify(requestObj), SFIDWidget.XAuthServerUrl);
    }

    // All requests funnel thru queueRequest which assigns it a unique
    // request Id and either queues up the request before the iframe
    // is created or makes the actual request
    function queueRequest(requestObj) {
        if(unsupported) { return; }
        requestObj.id = requestId;
        openRequests[requestId++] = requestObj;
        // If window isn't ready, add it to a queue
        if(!iframe || !postWindow) {
            requestQueue.push(requestObj.id);
            setupWindow(); // must happen after we've added to the queue

        } else {
            makeRequest(requestObj);
        }
    }

    // Following three functions are just API wrappers that clean up the
    // the arguments passed in before they're sent and attach the
    // appropriate command strings to the request objects

    function callRetrieve(args) {
        if(!args) { args = {}; }
        var requestObj = {
            cmd: 'sfdcxauth::retrieve',
            retrieve: args.retrieve || null,
            callback: args.callback || null
        }
        queueRequest(requestObj);
    }

    function callAlive(args) {
        if(!args) { args = {}; }

        var requestObj = {
            cmd: 'sfdcxauth::alive',
            retrieve: args.retrieve || null,
            callback: args.callback || aliveCallback
        }
        queueRequest(requestObj);
    }

    function callExtend(args) {
        if(!args) {
            return;
        }
        var requestObj = {
            cmd: 'sfdcxauth::extend',
            uid: args.uid || null,
            oid: args.oid || null,
            identity: args.identity || null,
            identityServiceResponse: args.identityServiceResponse || '',
            expire: args.expire || 0,
            allowedDomains: args.allowedDomains || [],
            widgetSession: args.widgetSession,
            callback: args.callback || null,
            communityURL: SFIDWidget.config.communityURL,
            active: args.active,
            community: args.community,
            mydomain: args.mydomain,
            activeonly: args.activeonly,
            retainhint: args.retainhint
        }
        queueRequest(requestObj);
    }

    function callExpire(args) {
        if(!args) { args = {}; }

        var storageKey = null;
        if( SFIDWidget.openid_response && SFIDWidget.openid_response.organization_id && SFIDWidget.openid_response.user_id) {
            storageKey = SFIDWidget.openid_response.organization_id.substring(0, 15) + SFIDWidget.openid_response.user_id.substring(0, 15);
        }

        var requestObj = {
            cmd: 'sfdcxauth::expire',
            callback: args.callback || null,
            storageKey: storageKey
        };

        queueRequest(requestObj);
    }

    function aliveCallback(response) {

        if ((response.alive) && ( ! SFIDWidget.openid_response)) {
            //you got logged in
            console.log('you got logged in');
            SFIDWidget.init();

        } else if ((!response.alive) && (SFIDWidget.openid_response)) {
            //you got logged out
            console.log('you got logged out');
            SFIDWidget.logout();
        }
    }

    function setup(response) {
        var tokens = response.identityServiceResponses;
        for(var storageKey in tokens) {
            var encodedToken = tokens[storageKey]['identityServiceResponse'];
            var decodedToken = atob(encodedToken);
            SFIDWidget.openid_response = JSON.parse(decodedToken);
        }
        if (SFIDWidget.openid_response) {
            window[SFIDWidget_loginHandler](SFIDWidget.openid_response);
        } else if ((SFIDWidget.config.mode === 'modal') || (SFIDWidget.config.mode === 'inline') || (SFIDWidget.config.mode === 'popup')) {

                    var request = new XMLHttpRequest();
                    request.onreadystatechange = function () {
                        var DONE = this.DONE || 4;
                        if (this.readyState === DONE){
                            SFIDWidget.authconfig = JSON.parse(this.responseText);
                            processConfig();
                        }
                    };
                    var wellKnownUrl = SFIDWidget.config.communityURL + '/.well-known/auth-configuration';
                    if(SFIDWidget.config.expid) {
                    	wellKnownUrl += "?expid=" + encodeURIComponent(SFIDWidget.config.expid);
                    }
                    request.open('GET', wellKnownUrl, true);
                    request.send(null);
        }

        setInterval("SFIDWidget.isAlive()",3000);
    }

    function processConfig() {

        var state = '';
        if (SFIDWidget.config.mode === 'popup') {
            state = encodeURIComponent(SFIDWidget_loginHandler);
        } else {
            state = (SFIDWidget.config.startURL ? encodeURIComponent(SFIDWidget.config.startURL) : '');
        }

        var responseType = 'token';
        if (SFIDWidget.config.serverCallback) responseType = 'code';

        SFIDWidget.config.authorizeURL = '/services/oauth2/authorize';
        if(SFIDWidget.config.expid) {
        	SFIDWidget.config.authorizeURL += '/expid_' + encodeURIComponent(SFIDWidget.config.expid);
        }
        SFIDWidget.config.authorizeURL += '?response_type=' + responseType + '&client_id=' + SFIDWidget.config.client_id + '&redirect_uri=' 
        			+ encodeURIComponent(SFIDWidget.config.redirect_uri) + '&state=' + state

        var targetDiv;
        if (SFIDWidget.config.mode === 'inline') {
            targetDiv = document.querySelector(SFIDWidget.config.target );
            addLogin(targetDiv);
        } else {
            targetDiv = document.querySelector(SFIDWidget.config.target );
            addButton(targetDiv);
        }
    }

    function showError() {
        var e = document.getElementById('sfid-error');
        e.style.display = 'inline';
    }

    function hideError() {
        var e = document.getElementById('sfid-error');
        e.style.display = 'none';
    }

    var ready = function(a){
    	var b=document, c='addEventListener';
    	if(document && document.addEventListener) {
    		document.addEventListener('DOMContentLoaded', a);
    	} else {
    		window.attachEvent('onload', a);
    	}
    };

    function fetch() {
        SFIDWidget.getToken({
          callback: setup
        });
    }

    return {
        init: function() {

            SFIDWidget.config = {};

            SFIDWidget.config.startURL = location;
            
            var localeTag = getQueryParameterByName('locale');
            if(localeTag !== null) {
                SFIDWidget.config.locale = localeTag;
            } else {
                SFIDWidget.config.locale = 'us';
            }
            
            var expidTag = document.querySelector('meta[name="salesforce-expid"]');
            if (expidTag !== null) {
                SFIDWidget.config.expid = expidTag.content;
            }
            var minJsTag = document.querySelector('meta[name="salesforce-use-min-js"]');
            if (minJsTag !== null) {
                SFIDWidget.config.nonMinifiedJS = "false" === minJsTag.content;
            }

            var salesforceCacheMaxAge = document.querySelector('meta[name="salesforce-cache-max-age"]');
            if (salesforceCacheMaxAge !== null) {
                SFIDWidget.config.salesforceCacheMaxAge = salesforceCacheMaxAge.content;
            }

            SFIDWidget.config.logoutOnBrowserClose = true;
            var logoutOnBrowserCloseTag = document.querySelector('meta[name="salesforce-logout-on-browser-close"]');
            if (logoutOnBrowserCloseTag !== null) {
                SFIDWidget.config.logoutOnBrowserClose = "true" === logoutOnBrowserCloseTag.content;
            }

            var useCommunityBackgroundColorTag = document.querySelector('meta[name="salesforce-use-login-page-background-color"]');
            if (useCommunityBackgroundColorTag !== null) {
                SFIDWidget.config.useCommunityBackgroundColor = "true" === useCommunityBackgroundColorTag.content;
            }

            var useCommunityPrimaryColorTag = document.querySelector('meta[name="salesforce-use-login-page-login-button"]');
            if (useCommunityPrimaryColorTag !== null) {
                SFIDWidget.config.useCommunityPrimaryColor = "true" === useCommunityPrimaryColorTag.content;
            }

            var communityURLTag = document.querySelector('meta[name="salesforce-community"]');
            if (communityURLTag === null) {
                window.sfdcAlert('Enter the URL for your Salesforce community for the salesforce-community metatag.');
                return;
            } else {
                SFIDWidget.config.communityURL = communityURLTag.content;
                SFIDWidget.config.domain = SFIDWidget.config.communityURL.split('://')[1].split('/')[0];
                SFIDWidget.XAuthServerUrl = SFIDWidget.config.communityURL + "/servlet/servlet.loginwidgetcontroller?type=javascript_xauth";
                if(SFIDWidget.config.expid) {
                    SFIDWidget.XAuthServerUrl += "&expid=" + encodeURIComponent(SFIDWidget.config.expid);
                }
                if(SFIDWidget.config.nonMinifiedJS) {
                    SFIDWidget.XAuthServerUrl += "&min=false";
                }
                if(SFIDWidget.config.salesforceCacheMaxAge) {
                    SFIDWidget.XAuthServerUrl += "&cacheMaxAge=" + encodeURIComponent(SFIDWidget.config.salesforceCacheMaxAge);
                }
            }

            var callbackMethodTag = document.querySelector('meta[name="salesforce-server-callback"]');
            if ((callbackMethodTag === null) || (callbackMethodTag.content === 'false')) {
                SFIDWidget.config.serverCallback = false;
            } else if (callbackMethodTag.content === 'true') {
                SFIDWidget.config.serverCallback = true;
            }
            var allowedDomainsTag = document.querySelector('meta[name="salesforce-allowed-domains"]');
            if (allowedDomainsTag !== null) { //optional for index
                SFIDWidget.config.allowedDomains = allowedDomainsTag.content.split(',');
            }

            var modeTag = document.querySelector('meta[name="salesforce-mode"]');
            if (modeTag === null) {
                window.sfdcAlert('Enter the mode for the salesforce-mode metatag, either inline, modal, or popup.');
                return;
            } else {
                SFIDWidget.config.mode = modeTag.content;
                if ((SFIDWidget.config.mode === 'popup-callback') || (SFIDWidget.config.mode === 'modal-callback') || (SFIDWidget.config.mode === 'inline-callback')) {

                    if (allowedDomainsTag === null) { //required for callback
                        window.sfdcAlert('Enter the trusted domains, for example, localhost, @.somedomain.com.');
                        return;
                    }
                    var saveTokenTag = document.querySelector('meta[name="salesforce-save-access-token"]');
                    if ((saveTokenTag === null) || (saveTokenTag.content === 'false')) {
                        SFIDWidget.config.saveToken = false;
                    } else if (saveTokenTag.content === 'true') {
                        SFIDWidget.config.saveToken = true;
                    }

                    SFIDWidget.handleLoginCallback();
                    return;
                }
            }

            var maskRedirectsTag = document.querySelector('meta[name="salesforce-mask-redirects"]');
            if(maskRedirectsTag) {
                SFIDWidget.config.maskRedirects = maskRedirectsTag.content;
            } else {
                SFIDWidget.config.maskRedirects = "true";
            }

            var client_idTag = document.querySelector('meta[name="salesforce-client-id"]');
            if (client_idTag === null) {
                window.sfdcAlert('Enter the Consumer Key of the OAuth connected app which issues the access token.');
                return;
            } else {
                SFIDWidget.config.client_id = client_idTag.content;
            }

            var redirect_uriTag = document.querySelector('meta[name="salesforce-redirect-uri"]');
            if (redirect_uriTag === null) {
                window.sfdcAlert('Enter the Callback URL for your client-side callback page, for example, https://:logindemo.herokuapp.com/_callback.php.');
                return;
            } else {
                SFIDWidget.config.redirect_uri = redirect_uriTag.content;
            }

            var forgotPasswordEnabledTag = document.querySelector('meta[name="salesforce-forgot-password-enabled"]');
            if(forgotPasswordEnabledTag) {
                SFIDWidget.config.forgotPasswordEnabled = forgotPasswordEnabledTag.content;
            } else {
                SFIDWidget.config.forgotPasswordEnabled = false;
            }

            var selfRegistrationEnabledTag = document.querySelector('meta[name="salesforce-self-register-enabled"]');
            if(selfRegistrationEnabledTag) {
                SFIDWidget.config.selfRegistrationEnabled = selfRegistrationEnabledTag.content;
            } else {
                SFIDWidget.config.selfRegistrationEnabled = false;
            }

            var loginHandlerTag = document.querySelector('meta[name="salesforce-login-handler"]');
            if (loginHandlerTag === null) {
                window.sfdcAlert('Enter the name of the JavaScript function to call on a successful login event for the salesforce-login-handler metatag.');
                return;
            } else {
                SFIDWidget_loginHandler = loginHandlerTag.content;
            }

            var targetTag = document.querySelector('meta[name="salesforce-target"]');
            if (targetTag === null) {
                window.sfdcAlert('Enter the target on the webpage, for example, a sign-in link, to perform the login.');
                return;
            } else {
                SFIDWidget.config.target = targetTag.content;
            }

            var logoutHandlerTag = document.querySelector('meta[name="salesforce-logout-handler"]');
            if (logoutHandlerTag !== null) {
                SFIDWidget_logoutHandler = logoutHandlerTag.content;
            }
            
            var addStartUrlTag = document.querySelector('meta[name="salesforce-self-register-starturl-enabled"]');
            if (addStartUrlTag){
            	SFIDWidget.config.addStartUrlToSelfReg = addStartUrlTag.content;
            } else {
            	SFIDWidget.config.addStartUrlToSelfReg = false;
            }

            if ((SFIDWidget.config.mode === 'popup') || (SFIDWidget.config.mode === 'modal') || (SFIDWidget.config.mode === 'inline')) {

                if (document.body === null) {
                    ready(function () {
                        fetch();
                        });
                } else {
                    fetch();
                }
            }

        }, login: function() {

            if (SFIDWidget.config != null) {

                if (SFIDWidget.config.mode === 'popup') {
                    var loginWindow = window.open(SFIDWidget.config.communityURL + SFIDWidget.config.authorizeURL,'Login Window','height=580,width=450');
                    if (window.focus) {loginWindow.focus()}
                    return false;

                } else if (SFIDWidget.config.mode === 'modal') {
                    addLogin();
                }
            }

        }, authenticate: function(){
            hideError();
            document.getElementById("sfid-submit").disabled = true;
            document.getElementById("sfid-submit").className = 'sfid-disabled sfid-wide sfid-mb16';
            var un = document.getElementById('sfid-username').value;
            var pw = document.getElementById('sfid-password').value;

            if (un && pw) {

                var xhr = new XMLHttpRequest();
                xhr.open('POST', SFIDWidget.config.communityURL + '/servlet/servlet.loginwidgetcontroller?type=login', true);
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.onreadystatechange = function () {
                    var DONE = this.DONE || 4;
                    if (this.readyState === DONE){
                        var apiResponse = JSON.parse(xhr.responseText);
                        if (apiResponse.result === 'invalid') { //TODO -- need to check for xhr.status != 200
                            showError();
                            document.getElementById("sfid-submit").disabled = false;
                            document.getElementById("sfid-submit").className = 'sfid-button sfid-wide sfid-mb16';
                            document.getElementById('sfid-password').value = '';
                        } else {

                            if(SFIDWidget.config.maskRedirects === "true") {
                                var ifrm = document.createElement('iframe');
                                ifrm.setAttribute('src', apiResponse.result);
                                ifrm.className = 'sfid-callback';
                                ifrm.id = 'sfid-callback';
                                document.body.appendChild(ifrm);
                            } else {
                            	window.location.replace(apiResponse.result);
                            }
                        }
                    }
                };
                xhr.send('username=' + encodeURIComponent(un) + '&password=' + encodeURIComponent(pw) + 
                        '&startURL=' + encodeURIComponent(SFIDWidget.config.authorizeURL) );
            } else {
                showError();
                document.getElementById("sfid-submit").className = 'sfid-button sfid-wide sfid-mb16';
                document.getElementById("sfid-submit").disabled = false;
            }

        }, cancel: function() {
            closeLogin();
        }, handleLoginCallback: function() { // called from init only

            if (SFIDWidget.config.serverCallback) {

                var serverProcessedStartURLTag = document.querySelector('meta[name="salesforce-server-starturl"]');
                if (serverProcessedStartURLTag === null) {
                    SFIDWidget.config.startURL = "/";
                } else {
                    SFIDWidget.config.startURL = serverProcessedStartURLTag.content;
                }

                var serverProcessedResponseTag = document.querySelector('meta[name="salesforce-server-response"]');
                if (serverProcessedResponseTag === null) {
                    window.sfdcAlert("The server didn\'t provide a response to the callback.");
                    return;
                } else {
                    SFIDWidgetHandleOpenIDCallback(JSON.parse(atob(serverProcessedResponseTag.content)));
                }

            } else if (window.location.hash) {
                var message = window.location.hash.substr(1);
                var nvps = message.split('&');
                for (var nvp in nvps) {
                    var parts = nvps[nvp].split('=');
                    if (parts[0] === 'id') {
                        SFIDWidget.openid = decodeURIComponent(parts[1]);
                    } else if (parts[0] === 'access_token') {
                        SFIDWidget.access_token = parts[1];
                    } else if (parts[0] === 'state') {
                        if (parts[1] !== null) {
                            if (SFIDWidget.config.mode === 'popup-callback') {
                                if (parts[1] != null) SFIDWidget_loginHandler = decodeURIComponent(parts[1]);
                            } else {
                                SFIDWidget.config.startURL = decodeURIComponent(parts[1]);
                            }
                        }
                    }
                }

                //make the host same as community
                var openIdParts = SFIDWidget.openid.split('/');
                var openIdUrl = SFIDWidget.config.communityURL;
                for( var i = 3; i < openIdParts.length; i += 1) {
                    openIdUrl += '/' + openIdParts[i];
                }

                SFIDWidget.openid = openIdUrl;

                var openidScript = document.createElement('script');
                openidScript.setAttribute('src', SFIDWidget.openid + '?version=latest&format=jsonp&callback=SFIDWidgetHandleOpenIDCallback&access_token=' + SFIDWidget.access_token);
                document.head.appendChild(openidScript);
            }
        },  redirectToStartURL: function() {

            if (SFIDWidget.config.mode === 'popup-callback') {
            	window.close(); //storage is set on the community domain, opener's aliveCallback will log the user in within 3 secs
            } else if ((SFIDWidget.config.mode === 'modal-callback') || (SFIDWidget.config.mode === 'inline-callback')) {
                var redirectMessage = {
                        cmd : "sfdcCallback::extendDone",
                        redirectUri : SFIDWidget.config.startURL
                };

                window.parent.postMessage(JSON.stringify(redirectMessage), location.protocol + "//" + location.host + "/");
            }

        }, logout: function() {

            if (SFIDWidget.openid_response && SFIDWidget.openid_response.access_token) {
                var revokeURL =  SFIDWidget.config.communityURL + '/services/oauth2/revoke?callback=SFIDWidgetHandleRevokeCallback&token=' + SFIDWidget.openid_response.access_token;
                var openidScript = document.createElement('script');
                openidScript.setAttribute('src', revokeURL);
                document.head.appendChild(openidScript);
            }

            SFIDWidget.expireToken({callback:SFIDWidgetHandleExpireCallback});

            var ifrm = document.createElement('iframe');
            ifrm.setAttribute('src', SFIDWidget.config.communityURL + '/secur/logout.jsp');
            ifrm.className = 'sfid-logout';
            ifrm.onload = function() {
                this.parentNode.removeChild(this);  
                console.log('idp session was invalidated');
            };
            document.body.appendChild(ifrm);

        },
        setToken: callExtend,
        getToken: callRetrieve,
        expireToken: callExpire,
        isAlive: callAlive,
        disabled: unsupported // boolean, NOT a function
    }

}();

function SFIDWidgetHandleOpenIDCallback(response) {
    response.user_id = response.user_id.substring(0, 15);
    response.organization_id = response.organization_id.substring(0, 15);

    SFIDWidget.openid_response = response;
    console.log(SFIDWidget.openid_response);
    if ((SFIDWidget.config.saveToken) && (!SFIDWidget.config.serverCallback)) {
        SFIDWidget.openid_response.access_token = SFIDWidget.access_token;
    }
    var encodedResponse = btoa(JSON.stringify(response));

    var identityObj = {};
    identityObj.uid = response.user_id;
    identityObj.username = response.username;
    identityObj.thumbnail = response.photos ? response.photos.thumbnail : "";
    identityObj.oid = response.organization_id;
    identityObj.instance = SFIDWidget.config.communityURL;
    identityObj.ll = response.is_lightning_login_user;
    identityObj.dump = SFIDWidget.openid_response;
    identityObj.access_token = SFIDWidget.openid_response.access_token;

    SFIDWidget.setToken({
          uid: response.user_id,
          oid: response.organization_id,
          callback: SFIDWidget.redirectToStartURL,
          identity: identityObj,
          expire: new Date().getTime() + 100000, //adding hundred seconds from now
          active: false,
          mydomain: response.urls.custom_domain ? true : false,
          community: true,
          activeonly: true,
          retainhint: false,
          widgetSession: SFIDWidget.config.logoutOnBrowserClose,
          allowedDomains: SFIDWidget.config.allowedDomains,
          identityServiceResponse: encodedResponse
        });
};

function SFIDWidgetHandleRevokeCallback(response) {
    if (response.error != null) {
        console.log('access token was already invalid');
    } else {
        console.log('access token was revoked');
    }
};

function SFIDWidgetHandleExpireCallback(response) {
    console.log('xauth token was expired: ' + response);
    SFIDWidget.access_token = null;
    SFIDWidget.openid = null;
    SFIDWidget.openid_response = null;
    SFIDWidget.config = null;
    SFIDWidget.authconfig = null;
    window[SFIDWidget_logoutHandler](); 
};


SFIDWidget.init();