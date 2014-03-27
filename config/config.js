"use strict";

var nconf = require('nconf'),
    fs = require('fs');

function setConfigByArguments(nc) {
    nc = nc || nconf;
    return nc.argv();
}

function setConfigByEnvironmentVariables(nc) {
    nc = nc || nconf;
    return nc.env();
}

function setConfigByFile(nc, processArgv) {
    nc = nc || nconf;
    var i, n, configPath;

    for (i = 2, n = processArgv.length; i < n; i++) {
        if (processArgv[i] === '--config' && processArgv[i+1]) {
            configPath = processArgv[i+1];
        }
    }

    if (!configPath || !fs.existsSync(configPath)) {
        configPath = './config/config_default.json';
    }

    return nc.file({ file: configPath });
}

function initConfig(processArgv) {
    setConfigByArguments(nconf);
    setConfigByEnvironmentVariables(nconf);
    setConfigByFile(nconf, processArgv);

    var config = nconf.get('data');
    config.db.getUrl = function() {
        return config.db.baseUrl + config.db.name;
    };

    return config;
}

module.exports = function(processArgv) {
    return initConfig(processArgv);
};
