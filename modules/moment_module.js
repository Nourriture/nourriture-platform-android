/**
 * Created by Pavel Prochazka on 23/10/14.
 * Module for moments specific API calls.
 */

var restify = require('restify');
var saveModule = require('save')('moment');    //TODO: module to stub fake companies, should be deleted once DB in place

function createMoment(req, res, next) {
    console.log('Create moment requested');

    if (req.params.momentTitle === undefined) {
        return next(new restify.InvalidArgumentError('Moment title attribute missing'));
    }

    saveModule.create({momentTitle: req.params.momentTitle}, function (error, moment) {
        if (error) {
            return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
        }
        res.send(201, moment) //the '201 Created' HTTP response code + created moment
        next();
    })
}

function readAllMomentsForRecipe(req, res, next) {
    console.log('Read all moments for a recipe requested');

    /*saveModule.findOne({ recipeId: req.params.recipeId }, function (error, company) {
        if (error){
            return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
        }

        if (company) {
            res.send(company)
            next();
        } else {    //'Save' may provide an error, or undefined for the user variable if they don't exist
            res.send(404)
            next();
        }
    })*/

    res.send(JSON.stringify("nothing to return yet"));
    next();
}

exports.createMoment = createMoment;
exports.readAllMomentsForRecipe = readAllMomentsForRecipe;