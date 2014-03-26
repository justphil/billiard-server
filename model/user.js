"use strict";

var http = require('../helper/http');

function Users(dbConfig) {
    this.dbConfig = dbConfig;
}

Users.prototype.findUserByOAuthProviderAndOAuthId = function(oAuthProvider, oAuthId) {
    var urlPath = '/_design/users/_view/by_oauth_provider_and_id?key=["'+oAuthProvider+'",'+oAuthId+']';
    return http.get(this.dbConfig.getUrl() + urlPath).then(function(r) {
        if (r.response.statusCode === 200) {
            if (r.body.rows.length > 0) {
                return r.body.rows[0].id;
            }
            else {
                return null;
            }
        }
        else if (r.response.statusCode === 404) {
            return null;
        }
        else {
            throw new Error('An error occurred during data retrieval: ' + JSON.stringify(r.body));
        }
    });
};

Users.prototype.createUser = function(user) {
    user.type = user.type || 'user';
    return http.post(this.dbConfig.getUrl(), user).then(function(r) {
        if (r.response.statusCode === 201) {
            return r.body.id;
        }

        throw new Error('An error occurred while creating user.');
    });
};

Users.prototype.processOAuthLogin = function(oAuthProvider, oAuthId, user) {
    var that = this;

    return this.findUserByOAuthProviderAndOAuthId(oAuthProvider, oAuthId).then(function(userId) {
        if (userId !== null) {
            return userId;
        }
        else {
            user.oAuthProvider = user.oAuthProvider || oAuthProvider;
            user.oAuthId = user.oAuthId || oAuthId;
            return that.createUser(user);
        }
    });
};

module.exports = function(dbConfig) {
    return new Users(dbConfig);
};
