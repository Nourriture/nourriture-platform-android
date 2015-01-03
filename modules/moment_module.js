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
                res.send(newMoment);
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
        models.Moment.findById(req.params.id, function(err, moment) {
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

    // Reads (plural) - Moment (all or filtered)
    server.get('/moment', function(req, res, next) {
        // Construct basic query
        var query = models.Moment
            .find()
            .select({ comments:0, likes:0 });    // Don't select likes and comments for plural queries

        // If parameters specified use them;
        if(req.params) {
            query.find(req.params);
        }

        // Execute query
        query.exec(function(err, moments) {
                if(!err) {
                    res.send(moments);
                    next();
                } else {
                    console.error("Failed to read moments from database", err);
                    next(new restify.InternalError("Failed to retrieve moments due to an unexpected internal error"));
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

    // Create - Comment (to moment)
    server.post('/moment/:id/comment', function (req, res, next) {
        // Validate comment and add created time
        var newComment = new models.Comment(req.body);
        newComment.created = new Date;
        newComment.validate(function(err) {
            if(!err) {
                // Do actual insertion
                models.Moment.findOneAndUpdate({ "_id":req.params.id}, { "$push": { "comments": newComment._doc }, "$inc": { "commentCount": 1 } }, function(err) {
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
        models.Moment.findOneAndUpdate({ "_id":req.params.id}, { "$pull": { "comments": { "_id": req.params.cid } }, "$inc": { "commentCount": -1 } }, { "new": false }, function(err, moment) {
            if(!err) {
                if(moment) {
                    // Look up comment in unmodified moment
                    var comment = _.find(moment.toObject().comments, function(item) {
                        return item._id.toString() == req.params.cid;
                    });

                    // If it was found return it, otherwise it never existed and 404 should be returned
                    if(comment) {
                        res.send(comment);
                        next();
                    } else {
                        next(new restify.ResourceNotFoundError("No comment found with the given id in the given moment"));
                    }
                } else {
                    next(new restify.ResourceNotFoundError("No moment found with the given id"));
                }
            } else {
                console.error("Failed to query database for specific moment:", err);
                next(new restify.InternalError("Failed to insert comment due to an unexpected internal error"));
            }
        });
    });

    // Create - Like (to moment)
    server.post('/moment/:id/like', function (req, res, next) {
        // TODO: Do prober validation of ObjectId by comparing to current authenticated user. Validate both authorization and type.
        var valid = req.body;

        if(valid) {
            models.Moment.findOneAndUpdate({ "_id":req.params.id}, { "$addToSet": { "likes": req.body }, "$inc": { "likeCount": 1 } }, function(err, moment) {
                if(!err) {
                    if(moment) {
                        res.send(moment.likes);
                        next();
                    } else {
                        next(new restify.ResourceNotFoundError("No moment found with the given id"));
                    }
                } else {
                    console.error("Failed to update moment in database:", err);
                    next(new restify.InternalError("Failed to insert like due to an unexpected internal error"))
                }
            });
        } else {
            next(new restify.InvalidContentError("Invalid ObjectId"));
        }
    });

    // Delete - Like (from moment)
    server.del('/moment/:id/like/:cid', function (req, res, next) {
        models.Moment.findOneAndUpdate({ "_id":req.params.id}, { "$pull": { "likes": req.params.cid }, "$inc": { "likeCount": -1 } }, { "new": false }, function(err, moment) {
            if(!err) {
                if(moment) {
                    // Look up like in unmodified moment
                    var like = _.find(moment.toObject().likes, function(item) {
                        return item.toString() == req.params.cid;
                    });

                    // If it was found return it, otherwise it never existed and 404 should be returned
                    if(like) {
                        res.send(like);
                        next();
                    } else {
                        next(new restify.ResourceNotFoundError("No like found from the given user in the given moment"));
                    }
                } else {
                    next(new restify.ResourceNotFoundError("No moment found with the given id"));
                }
            } else {
                console.error("Failed to query database for specific moment:", err);
                next(new restify.InternalError("Failed to remove like due to an unexpected internal error"));
            }
        });
    });
};