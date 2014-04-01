"use strict";

module.exports = function(app, passport) {
    app.get('/auth/google', passport.authenticate('google'));
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/google_login_successful.html',
        failureRedirect: '/'
    }));
};
