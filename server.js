/**
 * Created by Pavel Prochazka on 23/10/14.
 * The main server based on restify.
 */

var restify         = require('restify');
var mongoose        = require("mongoose");
var models          = require("./modules/models")(mongoose);
var momentModule    = require('./modules/moment_module');

var server = restify.createServer({ name: 'Nourriture Android backed server', version: '0.0.1' });
var connstr = "mongodb://localhost:27017/nourriture-app";
var conn = {};
var mong = {};

var port = 8080;
if (process.argv[2]) {
    port = parseInt(process.argv[2]);
}

server.use(restify.fullResponse());
server.use(restify.bodyParser( { mapParams: false } ));

// Server startup function, should be run when all routes have been registered and we are ready to listen
var startServer = function() {
    var db = mongoose.connection;

    // On failure to connect, abort server startup and show error
    db.on('error', console.error.bind(console, 'connection error:'));

    // On successful connection, finalize server startup
    db.once('open', function() {
        console.log("Connected to database successfully!");
        conn = db;

        server.listen(port, function () {
            console.log('- - - %s listening at %s - - -', server.name, server.url);
            require('./utilities/document')(server.router.mounts, 'restify');
        });
    });

    mongoose.connect(connstr);
    mong = new mongoose.Mongoose();
};

//CONSUMER related API calls
var consumerModule  = require('./modules/consumer_module')(server, models);

//MOMENT related API calls
server.post('/moment/', momentModule.createMoment);
server.get('/moment/:recipeId', momentModule.readAllMomentsForRecipe);

// Connect to DB and start listening
startServer();