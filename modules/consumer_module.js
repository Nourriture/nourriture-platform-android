/**
 * Created by Pavel Prochazka on 23/10/14.
 * Module for consumer specific API calls.
 */

var restify = require('restify');

// Mock customer database
var customers = [
    {
        id: 0,
        name: "nielssj",
        fullname: "Niels Jensen",
        email: "nm@9la.dk"
    },
    {
        id: 1,
        name: "ctverecek",
        fullname: "Pavel Prochazka",
        email: "pprochazka72@gmail.com"
    }
];

module.exports = function (server, models) {

    // Create - Customer profile
    server.post('/consumer/:name', function(req, res, next) {
        if (req.body) {
            customers.push(req.body);
            res.send(req.body);
            next();
        } else {
            next(new restify.InvalidContentError("No user submitted for creation"));
        }
    });


    // Read - Customer profile
    server.get('/consumer/:id', function(req, res, next) {
        for (var i = 0; i < customers.length; i++) {
            var customer = customers[i];
            if (customer.id == req.params.id) {
                res.send(customer);
                return;
            }
        }
        next(new restify.ResourceNotFoundError("No user found with the given username"));
    });

    // Update - Customer profile
    server.put('/consumer/:name', function(req, res, next) {
        if (!req.body) {
            next(new restify.InvalidContentError("No user submitted for update"));
            return;
        }

        for (var i = 0; i < customers.length; i++) {
            var customer = customers[i];
            if (customer.name == req.params.name) {
                customers[i] = req.body;
                res.send(req.body);
                return;
            }
        }

        next(new restify.ResourceNotFoundError("No user found with the given username"));
    });

    // Delete - Customer profile
    server.del('/consumer/:name', function(req, res, next) {
        for (var i = 0; i < customers.length; i++) {
            var customer = customers[i];
            if (customer.name == req.params.name) {
                customers.splice(i, 1);
                res.send(customer);
                return;
            }
        }

        next(new restify.ResourceNotFoundError("No user found with the given username"));
    });

    // Reads (plural) - Customer profile
    server.get('/consumer/', function(req, res, next) {
        res.send(customers);
        next();
    });

    // Search based on name - Customer profile
    server.get('/consumer/:name', function(req, res, next) {
        for (var i = 0; i < customers.length; i++) {
            var customer = customers[i];
            if (customer.name == req.params.name) {
                res.send(customer);
                return;
            }
        }
        next(new restify.ResourceNotFoundError("No user found with the given username"));
    });

    //server.post('/consumer/:costumerForRelationship', consumerModule.)  //TODO: implement me!
};

