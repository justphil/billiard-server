"use strict";

var http = require('../helper/http');

function Users(dbConfig) {
    this.dbConfig = dbConfig;
}

Users.prototype.findUserByOAuthProviderAndOAuthId = function(oAuthProvider, oAuthId) {
    var urlPath = '/_design/users/_view/by_oauth_provider_and_id'
                        + '?key=["'+oAuthProvider+'","'+oAuthId+'"]'
                        + '&include_docs=true';
    return http.get(this.dbConfig.getUrl() + urlPath).then(function(r) {
        if (r.response.statusCode === 200) {
            if (r.body.rows.length > 0) {
                return r.body.rows[0].doc;
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

Users.prototype.findUserById = function(userId) {
    var urlPath = '/' + userId;

    return http.get(this.dbConfig.getUrl() + urlPath).then(function(r) {
        if (r.response.statusCode === 200) {
            return r.body;
        }
        else if (r.response.statusCode === 404) {
            return null;
        }
        else {
            throw new Error('An error occurred during data retrieval: ' + JSON.stringify(r.body));
        }
    });
};

Users.prototype.normalizeUserDoc = function(profile) {
    return {
        type:           'user',
        oAuthProvider:  profile.oAuthProvider,
        oAuthId:        profile.oAuthId,
        displayName:    profile.displayName || '',
        name:           profile.name || {},
        emails:         profile.emails || [],
        photos:         profile.photos || []
    };
};

Users.prototype.createUser = function(user) {
    return http.post(this.dbConfig.getUrl(), user).then(function(r) {
        if (r.response.statusCode === 201) {
            // enhance the user object with the id that couchdb has generated
            user._id = r.body.id;
            return user;
        }

        throw new Error('An error occurred while creating user.');
    });
};

Users.prototype.processOAuthLogin = function(oAuthProvider, oAuthId, profile) {
    var that = this,
        user;

    return this.findUserByOAuthProviderAndOAuthId(oAuthProvider, oAuthId).then(function(userFromDb) {
        if (userFromDb !== null) {
            console.log('User is well known!', userFromDb);
            return userFromDb;
        }
        else {
            profile.oAuthProvider = profile.oAuthProvider || oAuthProvider;
            profile.oAuthId = profile.oAuthId || oAuthId + '';
            user = that.normalizeUserDoc(profile);
            return that.createUser(user);
        }
    });
};

module.exports = function(dbConfig) {
    return new Users(dbConfig);
};
