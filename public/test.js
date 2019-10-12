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
var SFIDWidget_loginHandler, SFIDWidget_logoutHandler, SFIDWidget = function() {
    function P(e) {
        return SFIDWidget.config.expid && (-1 === e.indexOf("?") ? e += "?expid=" + encodeURIComponent(SFIDWidget.config.expid) : e += "&expid=" + encodeURIComponent(SFIDWidget.config.expid)), e
    }

    function r(e) {
        null != e && (e.innerHTML = "");
        var t = document.createElement("div");
        if ("modal" === SFIDWidget.config.mode ? t.id = "sfid-content" : "inline" === SFIDWidget.config.mode && (t.id = "sfid-inline-content"), SFIDWidget.config.useCommunityBackgroundColor && (t.style.backgroundColor = SFIDWidget.authconfig.LoginPage.BackgroundColor), "modal" === SFIDWidget.config.mode && null != SFIDWidget.authconfig.LoginPage.LogoUrl) {
            var n = document.createElement("div");
            n.id = "sfid-logo_wrapper", n.className = "sfid-standard_logo_wrapper sfid-mt12";
            var i = document.createElement("img");
            i.src = SFIDWidget.authconfig.LoginPage.LogoUrl, i.className = "sfid-standard_logo", i.alt = "Salesforce", n.appendChild(i);
            var o = document.createElement("h2");
            o.id = "dialogTitle";
            var d = document.createTextNode("Salesforce Login");
            o.appendChild(d), t.setAttribute("role", "dialog"), t.setAttribute("aria-labelledby", o.id), t.tabIndex = "-1", t.addEventListener("keydown", function(e) {
                27 === e.keyCode && SFIDWidget.cancel()
            }, !0), t.appendChild(n)
        }
        var a = document.createElement("div");
        if (a.className = "sfid-mb1", a.id = "sfid-error", a.innerHTML = "We can\'t log you in. Make sure your username and password are correct.", a.style.display = "none", a.setAttribute("role", "alert"), t.appendChild(a), SFIDWidget.authconfig.LoginPage.UsernamePasswordEnabled) {
            var r = document.createElement("form");
            r.setAttribute("onSubmit", "SFIDWidget.authenticate();return false;");
            var l = document.createElement("input");
            l.className = "sfid-wide sfid-mb12", l.type = "text", l.name = "username", l.id = "sfid-username", l.setAttribute("autofocus", "autofocus");
            var c = document.createElement("LABEL");
            c.htmlFor = l.id, c.className = "sfid-button-label", c.innerText = "Username";
            var s = document.createElement("input");
            s.className = "sfid-wide sfid-mb12", s.type = "password", s.name = "password", s.id = "sfid-password";
            var g = document.createElement("LABEL");
            g.innerText = "Password", g.htmlFor = s.id, g.className = "sfid-button-label", (L = document.createElement("input")).className = "sfid-button sfid-wide sfid-mb16", L.type = "submit", L.id = "sfid-submit", L.value = "Log In", SFIDWidget.config.useCommunityPrimaryColor && (L.style.backgroundColor = SFIDWidget.authconfig.LoginPage.PrimaryColor), r.appendChild(c), r.appendChild(l), r.appendChild(g), r.appendChild(s), r.appendChild(L), t.appendChild(r)
        }
        var u = document.createElement("div");
        if (u.id = "sfid-selfreg-password", "true" === SFIDWidget.config.forgotPasswordEnabled) {
            var m = document.createElement("a");
            m.id = "sfid-forgot-password", m.href = decodeURIComponent(P(SFIDWidget.authconfig.LoginPage.ForgotPasswordUrl)), m.text = "Forgot your password?", u.appendChild(m)
        }
        if (SFIDWidget.authconfig.LoginPage.SelfRegistrationEnabled && "true" === SFIDWidget.config.selfRegistrationEnabled) {
            var f = document.createElement("a");
            f.id = "sfid-self-registration";
            var p = P(SFIDWidget.authconfig.LoginPage.SelfRegistrationUrl);
            f.href = function(e) {
                var t = "/services/oauth2/authorize?response_type=token&client_id=" + SFIDWidget.config.client_id + "&redirect_uri=" + encodeURIComponent(SFIDWidget.config.redirect_uri);
                return "true" === SFIDWidget.config.addStartUrlToSelfReg && (-1 === e.indexOf("?") ? e += "?startURL=" + encodeURIComponent(t) : e += "&startURL=" + encodeURIComponent(t)), e
            }(p), f.text = "Not a member?", u.appendChild(f)
        }
        0 < u.children.length && t.appendChild(u);
        var S = SFIDWidget.authconfig.LoginPage.UsernamePasswordEnabled,
            I = SFIDWidget.authconfig.AuthProviders.length,
            D = SFIDWidget.authconfig.SamlProviders.length;
        if (S && (0 < I || 0 < D)) {
            var W = document.createElement("br");
            (F = document.createElement("p")).className = "sfid-small", F.innerHTML = "or log in using", t.appendChild(W), t.appendChild(F)
        } else if (!S && (0 < I || 0 < D)) {
            var F;
            (F = document.createElement("p")).className = "sfid-small sfid-mb16", F.innerHTML = "Choose an authentication provider.", t.appendChild(F)
        }
        if (0 < SFIDWidget.authconfig.AuthProviders.length) {
            (E = document.createElement("div")).id = "sfid-social";
            for (var v = document.createElement("ul"), h = 0; h < SFIDWidget.authconfig.AuthProviders.length; h++) {
                var b = document.createElement("li"),
                    y = SFIDWidget.authconfig.AuthProviders[h].IconUrl,
                    w = SFIDWidget.authconfig.AuthProviders[h].SsoUrl; - 1 === w.indexOf("?") ? w += "?startURL=" + encodeURIComponent(SFIDWidget.config.authorizeURL) : w += "&startURL=" + encodeURIComponent(SFIDWidget.config.authorizeURL);
                var C = SFIDWidget.authconfig.AuthProviders[h].Name;
                if (b.className = "sfid-button-ap", b.id = "sfid-button-ap-" + C, null != y) {
                    var k = document.createElement("img");
                    k.className = "sfid-social-buttonimg", k.src = y, k.alt = "Login with " + C;
                    var _ = document.createElement("a");
                    _.href = w, _.appendChild(k), _.title = C, b.appendChild(_)
                } else {
                    (L = document.createElement("button")).setAttribute("onclick", "location.href='" + w + "';");
                    var R = document.createTextNode(C);
                    L.appendChild(R), b.appendChild(L)
                }
                v.appendChild(b)
            }
            E.appendChild(v), t.appendChild(E)
        }
        if (0 < SFIDWidget.authconfig.SamlProviders.length) {
            var E;
            (E = document.createElement("div")).id = "sfid-social";
            v = document.createElement("ul");
            for (var U = 0; U < SFIDWidget.authconfig.SamlProviders.length; U++) {
                b = document.createElement("li");
                var L = document.createElement("button"),
                    x = O(SFIDWidget.authconfig.SamlProviders[U].SsoUrl, "RelayState"),
                    A = "&RelayState=" + encodeURIComponent(SFIDWidget.config.authorizeURL),
                    N = SFIDWidget.authconfig.SamlProviders[U].Name;
                b.className = "sfid-button-saml", b.id = "sfid-button-saml-" + N, L.setAttribute("onclick", "location.href='" + x + A + "';");
                R = document.createTextNode(N);
                L.appendChild(R), b.appendChild(L), v.appendChild(b)
            }
            E.appendChild(v), t.appendChild(E)
        }
        if ("modal" === SFIDWidget.config.mode) {
            var q = document.createElement("div");
            q.className = "sfid-lightbox", q.id = "sfid-login-overlay", q.setAttribute("onClick", "SFIDWidget.cancel()");
            var T = document.createElement("div");
            T.id = "sfid-wrapper", T.onclick = function(e) {
                (e = e || window.event).stopPropagation ? e.stopPropagation() : e.cancelBubble = !0
            }, T.appendChild(t), q.appendChild(T), document.body.appendChild(q)
        } else e.appendChild(t)
    }

    function O(e, t) {
        var n = e.split("?");
        if (2 <= n.length) {
            for (var i = encodeURIComponent(t) + "=", o = n[1].split(/[&;]/g), d = o.length; 0 < d--;) - 1 !== o[d].lastIndexOf(i, 0) && o.splice(d, 1);
            return e = n[0] + (0 < o.length ? "?" + o.join("&") : "")
        }
        return e
    }

    function t(e) {
        var t;
        "string" == typeof e.data && (t = JSON.parse(e.data)), t && t.cmd && "string" == typeof t.cmd && ("sfdcCallback::extendDone" === t.cmd ? function(e) {
            var t = e.origin.split("://")[1].split("/")[0],
                n = JSON.parse(e.data);
            if (!n) return;
            if (t !== location.host && ! function(e) {
                    if (!e || !SFIDWidget.config.allowedDomains) return !1;
                    for (var t = 0; t < SFIDWidget.config.allowedDomains.length; t += 1) {
                        var n = SFIDWidget.config.allowedDomains[t];
                        if (n === e) return !0;
                        if (0 === n.indexOf("*.")) {
                            var i = n.substring(2, n.length);
                            if (d = i, -1 !== (o = e).indexOf(d, o.length - d.length)) return !0
                        }
                    }
                    var o, d;
                    return !1
                }(t)) return console.log("message from host not allowed : " + t);
            window.location = n.redirectUri
        }(e) : function(e) {
            var t = e.origin.split("://")[1].split("/")[0];
            if (t !== SFIDWidget.config.domain) return console.log("doesnt match domain: " + t + " : " + SFIDWidget.config.domain);
            var n = JSON.parse(e.data);
            if (!n) return;
            if ("sfdcxauth::ready" === n.cmd) return postWindow = iframe.contentWindow, setTimeout(o, 0);
            var i = openRequests[n.id];
            i && (i.callback && i.callback(n), delete openRequests[n.id])
        }(e))
    }

    function o() {
        for (var e = 0; e < requestQueue.length; e++) n(openRequests[requestQueue.shift()])
    }

    function n(e) {
        document.getElementById("sfid_xdomain").contentWindow.postMessage(JSON.stringify(e), SFIDWidget.XAuthServerUrl)
    }

    function i(e) {
        unsupported || (e.id = requestId, openRequests[requestId++] = e, iframe && postWindow ? n(e) : (requestQueue.push(e.id), function() {
            if (!iframe && !postWindow) {
                var e = win.document;
                iframe = e.createElement("iframe"), iframe.id = "sfid_xdomain", iframe.style.display = "none", win.addEventListener ? win.addEventListener("message", t, !1) : win.attachEvent && win.attachEvent("onmessage", t), e.body.appendChild(iframe), iframe.src = SFIDWidget.XAuthServerUrl
            }
        }()))
    }

    function d(e) {
        e.alive && !SFIDWidget.openid_response ? (console.log("you got logged in"), SFIDWidget.init()) : !e.alive && SFIDWidget.openid_response && (console.log("you got logged out"), SFIDWidget.logout())
    }

    function e(e) {
        for (var t = e.identityServiceResponses, n = 0; n < t.length; n++) {
            var i = t[n].identityServiceResponse,
                o = atob(i);
            SFIDWidget.openid_response = JSON.parse(o)
        }
        if (SFIDWidget.openid_response) window[SFIDWidget_loginHandler](SFIDWidget.openid_response);
        else if ("modal" === SFIDWidget.config.mode || "inline" === SFIDWidget.config.mode || "popup" === SFIDWidget.config.mode) {
            var d = new XMLHttpRequest;
            d.onreadystatechange = function() {
                var e = this.DONE || 4;
                this.readyState === e && (SFIDWidget.authconfig = JSON.parse(this.responseText), function() {
                    var e = "";
                    e = "popup" === SFIDWidget.config.mode ? encodeURIComponent(SFIDWidget_loginHandler) : SFIDWidget.config.startURL ? encodeURIComponent(SFIDWidget.config.startURL) : "";
                    var t = "token";
                    SFIDWidget.config.serverCallback && (t = "code");
                    SFIDWidget.config.authorizeURL = "/services/oauth2/authorize", SFIDWidget.config.expid && (SFIDWidget.config.authorizeURL += "/expid_" + encodeURIComponent(SFIDWidget.config.expid));
                    SFIDWidget.config.authorizeURL += "?response_type=" + t + "&client_id=" + SFIDWidget.config.client_id + "&redirect_uri=" + encodeURIComponent(SFIDWidget.config.redirect_uri) + "&state=" + e, "inline" === SFIDWidget.config.mode ? r(document.querySelector(SFIDWidget.config.target)) : function(e) {
                        e.innerHTML = "";
                        var t = document.createElement("button");
                        t.id = "sfid-login-button", t.className = "sfid-button", t.innerHTML = "Log in", t.setAttribute("onClick", "SFIDWidget.login()"), SFIDWidget.config.useCommunityPrimaryColor && (t.style.backgroundColor = SFIDWidget.authconfig.LoginPage.PrimaryColor), e.appendChild(t)
                    }(document.querySelector(SFIDWidget.config.target))
                }())
            };
            var a = SFIDWidget.config.communityURL + "/.well-known/auth-configuration";
            SFIDWidget.config.expid && (a += "?expid=" + encodeURIComponent(SFIDWidget.config.expid)), d.open("GET", a, !0), d.send(null)
        }
        setInterval("SFIDWidget.isAlive()", 3e3)
    }

    function a() {
        document.getElementById("sfid-error").style.display = "inline"
    }
    this.config = null, this.access_token = null, this.openid = null, this.openid_response = null, this.win = window, this.unsupported = !(this.win.postMessage && function(e) {
        try {
            var t = window[e],
                n = "__storage_test__";
            return t.setItem(n, n), t.removeItem(n), !0
        } catch (e) {
            return e instanceof DOMException && (22 === e.code || 1014 === e.code || "QuotaExceededError" === e.name || "NS_ERROR_DOM_QUOTA_REACHED" === e.name) && 0 !== t.length
        }
    }("localStorage") && this.win.JSON), this.XAuthServerUrl = null, this.iframe = null, this.postWindow = null, this.openRequests = {}, this.requestId = 0, this.requestQueue = [];

    function F() {
        SFIDWidget.getToken({
            callback: e
        })
    }
    return {
        init: function() {
            SFIDWidget.config = {}, SFIDWidget.config.startURL = location;
            var e = document.querySelector('meta[name="salesforce-expid"]');
            null !== e && (SFIDWidget.config.expid = e.content);
            var t = document.querySelector('meta[name="salesforce-use-min-js"]');
            null !== t && (SFIDWidget.config.nonMinifiedJS = "false" === t.content);
            var n = document.querySelector('meta[name="salesforce-cache-max-age"]');
            null !== n && (SFIDWidget.config.salesforceCacheMaxAge = n.content), SFIDWidget.config.logoutOnBrowserClose = !0;
            var i = document.querySelector('meta[name="salesforce-logout-on-browser-close"]');
            null !== i && (SFIDWidget.config.logoutOnBrowserClose = "true" === i.content);
            var o = document.querySelector('meta[name="salesforce-use-login-page-background-color"]');
            null !== o && (SFIDWidget.config.useCommunityBackgroundColor = "true" === o.content);
            var d = document.querySelector('meta[name="salesforce-use-login-page-login-button"]');
            null !== d && (SFIDWidget.config.useCommunityPrimaryColor = "true" === d.content);
            var a = document.querySelector('meta[name="salesforce-community"]');
            if (null !== a) {
                SFIDWidget.config.communityURL = a.content, SFIDWidget.config.domain = SFIDWidget.config.communityURL.split("://")[1].split("/")[0], SFIDWidget.XAuthServerUrl = SFIDWidget.config.communityURL + "/servlet/servlet.loginwidgetcontroller?type=javascript_xauth", SFIDWidget.config.expid && (SFIDWidget.XAuthServerUrl += "&expid=" + encodeURIComponent(SFIDWidget.config.expid)), SFIDWidget.config.nonMinifiedJS && (SFIDWidget.XAuthServerUrl += "&min=false"), SFIDWidget.config.salesforceCacheMaxAge && (SFIDWidget.XAuthServerUrl += "&cacheMaxAge=" + encodeURIComponent(SFIDWidget.config.salesforceCacheMaxAge));
                var r = document.querySelector('meta[name="salesforce-server-callback"]');
                null === r || "false" === r.content ? SFIDWidget.config.serverCallback = !1 : "true" === r.content && (SFIDWidget.config.serverCallback = !0);
                var l = document.querySelector('meta[name="salesforce-allowed-domains"]');
                null !== l && (SFIDWidget.config.allowedDomains = l.content.split(","));
                var c = document.querySelector('meta[name="salesforce-mode"]');
                if (null !== c) {
                    if (SFIDWidget.config.mode = c.content, "popup-callback" === SFIDWidget.config.mode || "modal-callback" === SFIDWidget.config.mode || "inline-callback" === SFIDWidget.config.mode) {
                        if (null === l) return void window.sfdcAlert("Enter the trusted domains, for example, localhost, @.somedomain.com.");
                        var s = document.querySelector('meta[name="salesforce-save-access-token"]');
                        return null === s || "false" === s.content ? SFIDWidget.config.saveToken = !1 : "true" === s.content && (SFIDWidget.config.saveToken = !0), void SFIDWidget.handleLoginCallback()
                    }
                    var g = document.querySelector('meta[name="salesforce-mask-redirects"]');
                    SFIDWidget.config.maskRedirects = g ? g.content : "true";
                    var u = document.querySelector('meta[name="salesforce-client-id"]');
                    if (null !== u) {
                        SFIDWidget.config.client_id = u.content;
                        var m = document.querySelector('meta[name="salesforce-redirect-uri"]');
                        if (null !== m) {
                            SFIDWidget.config.redirect_uri = m.content;
                            var f = document.querySelector('meta[name="salesforce-forgot-password-enabled"]');
                            SFIDWidget.config.forgotPasswordEnabled = !!f && f.content;
                            var p = document.querySelector('meta[name="salesforce-self-register-enabled"]');
                            SFIDWidget.config.selfRegistrationEnabled = !!p && p.content;
                            var S = document.querySelector('meta[name="salesforce-login-handler"]');
                            if (null !== S) {
                                SFIDWidget_loginHandler = S.content;
                                var I = document.querySelector('meta[name="salesforce-target"]');
                                if (null !== I) {
                                    SFIDWidget.config.target = I.content;
                                    var D = document.querySelector('meta[name="salesforce-logout-handler"]');
                                    null !== D && (SFIDWidget_logoutHandler = D.content);
                                    var W = document.querySelector('meta[name="salesforce-self-register-starturl-enabled"]');
                                    SFIDWidget.config.addStartUrlToSelfReg = !!W && W.content, "popup" !== SFIDWidget.config.mode && "modal" !== SFIDWidget.config.mode && "inline" !== SFIDWidget.config.mode || (null === document.body ? function(e) {
                                        document;
                                        document && document.addEventListener ? document.addEventListener("DOMContentLoaded", e) : window.attachEvent("onload", e)
                                    }(function() {
                                        F()
                                    }) : F())
                                } else window.sfdcAlert("Enter the target on the webpage, for example, a sign-in link, to perform the login.")
                            } else window.sfdcAlert("Enter the name of the JavaScript function to call on a successful login event for the salesforce-login-handler metatag.")
                        } else window.sfdcAlert("Enter the Callback URL for your client-side callback page, for example, https://:logindemo.herokuapp.com/_callback.php.")
                    } else window.sfdcAlert("Enter the Consumer Key of the OAuth connected app which issues the access token.")
                } else window.sfdcAlert("Enter the mode for the salesforce-mode metatag, either inline, modal, or popup.")
            } else window.sfdcAlert("Enter the URL for your Salesforce community for the salesforce-community metatag.")
        },
        login: function() {
            if (null != SFIDWidget.config) {
                if ("popup" === SFIDWidget.config.mode) {
                    var e = window.open(SFIDWidget.config.communityURL + SFIDWidget.config.authorizeURL, "Login Window", "height=580,width=450");
                    return window.focus && e.focus(), !1
                }
                "modal" === SFIDWidget.config.mode && r()
            }
        },
        authenticate: function() {
            document.getElementById("sfid-error").style.display = "none", document.getElementById("sfid-submit").disabled = !0, document.getElementById("sfid-submit").className = "sfid-disabled sfid-wide sfid-mb16";
            var e = document.getElementById("sfid-username").value,
                t = document.getElementById("sfid-password").value;
            if (e && t) {
                var i = new XMLHttpRequest;
                i.open("POST", SFIDWidget.config.communityURL + "/servlet/servlet.loginwidgetcontroller?type=login", !0), i.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), i.onreadystatechange = function() {
                    var e = this.DONE || 4;
                    if (this.readyState === e) {
                        var t = JSON.parse(i.responseText);
                        if ("invalid" === t.result) a(), document.getElementById("sfid-submit").disabled = !1, document.getElementById("sfid-submit").className = "sfid-button sfid-wide sfid-mb16", document.getElementById("sfid-password").value = "";
                        else if ("true" === SFIDWidget.config.maskRedirects) {
                            var n = document.createElement("iframe");
                            n.setAttribute("src", t.result), n.className = "sfid-callback", n.id = "sfid-callback", document.body.appendChild(n)
                        } else window.location.replace(t.result)
                    }
                }, i.send("username=" + encodeURIComponent(e) + "&password=" + t + "&startURL=" + encodeURIComponent(SFIDWidget.config.authorizeURL))
            } else a(), document.getElementById("sfid-submit").className = "sfid-button sfid-wide sfid-mb16", document.getElementById("sfid-submit").disabled = !1
        },
        cancel: function() {
            ! function() {
                var e = document.getElementById("sfid-login-overlay");
                e.style.display = "none";
                var t = document.getElementById("sfid-login-button");
                e.parentNode && e.parentNode.removeChild(e), t && t.focus()
            }()
        },
        handleLoginCallback: function() {
            if (SFIDWidget.config.serverCallback) {
                var e = document.querySelector('meta[name="salesforce-server-starturl"]');
                SFIDWidget.config.startURL = null === e ? "/" : e.content;
                var t = document.querySelector('meta[name="salesforce-server-response"]');
                if (null === t) return void window.sfdcAlert("The server didn\'t provide a response to the callback.");
                SFIDWidgetHandleOpenIDCallback(JSON.parse(atob(t.content)))
            } else if (window.location.hash) {
                for (var n = window.location.hash.substr(1).split("&"), i = 0; i < n.length; i++) {
                    var o = n[i].split("=");
                    "id" === o[0] ? SFIDWidget.openid = decodeURIComponent(o[1]) : "access_token" === o[0] ? SFIDWidget.access_token = o[1] : "state" === o[0] && null !== o[1] && ("popup-callback" === SFIDWidget.config.mode ? null != o[1] && (SFIDWidget_loginHandler = decodeURIComponent(o[1])) : SFIDWidget.config.startURL = decodeURIComponent(o[1]))
                }
                for (var d = SFIDWidget.openid.split("/"), a = SFIDWidget.config.communityURL, r = 3; r < d.length; r += 1) a += "/" + d[r];
                SFIDWidget.openid = a;
                var l = document.createElement("script");
                l.setAttribute("src", SFIDWidget.openid + "?version=latest&format=jsonp&callback=SFIDWidgetHandleOpenIDCallback&access_token=" + SFIDWidget.access_token), document.head.appendChild(l)
            }
        },
        redirectToStartURL: function() {
            if ("popup-callback" === SFIDWidget.config.mode) window.close();
            else if ("modal-callback" === SFIDWidget.config.mode || "inline-callback" === SFIDWidget.config.mode) {
                var e = {
                    cmd: "sfdcCallback::extendDone",
                    redirectUri: SFIDWidget.config.startURL
                };
                window.parent.postMessage(JSON.stringify(e), location.protocol + "//" + location.host + "/")
            }
        },
        logout: function() {
            if (SFIDWidget.openid_response && SFIDWidget.openid_response.access_token) {
                var e = SFIDWidget.config.communityURL + "/services/oauth2/revoke?callback=SFIDWidgetHandleRevokeCallback&token=" + SFIDWidget.openid_response.access_token,
                    t = document.createElement("script");
                t.setAttribute("src", e), document.head.appendChild(t)
            }
            SFIDWidget.expireToken({
                callback: SFIDWidgetHandleExpireCallback
            });
            var n = document.createElement("iframe");
            n.setAttribute("src", SFIDWidget.config.communityURL + "/secur/logout.jsp"), n.className = "sfid-logout", n.onload = function() {
                this.parentNode.removeChild(this), console.log("idp session was invalidated")
            }, document.body.appendChild(n)
        },
        setToken: function(e) {
            e && i({
                cmd: "sfdcxauth::extend",
                uid: e.uid || null,
                oid: e.oid || null,
                identity: e.identity || null,
                identityServiceResponse: e.identityServiceResponse || "",
                expire: e.expire || 0,
                allowedDomains: e.allowedDomains || [],
                widgetSession: e.widgetSession,
                callback: e.callback || null,
                communityURL: SFIDWidget.config.communityURL,
                active: e.active,
                community: e.community,
                mydomain: e.mydomain,
                activeonly: e.activeonly,
                retainhint: e.retainhint
            })
        },
        getToken: function(e) {
            i({
                cmd: "sfdcxauth::retrieve",
                retrieve: (e = e || {}).retrieve || null,
                callback: e.callback || null
            })
        },
        expireToken: function(e) {
            e = e || {};
            var t = null;
            SFIDWidget.openid_response && SFIDWidget.openid_response.organization_id && SFIDWidget.openid_response.user_id && (t = SFIDWidget.openid_response.organization_id.substring(0, 15) + SFIDWidget.openid_response.user_id.substring(0, 15)), i({
                cmd: "sfdcxauth::expire",
                callback: e.callback || null,
                storageKey: t
            })
        },
        isAlive: function(e) {
            i({
                cmd: "sfdcxauth::alive",
                retrieve: (e = e || {}).retrieve || null,
                callback: e.callback || d
            })
        },
        disabled: unsupported
    }
}();

