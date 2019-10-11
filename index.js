var express = require('express');
var path = require('path');
const PORT = process.env.PORT || 5000;
const COMMUNITY_URL = process.env.COMMUNITY_URL;
const APP_ID = process.env.APP_ID;
const OAUTH_CALLBACK_URL = process.env.OAUTH_CALLBACK_URL;
const HOSTED_APP_URL = process.env.HOSTED_APP_URL;

//Set up App
var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(__dirname + '/public'));

//Routes
app.get('/', function(req, res){ 
    res.render('index', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        user: "Dudebro"
    }) 
}); 

app.get('/oauth_callback', function(req, res){ 
    res.render('callback', {
        community_url: COMMUNITY_URL,
        app_id: APP_ID,
        callback_url: OAUTH_CALLBACK_URL,
        hosted_app_url: HOSTED_APP_URL
    }) 
}); 

//Run
app.listen(PORT, function () {
  console.log('We\'re live on the magic listening action of port ' + PORT + '!');
});