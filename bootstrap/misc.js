"use strict";

const express = require('express');

module.exports = function(expressLogLevel, pathToStaticResources) {
    var app = express();

    app.use(express.logger(expressLogLevel));
    app.use(express.static(pathToStaticResources));

    return app;
};
