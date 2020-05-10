# Salesforce Embedded Log In Example

This is a simple reference implementation of Salesforce Embedded Log In, which leverages Salesforce Identity for Customers & Partners (our CIAM) to allow customers to delegate the rote but difficult work of secure authentication and user data storage / retrieval in pursuit of a 360 degree view of their customer.

You can check out the official reference implementation (written in PHP) [here](https://github.com/salesforceidentity/embedded-login-example). You'll also want to refer to the [Salesforce External Identity Implementation Guide](https://developer.salesforce.com/docs/atlas.en-us.externalidentityImplGuide.meta/externalidentityImplGuide/external_identity_intro.htm) to set up this org or complete the [Identity for Customers](https://trailhead.salesforce.com/en/content/learn/modules/identity_external) Trailhead module.

This off-shoot and argulably more fancy example, if and when it ever works, has been built with Node, Express, and EJS. 

Because I'm going to be using this for demos of the tech to customers, I've done one other little thing that'll be handy for the Solution Engineers at Salesforce. Rather than rely on a bunch of front-end code to represent the target integrated website, I've built a little bit of demo magic: the app takes a screenshot URL and uses that as the backdrop of the UX. This makes setting up a real implementation that is also quite convincing super easy.

# Prereqs

You will need:

* A Heroku account
* A Salesforce developer org with a Connected App and Lightning Community set up for Embedded Login
* A little bit of imagination

# Salesforce Connected App Set Up
Follow the instructions [here](https://developer.salesforce.com/docs/atlas.en-us.externalidentityImplGuide.meta/externalidentityImplGuide/external_identity_login_step_2.htm) for setting up a connected app. Make sure that you also select the 'Access and manage your data (api)' OAuth scope since we will be querying user data from the org. When configuring your connected app, use the URL `https://<yourherokuapp>.herokuapp.com/server_callback` for the call back. 

There are also four critical additional customizations you need to make:
* Make sure your custom profile for the external user has API access enabled.
* Add a custom attribute to the connected app for the contact associated with the user record using the attribute name `ContactID`.
* In this specific example, the code assumes there are three custom objects associated with the Contact: Wishes (Wish__c), Searches (Searches__c), and the external object Bookings (Bookings__x, referencing a field called `CustomerId` on the Contact). Your profile will need read for all of these.
* The community you are using should have it's 'Login Page Type' configured as the 'Default Page'. This can be set in the Community Builder Administration menu under the Login & Registration sub-menu item.

# Heroku Environment Variables

Once you've done that, you'll need to define a set of environment variables in your Heroku app:
* The Consumer Key for your Salesforce Connected App is set as the environment variable `APP_ID`
* The Connected App Consumer Secret is set as the environment variable `APP_SECRET`
* The environment variable `COMMUNITY_URL` with... well, you can probably guess. Don't include the /s/.
* `OAUTH_CALLBACK_URL` is your Heroku app's fully-qualified callback URL. Just change the base URL.
* `HOSTED_APP_URL_PROD` is your Heroku app's base URL without a trailing slash.
* `BG_FAKE` is replaced with a picture of your chosen existing website for the background. 

You'll also need to take the `sfdc_authmagic.js` file and upload it as public static content to your Salesforce org. The fully-qualified URL should be then filled into the final environment `STATIC_ASSET_URL`. This is a temporary measure until a prod bug is fixed.

# Tweaking the Front-End

You can modify the template code in `index.ejs` and `profile.ejs` to tweak things as desired. 

Both the back-end route handler for `profile` and the front end template `profile.ejs` have been customized for my first specific demo, but you can easily replace this code to pull whatever contact-related data you want from Salesforce for the load of the profile. The back-end code uses jsforce (though with the way I'm using it, it should be called bruteforce.) 

Just make sure your user profile has read-write to the appropriate related records, and if you're using an External Object, like I am, make sure each field is accessible to the External user. ;)

# Heroku Button

[![One-Click Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

# To Do

* Fix logout
* Refactor to remove bespoke Embedded Login js file once the prod issue is patched
* Add session management or cooking on the server side to allow more than one person to demo at a time, haha.

# Thanks

Big thanks to Ben Richards for teaching me that good builds can do more than decks ever could, and Salesforce Identity guru Chuck Mortimore for helping with the prod issues.
