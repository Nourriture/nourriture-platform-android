/**
 * Created by niels on 10/28/14.
 * Mongoose data models for the Android application backend
 */

module.exports = function (mongoose) {
    // Custom length validator for strings
    function strLength(max) {
        return [
            function(v) { return v.length < max; },
            "Only " + max + " characters are allowed"
        ];
    }

    // middleware for automatically updating timestamps ("created" and "modified")
    function updateTimeStamps(next, done) {
        if (!this.created) this.created = new Date;
        this.modified = new Date;
        next(); done();
    }

    // CONSUMER
    var Consumer = mongoose.Schema({
        created: { type: Date, required: true },
        modified: { type: Date, required: true },
        email: { type: String, validate: strLength(128) },
        name: { type: String, validate: strLength(64), required: true },
        picture: { type: String, validate: strLength(512) },
        bio: { type: String, validate: strLength(4096) },
        occupation: { type: String, validate: strLength(128) },
        gender: { type: Number, min: 0, max: 2 },
        birthday: Date,
        website: { type: String, validate: strLength(512) }
    });
    Consumer.pre('validate', true, updateTimeStamps);

    // MOMENT
    var Like = mongoose.Schema( {
       created: { type: Date, required: true },
       author: { type: Consumer, ref: "Consumer", required: true}
    });
    var Comment = mongoose.Schema({
       created: { type: Date, required: true},
       author: { type: Consumer, ref: "Consumer", required: true},
       text: { type: String, validate: strLength(1024)},
       likes: [Like]
    });
    var Moment = mongoose.Schema({
        created: { type: Date, required: true },
        author: { type: Consumer, ref: "Consumer", required: true },
        modified: { type: Date, required: true },
        text: { type: String, validate: strLength(1024) },
        subjectID: String,       // NOTE: Referring to recipe, ingredient, gastronomist or company in Nourriture (3rd party)
        likes: [Like],
        comment: [Comment]
    });
    Moment.pre('validate', true, updateTimeStamps);

    // RATING
    var Rating = mongoose.Schema({
        created: { type: Date, required: true },
        author: { type: Consumer, ref: "Consumer", required: true },
        value: { type: Number, min: 1, max: 6 },
        difficulty: { type: Number, min: 1, max: 6},
        subjectID: { type: String, required: true}      // NOTE: Referring to recipe, ingredient, gastronomist or company in Nourriture (3rd party)
    });
    Rating.pre('validate', true, updateTimeStamps);


    // Bind to DB collection names and return on single object
    return {
        Consumer: mongoose.model("consumer", Consumer),
        Moment: mongoose.model("moment", Moment),
        Rating: mongoose.model("rating", Rating)
    };
};