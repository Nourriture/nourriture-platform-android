/**
 * Created by niels on 10/28/14.
 * Mongoose data models for the Android application backend
 */

module.exports = function (mongoose) {

    // CONSUMER
    var Consumer = mongoose.Schema({
        name: String,
        fullname: String,
        email: String
    });

    // MOMENT
    var Moment = mongoose.Schema({
       title: String
    });


    // Bind to DB collection names and return on single object
    var models = {
        Consumer: mongoose.model("consumer", Consumer),
        Moment: mongoose.model("moment", Moment)
    };

    return models;
};