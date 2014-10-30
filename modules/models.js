/**
 * Created by niels on 10/28/14.
 * Mongoose data models for the Android application backend
 */

var util = require('../models/data_model_middleware');

module.exports = function (mongoose) {

    // CONSUMER
    var Consumer = mongoose.Schema({
        created: { type: Date, required: true },
        modified: { type: Date, required: true },
        username: { type: String, required: true},
        email: { type: String, validate: util.strLength(128), required:true },
        name: { type: String, validate: util.strLength(64), required: true },
        picture: { type: String, validate: util.strLength(512) },
        bio: { type: String, validate: util.strLength(4096) },
        occupation: { type: String, validate: util.strLength(128) },
        gender: { type: Number, min: 0, max: 2 },
        birthday: Date,
        website: { type: String, validate: util.strLength(512) }
    });
    Consumer.pre('validate', true, util.updateTimeStamps);

    // MOMENT
    var Like = mongoose.Schema( {
       created: { type: Date, required: true },
       author: { type: mongoose.Schema.Types.ObjectId, ref: "Consumer", required: true}
    });
    var Comment = mongoose.Schema({
       created: { type: Date, required: true},
       author: { type: mongoose.Schema.Types.ObjectId, ref: "Consumer", required: true},
       text: { type: String, validate: util.strLength(1024)},
       likes: [Like]
    });
    var Moment = mongoose.Schema({
        created: { type: Date, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "Consumer", required: true },
        modified: { type: Date, required: true },
        text: { type: String, validate: util.strLength(1024) },
        subjectID: String,       // NOTE: Referring to recipe, ingredient, gastronomist or company in Nourriture (3rd party)
        likes: [Like],
        comment: [Comment]
    });
    Moment.pre('validate', true, util.updateTimeStamps);

    // RATING
    var Rating = mongoose.Schema({
        created: { type: Date, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "Consumer", required: true },
        value: { type: Number, min: 1, max: 6 },
        difficulty: { type: Number, min: 1, max: 6},
        subjectID: { type: String, required: true}      // NOTE: Referring to recipe, ingredient, gastronomist or company in Nourriture (3rd party)
    });
    Rating.pre('validate', true, util.updateTimeStamps);


    // Bind to DB collection names and return on single object
    return {
        Consumer: mongoose.model("consumer", Consumer),
        Moment: mongoose.model("moment", Moment),
        Rating: mongoose.model("rating", Rating)
    };
};