function SFIDWidgetHandleOpenIDCallback(e) {
    e.user_id = e.user_id.substring(0, 15), e.organization_id = e.organization_id.substring(0, 15), SFIDWidget.openid_response = e, console.log(SFIDWidget.openid_response), SFIDWidget.config.saveToken && !SFIDWidget.config.serverCallback && (SFIDWidget.openid_response.access_token = SFIDWidget.access_token);
    var t = btoa(JSON.stringify(e)),
        n = {};
    n.uid = e.user_id, n.username = e.username, n.thumbnail = e.photos ? e.photos.thumbnail : "", n.oid = e.organization_id, n.instance = SFIDWidget.config.communityURL, n.ll = e.is_lightning_login_user, SFIDWidget.setToken({
        uid: e.user_id,
        oid: e.organization_id,
        callback: SFIDWidget.redirectToStartURL,
        identity: n,
        expire: (new Date).getTime() + 1e5,
        active: !1,
        mydomain: !!e.urls.custom_domain,
        community: !0,
        activeonly: !0,
        retainhint: !1,
        widgetSession: SFIDWidget.config.logoutOnBrowserClose,
        allowedDomains: SFIDWidget.config.allowedDomains,
        identityServiceResponse: t
    })
}

function SFIDWidgetHandleRevokeCallback(e) {
    null != e.error ? console.log("access token was already invalid") : console.log("access token was revoked")
}

