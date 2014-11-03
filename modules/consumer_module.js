/**
 * Created by Pavel Prochazka on 23/10/14.
 * Module for consumer specific API calls.
 */

var fs = require('fs');
var restify = require('restify');
var _ = require('lodash');

module.exports = function (server, models, aws) {

    // Create - Consumer profile
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

    // Read - Consumer profile
    server.get('/consumer/:username', function(req, res, next) {
        models.Consumer.find({ username:req.params.username }, function(err, consumer) {
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

    // Update - Consumer profile
    server.put('/consumer/:username', function(req, res, next) {
        // Retrieve existing user, overwrite fields, validate and save
        models.Consumer.find({ username:req.params.username }, function(err, result) {
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

    // Delete - Consumer profile
    server.del('/consumer/:username', function(req, res, next) {
        models.Consumer.findOneAndRemove({ username:req.params.username }, function(err, deletedConsumer) {
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

    // Reads (plural) - Consumer profile
    server.get('/consumer/', function(req, res, next) {
        models.Consumer.find(function(err, consumers) {
            if(!err) {
                res.send(consumers);
                next();
            } else {
                console.error("Failed to read consumers from database:", err);
                next(new restify.InternalError("Failed to insert user due to an unexpected internal error"));
            }
        });
    });

    // Read - Follow relations of a specific consumer
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

    // Create - Following relation from this consumer to another consumer
    server.post("/consumer/:username/following", function (req, res, next) {
        models.Consumer.findOne({ username:req.params.username }, { "following":1 }, function(err, consumer) {
            // Did the database lookup query succeed?
            if(!err) {
                // Did we find a consumer with the given username?
                if(consumer) {
                    // Is this consumer not following this other consumer already?
                    var alreadyFollowing = _.any(consumer.following, function(item) {
                       return item.consumer.toString() == req.body.consumer;
                    });
                    if(!alreadyFollowing) {
                        // Add timestamp and push relation to consumer
                        req.body.created = new Date;
                        consumer.following.push(req.body);

                        // Attempt to save the modified consumer
                        consumer.save(function (err) {
                            // Did save succeed?
                            if(!err) {
                                res.send(req.body);
                                next();
                            } else {
                                // Did save fail due to a validation error or unexpected error?
                                if(err.name == "ValidationError") {
                                    next(new restify.InvalidContentError(err.toString()));
                                } else {
                                    console.error("Failed to insert consumer into database:", err);
                                    next(new restify.InternalError("Failed to insert user due to an unexpected internal error"));
                                }
                            }
                        });
                    } else {
                        next(new restify.InvalidContentError("Consumer already following this other consumer"));
                    }
                } else {
                    next(new restify.ResourceNotFoundError("No users found with the given username"));
                }
            } else {
                console.error("Failed to query database for consumer profile:", err);
                next(new restify.InternalError("Failed to insert follow relationship due to an unexpected internal error"));
            }
        });
    });

    // Delete - Following relation from this consumer to another consumer
    server.del('/consumer/:username/following/:target', function(req, res, next) {
        models.Consumer.findOneAndUpdate({ "username":req.params.username}, { "$pull": { "following": { "consumer": req.params.target } } }, function(err, consumer) {
            if(!err) {
                if(consumer) {
                    res.send(consumer);
                    next();
                } else {
                    next(new restify.ResourceNotFoundError("No consumer found with the given username"));
                }
            } else {
                console.error("Failed to query database for modifying a specfici consumer:", err);
                next(new restify.InternalError("Failed to delete follow relation due to an unexpected internal error"));
            }
        });
    });

    // Create - Consumer picture
    server.post('/consumer/:username/picture', function(req, res, next) {
        for (var filename in req.files) {
            if(filename != "_proto_") {
                var file = req.files[filename];
                var filetype = /^.+\.(.+)$/.exec(filename)[1];
                var typeOK = _.contains(["jpg", "jpeg", "png", "gif"], filetype);
                var newFileName = req.params.username + "." + filetype;
                if(typeOK && file.size < 1000000) {
                    fs.readFile(file.path, { flag: "r" }, function (err, data) {
                        if (!err) {
                            s3 = new aws.S3();
                            s3.putObject({
                                    Bucket: "nourriture-consumer",
                                    ACL: "public-read",
                                    Key: newFileName,
                                    ContentType: "image/" + filetype,
                                    Body: data
                                },
                                function (err, data) {
                                    if (!err) {
                                        next();
                                    } else {
                                        console.error("Failed to put consumer picture into S3", err);
                                        next(new restify.InternalError("Failed to save picture due to an unexpected internal error"));
                                    }
                                }
                            );
                        } else {
                            console.error("Failed to open temporary file created by consumer picture upload");
                            next(new restify.InternalError("Failed to save picture due to an unexpected internal error"));
                        }
                    });
                }
                console.log(file.path);
            }
        }
    });
};

