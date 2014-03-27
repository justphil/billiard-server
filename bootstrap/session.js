"use strict";

const
    express     = require('express'),
    redisClient = require('redis').createClient(),
    RedisStore  = require('connect-redis')(express);

module.exports = function(config, expressApp) {
    expressApp.use(express.cookieParser());
    expressApp.use(express.session({
        secret: config.appSecret,
        store: new RedisStore({
            client: redisClient
        })
    }));

    return expressApp;
};
