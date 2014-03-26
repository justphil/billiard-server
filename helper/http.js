"use strict";

var Q = require('q'),
    request = require('request');

var wrappedRequest = function(options) {
    var deferred = Q.defer();

    request(options, function(error, response, body) {
        if (error) {
            deferred.reject(error);
        }
        else {
            var b = body;
            if (typeof body !== 'object') {
                b = JSON.parse(body);
            }

            deferred.resolve({
                response: response,
                body: b
            });
        }
    });

    return deferred.promise;
};

['get', 'post', 'put', 'delete', 'head', 'patch'].forEach(function(fnName) {
    if (!wrappedRequest.hasOwnProperty(fnName)) {
        wrappedRequest[fnName] = function(url, json) {
            if (json) {
                return wrappedRequest({
                    method: fnName.toUpperCase(),
                    url: url,
                    json: json
                });
            }
            else {
                return wrappedRequest({
                    method: fnName.toUpperCase(),
                    url: url
                });
            }
        };
    }
});

module.exports = wrappedRequest;
