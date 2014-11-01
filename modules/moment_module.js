/**
 * Created by Pavel Prochazka on 23/10/14.
 * Module for moments specific API calls.
 */

var restify = require('restify');

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
};