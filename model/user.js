"use strict";

const request = require('request');

function findUserByOAuthProviderAndOAuthId(oAuthProvider, oAuthId) {
    return {
        test: 'Provider: ' + oAuthProvider + ', Id: ' + oAuthId
    };
}

module.exports = findUserByOAuthProviderAndOAuthId;
