"use strict";

const
    passport        = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    createUsersDAO  = require('../model/users');

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

    // tell express app to use passport
    expressApp.use(passport.initialize());
    expressApp.use(passport.session());

    return passport;
}

module.exports = initPassport;
