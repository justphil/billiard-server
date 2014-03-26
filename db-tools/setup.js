"use strict";

var http  = require('../helper/http'),
    views = require('./views'),
    indent= ' -- ';

function log(msg, indentCount) {
    var n = indentCount || 0,
        i,
        str = '';

    for (i = 0; i < n; i++) {
        str = str + indent;
    }

    console.log(str + msg);
}

function setupDatabase(dbConfig) {
    return http.get(dbConfig.getUrl()).then(function(r) {
        return r.response.statusCode === 200;
    }).then(function(dbAvailable) {
        if (dbAvailable) {
            return 'dbAvailable';
        }
        else {
            log('Database "'+dbConfig.name+'" is about to be created...', 2);
            return http.put(dbConfig.getUrl());
        }
    }).then(function(r) {
        if (r === 'dbAvailable') {
            log('Database "'+dbConfig.name+'" has already been created! Therefore skipping creation.', 2);
        }
        else {
            if (r.response.statusCode === 201) {
                log('Database "'+dbConfig.name+'" has been successfully created.', 2);
            }
        }
    });
}

function setupViewsOfDesignDoc(dbConfig, designDocName, designDocObj) {
    return http.get(dbConfig.getUrl() + '/_design/' + designDocName).then(function(r) {
        if (r.response.statusCode === 200) {
            log('Design document "'+designDocName+'" will be updated.', 3);
            return r.body;
        }
        else if (r.response.statusCode === 404) {
            log('Design document "'+designDocName+'" will be created.', 3);
            return { views: {} };
        }
        else {
            throw new Error('Unexpected status code: ' + r.response.statusCode);
        }
    }).then(function(body) {
        Object.keys(designDocObj).forEach(function(viewName) {
            body.views[viewName] = views[designDocName][viewName];
        });

        return http.put(dbConfig.getUrl() + '/_design/' + designDocName, body);
    });
}

function setupViews(dbConfig) {
    log('Executing view setup routine...', 2);

    var promiseToReturn, i, n,
        designDocs = Object.keys(views);

    if (designDocs.length > 0) {
        promiseToReturn = setupViewsOfDesignDoc(dbConfig, designDocs[0], views[designDocs[0]]);
        if (designDocs.length > 1) {
            for (i = 1, n = designDocs.length; i < n; i++) {
                (function(i) {
                    promiseToReturn = promiseToReturn.then(function() {
                        return setupViewsOfDesignDoc(dbConfig, designDocs[i], views[designDocs[i]]);
                    });
                })(i);
            }
        }
    }

    if (!promiseToReturn) {
        log('Executing view setup routine...DONE!', 2);
    }
    else {
        promiseToReturn.then(function() {
            log('Executing view setup routine...DONE!', 2);
        });
    }

    return promiseToReturn;
}

function setup(dbConfig) {
    log('Executing DB setup routine...', 1);
    return setupDatabase(dbConfig).then(function() {
        return setupViews(dbConfig);
    })
    .then(function() {
        log('Executing DB setup routine...DONE!', 1);
    })
    .catch(function(e) {
        log('An error occurred during DB setup routine: ' + JSON.stringify(e), 1);
        process.exit(1);
    });
}

module.exports = setup;
