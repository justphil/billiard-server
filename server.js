#!/usr/bin/env node --harmony

"use strict";
const
    config = require('./config/dev'),
    User = require('./model/user'),
    http = require('./helper/http'),
    request = require('request'),
    express = require('express'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    app = express(),
    redisClient = require('redis').createClient(),
    RedisStore = require('connect-redis')(express);

var setupDb = require('./db-tools/setup')(config.db);


// serialize and deserialize
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// setup twitter strategy
passport.use(new TwitterStrategy({
        consumerKey: config.oAuth.twitter.consumerKey,
        consumerSecret: config.oAuth.twitter.consumerSecret,
        callbackURL: config.oAuth.twitter.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));

app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.session({
    secret: config.appSecret,
    store: new RedisStore({
        client: redisClient
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// configure static resources
app.use(express.static(__dirname + '/public'));

// configure routes for twitter login / callback
app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {});
app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/twitter_login_successful.html');
    }
);

app.get('/api/:name', function(req, res) {
    var dbUrl = config.db.getUrl();

    console.log('### dbUrl', dbUrl);

    http.get(dbUrl).then(function(httpRes) {
        res.json(200, httpRes.data);
    }, function(err) {
        console.log('error function called');
        res.json(200, { hello: err });
    }).done();
});

setupDb.then(function() {
    app.listen(3000, function(){
        console.log('Ready to rock on port 3000!');
    });
});