function SFIDWidgetHandleExpireCallback(e) {
    console.log("xauth token was expired: " + e), SFIDWidget.access_token = null, SFIDWidget.openid = null, SFIDWidget.openid_response = null, SFIDWidget.config = null, SFIDWidget.authconfig = null, window[SFIDWidget_logoutHandler]()
}
SFIDWidget.init();



        /*
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

        /**
            History
            2010-04-27
            Overcommenting
            -jianshen
            2010-04-16
            Added in checks for disabled and blocked tokens
            -jianshen

            2010-03-26
            First version of xauth server code
            -Jian Shen, Meebo
        **/
        ! function() {
            var e = window;
            if (e.top !== e && e.postMessage && function(e) {
                    try {
                        var t = window[e],
                            i = "__storage_test__";
                        return t.setItem(i, i), t.removeItem(i), !0
                    } catch (e) {
                        return e instanceof DOMException && (22 === e.code || 1014 === e.code || "QuotaExceededError" === e.name || "NS_ERROR_DOM_QUOTA_REACHED" === e.name) && 0 !== t.length
                    }
                }("localStorage") && e.JSON) {
                var t = e.localStorage,
                    i = null,
                    n = document.cookie.match(/(?:^|;)\s*widgetSession=(\d+)(?:;|$)/);
                n && n.length && (i = n[1]), i || (i = (new Date).getTime().toString(), document.cookie = "widgetSession=" + i + "; ");
                var r = {
                    "sfdcxauth::extend": function(e, n) {
                        if (d("entering xauth extend function"), ! function(e, t) {
                                if (!e.uid || !l(e.uid, "005") || e.uid.length < 15) return u(e, "No uid", t), !1;
                                if (!e.oid || !l(e.oid, "00D") || e.oid.length < 15) return u(e, "No oid", t), !1;
                                if (!e.identity) return u(e, "No identity", t), !1; {
                                    if (!e.identity.instance) return u(e, "No instance URL", t), !1;
                                    var i = e.identity.instance;
                                    if (!(i && i.length > 6)) return u(e, "Short instance URL", t), !1;
                                    var n = i.substring(0, 6);
                                    if ("http:/" !== n && "https:" !== n) return u(e, "Bad instance URL", t), !1
                                }
                                if (!e.identityServiceResponse) return u(e, "Invalid identityServiceResponse", t), !1;
                                if ("number" != typeof e.expire || Math.floor(e.expire) !== e.expire) return u(e, "Invalid Expiration", t), !1;
                                if (!e.allowedDomains || !e.allowedDomains.length) return u(e, "No allowedDomains List Specified", t), !1;
                                return !0
                            }(n, e)) return null;
                        n.uid = n.uid.substring(0, 15), n.oid = n.oid.substring(0, 15);
                        var r = n.oid + n.uid,
                            o = t.getItem(r),
                            s = o ? JSON.parse(o) : {
                                identity: n.identity,
                                expire: n.expire,
                                active: n.active,
                                lastused: (new Date).getTime(),
                                mydomain: n.mydomain,
                                community: n.community,
                                activeonly: n.activeonly,
                                retainhint: n.retainhint,
                                allowedDomains: n.allowedDomains,
                                identityServiceResponse: n.identityServiceResponse
                            };
                        return o && (s.allowedDomains = n.allowedDomains, s.identityServiceResponse = n.identityServiceResponse), !0 === n.widgetSession && (s.widgetSession = i), t.setItem(r, JSON.stringify(s)), {
                            cmd: n.cmd,
                            id: n.id
                        }
                    },
                    "sfdcxauth::retrieve": function(e, t) {
                        d("entering xauth retrieve function");
                        var i = s(t, e);
                        return !1 === (1 === Object.keys(i).length) && (i = {}), o(i), {
                            cmd: t.cmd,
                            id: t.id,
                            identityServiceResponses: i
                        }
                    },
                    "sfdcxauth::alive": function(e, t) {
                        c(t.id, "entering xauth alive function");
                        var i = s(t, e),
                            n = 1 === Object.keys(i).length;
                        return o(i), {
                            cmd: t.cmd,
                            id: t.id,
                            alive: n
                        }
                    },
                    "sfdcxauth::expire": function(e, i) {
                        return d("entering xauth expire function"), t.removeItem(i.storageKey), {
                            cmd: i.cmd,
                            id: i.id
                        }
                    }
                };
                e.addEventListener ? e.addEventListener("message", f, !1) : e.attachEvent && e.attachEvent("onmessage", f), e.parent.postMessage(JSON.stringify({
                    cmd: "sfdcxauth::ready"
                }), "*")
            }

            function o(e) {
                if (!(Object.keys(e).length <= 1))
                    for (var i in e) t.removeItem(i)
            }

            function s(e, i) {
                var n = {};
                if (e.retrieve && e.retrieve.length)
                    for (var r = 0; r < e.retrieve.length; r += 1) {
                        var o = e.retrieve[r],
                            s = t.getItem(o);
                        a(o, s ? JSON.parse(s) : null, i, n)
                    } else
                        for (var d = t.length - 1; d >= 0; d -= 1) {
                            var c = t.key(d);
                            if ("00D" === c.substring(0, 3) && "005" === c.substring(15, 18)) {
                                var u = t.getItem(c);
                                a(c, u ? JSON.parse(u) : null, i, n)
                            }
                        }
                return n
            }

            function a(e, n, r, o) {
                if (n && !n.block && (function(e, t) {
                        if (!e.allowedDomains) return !1;
                        for (var i = 0; i < e.allowedDomains.length; i += 1) {
                            var n = e.allowedDomains[i];
                            if (n === t) return !0;
                            if (0 === n.indexOf("*.")) {
                                var r = n.substring(2, n.length);
                                if (s = r, -1 !== (o = t).indexOf(s, o.length - s.length)) return !0
                            }
                        }
                        var o, s;
                        return !1
                    }(n, r) && n.identityServiceResponse)) {
                    if (function(e, n) {
                            if (n.widgetSession && n.widgetSession !== i) return t.removeItem(e), !0;
                            return !1
                        }(e, n)) return;
                    o[e] = {
                        identityServiceResponse: n.identityServiceResponse
                    }
                }
            }

            function d(t) {
                e.console && e.console.log && e.console.log(t)
            }

            function c(e, t) {
                e && e % 100 == 0 && d(t)
            }

            function u(t, i, n) {
                t && "number" == typeof t.id && e.console && e.console.log && e.console.log(t.cmd + " Error: " + i)
            }

            function l(e, t, i) {
                return String.prototype.startsWith ? e.startsWith(t) : (i = i || 0, e.indexOf(t, i) === i)
            }

            function f(i) {
                var n;
                if ("string" == typeof i.data && (n = JSON.parse(i.data)), n && n.cmd && "string" == typeof n.cmd) {
                    var o, s, a = i.origin.split("://")[1].split("/")[0];
                    if (n && "object" == typeof n && n.cmd && void 0 !== n.id && "1" !== t.getItem("disabled.xauth.org")) "sfdcxauth::alive" === n.cmd && c(n.id, i.data), r[n.cmd] && (o = r[n.cmd](a, n), s = i.origin, o && "number" == typeof o.id && e.parent.postMessage(JSON.stringify(o), s))
                }
            }
        }();