"use strict";

const
    passport            = require('passport'),
    TwitterStrategy     = require('passport-twitter').Strategy,
    FacebookStrategy    = require('passport-facebook').Strategy,
    GithubStrategy      = require('passport-github').Strategy,
    GoogleStrategy      = require('passport-google').Strategy,
    createUsersDAO      = require('../model/users');

function initPassport(config, expressApp) {
    var Users = createUsersDAO(config.db);

    // serialize and deserialize
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (userId, done) {
        Users.findUserById(userId).then(function (user) {
            done(null, user);
        }).catch(function (e) {
            done(e);
        });
    });

    // setup twitter strategy
    passport.use(new TwitterStrategy(
        {
            consumerKey:    config.oAuth.twitter.consumerKey,
            consumerSecret: config.oAuth.twitter.consumerSecret,
            callbackURL:    config.oAuth.twitter.callbackURL
        },
        function (accessToken, refreshToken, profile, done) {
            Users.processOAuthLogin(profile.provider, profile.id, profile).then(function (user) {
                console.log('Twitter login successful', user);
                done(null, user);
            }).catch(function (e) {
                console.log('Twitter login failed', e);
                done(e);
            });
        }
    ));

    // setup facebook strategy
    passport.use(new FacebookStrategy(
        {
            clientID: config.oAuth.facebook.clientID,
            clientSecret: config.oAuth.facebook.clientSecret,
            callbackURL: config.oAuth.facebook.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            Users.processOAuthLogin(profile.provider, profile.id, profile).then(function (user) {
                console.log('Facebook login successful', user);
                done(null, user);
            }).catch(function (e) {
                console.log('Facebook login failed', e);
                done(e);
            });
        }
    ));

    // setup github strategy
    passport.use(new GithubStrategy(
        {
            clientID: config.oAuth.github.clientID,
            clientSecret: config.oAuth.github.clientSecret,
            callbackURL: config.oAuth.github.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            Users.processOAuthLogin(profile.provider, profile.id, profile).then(function (user) {
                console.log('Github login successful', user);
                done(null, user);
            }).catch(function (e) {
                console.log('Github login failed', e);
                done(e);
            });
        }
    ));

    // setup google strategy
    passport.use(new GoogleStrategy(
        {
            returnURL: config.oAuth.google.returnURL,
            realm: config.oAuth.google.realm
        },
        function(identifier, profile, done) {
            Users.processOAuthLogin('google', identifier, profile).then(function (user) {
                console.log('Google login successful', user);
                done(null, user);
            }).catch(function (e) {
                console.log('Google login failed', e);
                done(e);
            });
        }
    ));

    // tell express app to use passport
    expressApp.use(passport.initialize());
    expressApp.use(passport.session());

    return passport;
}

module.exports = initPassport;
