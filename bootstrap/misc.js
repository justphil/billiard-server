"use strict";

const express = require('express');

module.exports = function(expressLogLevel, pathToStaticResources) {
    var app = express();

    console.log('pathToStaticResources ->', pathToStaticResources);

    app.use(express.logger(expressLogLevel));
    app.use(express.static(pathToStaticResources));

    return app;
};
