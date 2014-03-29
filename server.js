#!/usr/bin/env node --harmony
"use strict";

const
    initConfig      = require('./config/config'),
    initCouchDb     = require('./db-tools/setup'),
    initExpressApp  = require('./bootstrap/misc'),
    initSession     = require('./bootstrap/session'),
    initPassport    = require('./bootstrap/passport');

const
    config              = initConfig(process.argv),
    initCouchDbPromise  = initCouchDb(config.db),
    app                 = initSession(config, initExpressApp('dev', __dirname + '/public')),
    passport            = initPassport(config, app);

// configure routes
require('./routes/auth_twitter')(app, passport);
require('./routes/auth_facebook')(app, passport);
require('./routes/auth_github')(app, passport);
require('./routes/user')(app);

// start listening to requests when db setup is finished
initCouchDbPromise.then(function() {
    app.listen(3000, function() {
        console.log('Ready to rock on port 3000!');
    });
}).catch(function(e) {
    console.log('An error occurred during server startup', e);
});
