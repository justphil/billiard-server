"use strict";

module.exports = {
    users: {
        by_oauth_id: {
            map: function(doc) {
                if (doc.oAuthId) {
                    emit(doc.oAuthId, null);
                }
            }.toString()
        },
        by_id: {
            map: function(doc) {
                emit(doc._id, null);
            }.toString()
        }
    },
    games: {
        by_id: {
            map: function(doc) {
                emit(doc._id, null);
            }.toString()
        }
    }
};
