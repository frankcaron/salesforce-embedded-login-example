const PORT = process.env.PORT || 5000;
const COMMUNITY_URL = process.env.COMMUNITY_URL;
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const OAUTH_CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;
const HOSTED_APP_URL = process.env.HOSTED_APP_URL;
const BG_FAKE = process.env.BG_FAKE;

var express = require('express');
var path = require('path');
var app = express();
var cookieParser = require('cookie-parser');
var request = require('request-promise');

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
        background: BG_FAKE
    }) 
}); 

app.get('/_callback', function(req, res){ 
    res.render('callback', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        hosted_app_url: HOSTED_APP_URL
    }) 
}); 

app.get('/server_callback', function(req, res){ 

    const body = {
        "code": decodeURI(req.query.code),
        "grant_type": "authorization_code",
        "client_id": APP_ID,
        "client_secret": APP_SECRET,
        "redirect_uri": OAUTH_CALLBACK_URL

    }

    const startURL = decodeURI(req.state);
    
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
        console.log(res.status(200).json(response));
    })
    .catch(function (err) {
        console.log(err);
    })

}); 

//Run
app.listen(PORT, function () {
  console.log('We\'re live on the magic listening action of port ' + PORT + '!');
});