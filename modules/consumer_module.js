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
    server.post('/consumer', function(req, res, next) {
        var newConsumer = new models.Consumer(req.body);

        // TODO: Validate schema of user and throw appropriate error (InvalidContentError)

        newConsumer.save(function (err) {
           if(!err) {
               res.send(req.body);
               next();
           } else {
               console.error("Failed to insert consumer into database:", err);
               next(new restify.InternalError("Failed to insert user due to an unexpected internal error"));
           }
        });
    });


    // Read - Customer profile
    server.get('/consumer/:name', function(req, res, next) {
        models.Consumer.find({ name:req.params.name }, { "_id":0 }, function(err, consumer) {
            if(!err) {
                if(consumer.length != 0) {
                    res.send(consumer);
                    next();
                } else {
                    next(new restify.ResourceNotFoundError("No users found with the given username"));
                }
            } else {
                console.error("Failed to query database for consumer profile:", err);
                next(new restify.InternalError("Failed to insert user due to an unexpected internal error"));
            }
        });
    });

    // Update - Customer profile
    server.put('/consumer/:name', function(req, res, next) {
        if (!req.body) {
            next(new restify.InvalidContentError("No user submitted for update"));
            return;
        }

        models.Consumer.findOneAndUpdate({ name:req.params.name }, req.body, function(err, updatedConsumer) {
            if(!err) {
                if(updatedConsumer) {
                    res.send(updatedConsumer);
                    next();
                } else {
                    next(new restify.ResourceNotFoundError("No user found with the given username"));
                }
            } else {
                console.error("Failed to update consumer profile in database:", err);
                next(new restify.InternalError("Failed to update user due to an unexpected internal error"));
            }
        });
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
        models.Consumer.find(null, { "_id":0 }, function(err, consumers) {
            if(!err) {
                res.send(consumers);
                next();
            } else {
                console.error("Failed to read consumers from database:", err);
                next(new restify.InternalError("Failed to insert user due to an unexpected internal error"));
            }
        });
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

