const PORT = process.env.PORT || 5000;
const COMMUNITY_URL = process.env.COMMUNITY_URL;
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const OAUTH_CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;
const HOSTED_APP_URL = process.env.HOSTED_APP_URL;
const BG_FAKE = process.env.BG_FAKE;
const STATIC_ASSET_URL = process.env.STATIC_ASSET_URL;

var express = require('express');
var path = require('path');
var app = express();
var cookieParser = require('cookie-parser');
var request = require('request-promise');
var jsforce = require('jsforce');

//App vars
var refreshToken = "";
var accessToken = "";
var sessionContact = "";

//Set up App
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

//Routes
app.get('/', function(req, res){ 

    res.render('index', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        background: BG_FAKE,
        static_asset_url: STATIC_ASSET_URL
    }) 
}); 

app.get('/profile', function(req, res){ 

    // Check loken
    console.log("Profile Render: Double-checking access is valid. Session equals " + accessToken)

    // Redirect if the access token is missing
    if(accessToken == null || accessToken == "") {
        res.redirect('/');
    }

    //Proceed with it then
    var conn = new jsforce.Connection({
        instanceUrl : COMMUNITY_URL,
        accessToken : accessToken
    });

    console.log("Profile Render: Fetching profile information...")

    //Grab Contact
    var contactRecords = [];
    var bookingRecords = [];
    var searchRecords = [];
    var wishes = [];

    //Grab Contact
    conn.query("SELECT Id, FirstName, LastName, Phone, Email, customerID__c FROM Contact WHERE Id = '" + sessionContact + "'", function(err, result) {
        if (err) { return console.error(err); }
        console.log("Profile Render: Contact result size is " + result.totalSize);
        console.log("Profile Render: Number of contacts found is " + result.records.length);

        contactRecords = result.records;
        console.log("Profile Render: Contact retrieved " + JSON.stringify(contactRecords));
        console.log("Profile Render: Contact has external ID of " + contactRecords[0].customerID__c);

        //Grab Wishlist
        conn.query("SELECT Contact__c,CreatedDate,Id,Wish_Detail__c FROM Wish__c WHERE Contact__c = '" + sessionContact + "'", function(err, result) {
            if (err) { return console.error(err); }
            console.log("Profile Render: Wishlist result size is " + result.totalSize);
            console.log("Profile Render: Number of wishes found is " + result.records.length);
    
            wishes = result.records;
            console.log("Profile Render: wishes retrieved " + JSON.stringify(wishes));

            //Grab Searches
            conn.query("SELECT Contact__c,CreatedDate,Id,Location__c FROM Searches__c WHERE Contact__c = '" + sessionContact + "'", function(err, result) {
                if (err) { return console.error(err); }
                console.log("Profile Render: Search result size is " + result.totalSize);
                console.log("Profile Render: Number of searches found is " + result.records.length);
        
                searchRecords = result.records;
                console.log("Profile Render: Searches retrieved " + JSON.stringify(searchRecords));

                //Grab Bookings
                conn.query("SELECT DisplayUrl, ExternalId, numTickets__c, tourDate__c, tourId__c, tourType__c FROM bookings__x WHERE customerId__c = '" + contactRecords[0].customerID__c + "' LIMIT 50", function(err, result) {
                    if (err) { return console.error(err); }
                    console.log("Profile Render: Bookings result size is " + result.totalSize);
                    console.log("Profile Render: Number of bookings found is " + result.records.length);
            
                    bookingRecords = result.records;
                    console.log("Profile Render: Bookings retrieved " + JSON.stringify(bookingRecords));


                    //Render the page once records are fetched
                    res.render('profile', {
                        community_url: COMMUNITY_URL,
                        app_id: APP_ID,
                        callback_url: OAUTH_CALLBACK_URL,
                        background: BG_FAKE,
                        static_asset_url: STATIC_ASSET_URL,
                        contactRecords: contactRecords,
                        bookingRecords: bookingRecords,
                        searchRecords: searchRecords,
                        wishes: wishes
                    }) 
        
                });
        
            });
    
        });

    });

}); 

app.get('/_callback', function(req, res){ 

    res.render('callback', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        hosted_app_url: HOSTED_APP_URL,
        static_asset_url: STATIC_ASSET_URL
    }) 
}); 

app.get('/server_callback', function(req, res){ 

    console.log("Server Callback query: "+ JSON.stringify(req.query));

    console.log("Server Callback: Requesting the access token...");

    //Parse query string

    var code = req.query.code;
    if (req.query.code != null) {
        code = decodeURI(code);
    } else {
        //If there is no auth code, such as after registration, 
        //then redirect back to main page and let them log in
        res.redirect('/');
    }

    var startURL = req.query.state;
    if (req.query.state != null) {
        startURL = decodeURI(startURL);
    }

    //Set up request body
    const body = {
        "code": code,
        "grant_type": "authorization_code",
        "client_id": APP_ID,
        "client_secret": APP_SECRET,
        "redirect_uri": OAUTH_CALLBACK_URL
    }
    
    //Set up Callback
    const options = {
        method: 'POST',
        uri: COMMUNITY_URL + '/services/oauth2/token',
        form: body,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    request(options).then(function (response){

        console.log("Server Callback: Retrieved the access token successfully.");

        //Parse response
        responseJSON = JSON.parse(response);

        console.log("Server Callback: Payload is..." + JSON.stringify(responseJSON));
        
        var idToken = responseJSON.id_token;
        var identity = responseJSON.id;

        //Update refresh token
        accessToken = responseJSON.access_token;
        refreshToken = responseJSON.refresh_token;

        console.log("Server Callback: Requesting the identity data...");
        
        //Set up Callback
        const options = {
            method: 'GET',
            uri: identity + '?version=latest',
            body: body,
            json: true,
            followAllRedirects: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            }
        }

        request(options).then(function (response){
            
            console.log("Server Callback: Retrieved identity data successfully.");
            console.log("Server Callback: Creating redirect page.");

            var JSONresponse = JSON.stringify(response);

            console.log("Server Callback Identity Response: " + JSONresponse);
            sessionContact = response.custom_attributes.ContactID;

            res.render('server_callback', {
                community_url: COMMUNITY_URL,
                app_id: APP_ID,
                callback_url: OAUTH_CALLBACK_URL,
                start_url: startURL,
                hosted_app_url: HOSTED_APP_URL,
                static_asset_url: STATIC_ASSET_URL,
                identity_response: Buffer.from(JSONresponse).toString("base64")
            }) 

        })

        .catch(function (err) {
            console.log(err);
        })

    })
    .catch(function (err) {
        console.log(err);
    })

}); 


app.get('/logout', function(req, res){ 

    //Clear persisted tokens
    accessToken = "";
    refreshToken = "";
    sessionContact = "";

    //
    res.render('logout', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        background: BG_FAKE,
        static_asset_url: STATIC_ASSET_URL
    }) 

}); 


//Run
app.listen(PORT, function () {
  console.log('We\'re live on the magic listening action of port ' + PORT + '!');
});