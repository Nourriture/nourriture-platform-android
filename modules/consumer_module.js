/**
 * Created by Pavel Prochazka on 23/10/14.
 * Module for consumer specific API calls.
 */

var restify = require('restify');

module.exports = function (server, models) {

    // Create - Customer profile
    server.post('/consumer', function(req, res, next) {
        var newConsumer = new models.Consumer(req.body);

        newConsumer.save(function (err) {
           if(!err) {
               res.send(req.body);
               next();
           } else {
               if(err.name == "ValidationError") {
                   next(new restify.InvalidContentError(err.toString()));
               } else {
                   console.error("Failed to insert consumer into database:", err);
                   next(new restify.InternalError("Failed to insert user due to an unexpected internal error"));
               }
           }
        });
    });


    // Read - Customer profile
    server.get('/consumer/:username', function(req, res, next) {
        models.Consumer.find({ username:req.params.username }, { "_id":0 }, function(err, consumer) {
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
    server.put('/consumer/:username', function(req, res, next) {
        // If empty body, abort without even making DB connection
        if (!req.body) {
            next(new restify.InvalidContentError("No user submitted for update"));
            return;
        }

        // Retrieve existing user, overwrite fields, validate and save
        models.Consumer.find({ username:req.params.username }, { "_id":0 }, function(err, result) {
            if(!err) {
                if(result.length != 0) {
                    var consumer = result[0];

                    // Overwrite fields with value from request body
                    for (var key in req.body) {
                        consumer[key] = req.body[key];
                    }

                    // Validate and save
                    consumer.save(function (err) {
                        if(!err) {
                            res.send(consumer);
                            next();
                        } else {
                            if(err.name == "ValidationError") {
                                next(new restify.InvalidContentError(err.toString()));
                            } else {
                                console.error("Failed to insert consumer into database:", err);
                                next(new restify.InternalError("Failed to insert user due to an unexpected internal error"));
                            }
                        }
                    });
                } else {
                    // No user found with given username
                    next(new restify.ResourceNotFoundError("No users found with the given username"));
                }
            } else {
                // Database connection error
                console.error("Failed to query database for consumer profile:", err);
                next(new restify.InternalError("Failed to insert user due to an unexpected internal error"));
            }
        });
    });

    // Delete - Customer profile
    server.del('/consumer/:username', function(req, res, next) {
        models.Consumer.findOneAndRemove({ username:req.params.username }, { "select": { "_id": 0} }, function(err, deletedConsumer) {
            if(!err) {
                if(deletedConsumer) {
                    res.send(deletedConsumer);
                    next();
                } else {
                    next(new restify.ResourceNotFoundError("No user found with the given username"));
                }
            } else {
                console.error("Failed to delete consumer profile from database:", err);
                next(new restify.InternalError("Failed to delete consumer due to an unexpected internal error"));
            }
        });
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


    server.get("/consumer/:username/following", function (req, res, next) {
        models.Consumer.findOne({ username:req.params.username }, { "following":1 }, function(err, consumer) {
            if(!err) {
                if(consumer) {
                    res.send(consumer.following);
                    next();
                } else {
                    next(new restify.ResourceNotFoundError("No consumer found with the given username"));
                }
            } else {
                console.error("Failed to query database for consumer profile:", err);
                next(new restify.InternalError("Failed to retrieve follow data due to an unexpected internal error"));
            }
        });
    });

    //server.post('/consumer/:costumerForRelationship', consumerModule.)  //TODO: implement me!
};

