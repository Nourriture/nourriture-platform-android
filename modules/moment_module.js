/**
 * Created by Pavel Prochazka on 23/10/14.
 * Module for moments specific API calls.
 */

var restify = require('restify');
var _ = require('lodash');

module.exports = function (server, models) {

    // Create - Moment
    server.post('/moment', function (req, res, next) {
        var newMoment = new models.Moment(req.body);

        newMoment.save(function (err) {
            if (!err) {
                res.send(req.body);
                next();
            } else {
                if (err.name == "ValidationError") {
                    next(new restify.InvalidContentError(err.toString()));
                } else {
                    console.error("Failed to insert moment into database:", err);
                    next(new restify.InternalError("Failed to insert moment due to an unexpected internal error"));
                }
            }
        });
    });

    // Read - Moment
    server.get('/moment/:id', function(req, res, next) {
        models.Moment.findOne({ "_id":req.params.id}, function(err, moment) {
            if(!err) {
                if(moment) {
                    res.send(moment);
                    next();
                } else {
                    next(new restify.ResourceNotFoundError("No moment found with the given id"));
                }
            } else {
                console.error("Failed to query database for specific moment:", err);
                next(new restify.InternalError("Failed to retrieve moment due to an unexpected internal error"));
            }
        });
    });

    // Update - Moment
    server.put('/moment/:id', function(req, res, next) {
       next(new restify.NotAuthorizedError("Currently consumers are not authorized to update moment, not even their own, sorry."));
    });

    // Delete - Moment
    server.del('/moment/:id', function(req, res, next) {
        models.Moment.findOneAndRemove({ "_id":req.params.id }, function(err, deletedMoment) {
            if(!err) {
                if(deletedMoment) {
                    res.send(deletedMoment);
                    next();
                } else {
                    next(new restify.ResourceNotFoundError("No moment found with the given id"));
                }
            } else {
                console.error("Failed to delete moment from database:", err);
                next(new restify.InternalError("Failed to delete moment due to an unexpected internal error"));
            }
        });
    });

    // Reads (plural) - Moment (user specific)
    server.get('/moment?consumer=:consumer', function(req, res, next) {
        // Find consumer Id based on username
        models.Consumer.findOne({"username":req.params.consumer}, function (err, consumer) {
            if(!err) {
                if(consumer) {
                    models.Moment.find({ "author":consumer["_id"].toString() }, function(err, moments) {
                        if(!err) {
                            res.send(moments); // Note: sending even if it is empty. Assuming no db-error this should just mean the user didn't post any moments
                            next();
                        } else {
                            console.error("Failed to query database for user-specific moments:", err);
                            next(new restify.InternalError("Failed to retrieve moments due to an unexpected internal error"));
                        }
                    });
                } else {
                    next(new restify.ResourceNotFoundError("No consumer found with the given username"));
                }
            } else {
                console.error("Failed to query database for specific consumer:", err);
                next(new restify.InternalError("Failed to retrieve moments due to an unexpected internal error"));
            }
        });
    });

    // Create - Comment (to moment)
    server.post('/moment/:id/comment', function (req, res, next) {
        // Validate comment and add created time
        var newComment = new models.Comment(req.body);
        newComment.created = new Date;
        newComment.validate(function(err) {
            if(!err) {
                // Do actual insertion
                models.Moment.findOneAndUpdate({ "_id":req.params.id}, { "$push": { "comments": newComment._doc } }, function(err) {
                    if(!err) {
                        res.send(newComment);
                        next();
                    } else {
                        console.error("Failed to update moment in database:", err);
                        next(new restify.InternalError("Failed to insert comment due to an unexpected internal error"))
                    }
                });
            } else {
                next(new restify.InvalidContentError(err.toString()));
            }
        });
    });

    // Delete - Comment (from moment)
    server.del('/moment/:id/comment/:cid', function (req, res, next) {
        models.Moment.findOneAndUpdate({ "_id":req.params.id}, { "$pull": { "comments": { "_id": req.params.cid } } }, function(err, moment) {
            if(!err) {
                if(moment) {
                    res.send(moment);
                    next();
                } else {
                    next(new restify.ResourceNotFoundError("No moment found with the given id"));
                }
            } else {
                console.error("Failed to query database for specific moment:", err);
                next(new restify.InternalError("Failed to insert comment due to an unexpected internal error"));
            }
        });
    });
};