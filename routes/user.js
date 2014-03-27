"use strict";

module.exports = function(app) {
    app.get('/api/:name', function(req, res) {
        res.json(200, { foo: 'bar' });
    });
};
