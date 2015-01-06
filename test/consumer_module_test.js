/**
 * Created by Niels Søholm on 2014.01.02
 */

var Expect      = require('chai').expect;
var Supertest   = require('supertest');  // high-level abstraction for testing HTTP, while still allowing you to drop down to the lower-level API provided by super-agent
var API         = Supertest('http://localhost:8081');
var MongoClient = require('mongodb').MongoClient;
var async       = require('async');
var spawn       = require('child_process').spawn;

before(function(done){
    console.log('BEFORE ANY tests, check whether NodeJS already up and running');

    var inter = setInterval(function() {
        console.log(" - - - Is NodeJS server running???");

        API.get('')
            .end(function(error, response){

                if(!error){
                    console.log(" - - - YES NodeJS server is running!!!");

                    clearInterval(inter);
                    done()
                }
            })
    }, 500);
});

describe('Consumer module API tests', function() {
    var samplesUsed = ["consumers"]; // Collection names of sample data to be used in tests

    beforeEach(function(done) {
        // Insert sample data into MongoDB
        async.each(samplesUsed,
            function(collName, collDone) {
                var file = "test/samples/" + collName + ".json";
                var args = ['--db', 'nourriture-android-test', '--collection', collName, file];
                var mongoimport = spawn('mongoimport', args);
                mongoimport.on('exit', function (code) {
                    console.log('mongoimport exited with code ' + code);
                    collDone();
                });
            },
            // After all sample collections have been inserted, finish up
            function(err) {
                if(!err) {
                    done();
                } else {
                    console.log("Failed to insert mock data into MongoDB: " + err);
                }
            }
        );
    });

    afterEach(function(done){
        // Wipe sample data from MongoDB
        MongoClient.connect(process.env.dbcon, function(err, connection) {
            async.each(samplesUsed,
                // For each sample collection used, drop
                function(collName, collDone) {
                    var collection = connection.collection(collName);
                    collection.drop(collDone);
                },
                // After all sample collections have been dropped, finish up
                function() {
                    if(!err) {
                        connection.close();
                        done();
                    } else {
                        console.log("Failed to wipe mock data from MongoDB: " + err);
                    }
                });
        });
    });

    it('GET consumers', function (done) {
        API.get('/consumer')
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function(error, response){
                Expect(response.body.length).to.eql(3);
                done()
            });
    });

    it('GET specific consumer', function (done) {
        var tUser = "ctverecek"; // Username of sample user to be retrieved
        API.get('/consumer/' + tUser)
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function(error, response){
                var rConsumer = response.body;
                Expect(rConsumer.name).to.eql("Pavel Prochazka");
                done()
            });
    });

    it('GET specific consumer, that does not already exist', function (done) {
        var tUser = "johndoe"; // Username that shouldn't exist
        API.get('/consumer/' + tUser)
            .set('Content-Type', 'application/json')
            .expect(404)
            .end(function(error, response){
                Expect(response.body.code).to.eql("ResourceNotFound");
                done()
            });
    });

    it('POST a consumer, with required fields', function (done) {
        var sampleConsumer = {
            "username": "johndoe",
            "email": "john@doe.com",
            "name": "John Doe"
        };

        API.post('/consumer')
            .set('Content-Type', 'application/json')
            .send(sampleConsumer)
            .expect(200)
            .end(function(error, response){
                // Well-formed response
                var rConsumer = response.body;
                Expect(rConsumer._id).to.exist();
                Expect(rConsumer.created).to.exist();
                Expect(rConsumer.modified).to.exist();
                Expect(rConsumer.username).to.eql(sampleConsumer.username);
                Expect(rConsumer.email).to.eql(sampleConsumer.email);
                Expect(rConsumer.name).to.eql(sampleConsumer.name);
                Expect(rConsumer).to.have.property("following")
                    .that.is.empty();

                done()
            });
    });

    it('POST a consumer, without all required fields', function (done) {
        var sampleConsumer = {
            "username": "johndoe"
        };

        API.post('/consumer')
            .set('Content-Type', 'application/json')
            .send(sampleConsumer)
            .expect(400)
            .end(function(error, response){
                Expect(response.body.code).to.eql("InvalidContent");
                done();
            });
    });

    it('PUT a consumer, with valid name', function (done) {
        var tUser = "ctverecek"; // Username of sample user to be retrieved
        var modification = {name: "Niels Jensen"};
        API.put("/consumer/" + tUser)
            .send(modification)
            .expect(200)
            .end(function(error, response) {
                Expect(response.body.name).to.eql(modification.name);
                done();
            });
    });

    it('PUT a consumer, that does not already exist', function (done) {
        var tUser = "johndoe"; // Username that shouldn't exist
        var modification = {name: "Niels Jensen"};
        API.put("/consumer/" + tUser)
            .send(modification)
            .expect(404)
            .end(function(error, response) {
                Expect(response.body.code).to.eql("ResourceNotFound");
                done();
            });
    });

    it('PUT a consumer, with a too long name', function (done) {
        var tUser = "ctverecek"; // Username of sample user to be retrieved
        var modification = {name: "JohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn"};
        API.put("/consumer/" + tUser)
            .send(modification)
            .expect(400)
            .end(function(error, response) {
                Expect(response.body.code).to.eql("InvalidContent");
                done();
            });
    });

    it('DELETE a consumer', function (done) {
        var tUser = "ctverecek"; // Username of sample user to be retrieved
        API.delete("/consumer/" + tUser)
            .expect(200)
            .end(function(error, response) {
                done();
            });
    });

    it('DELETE a consumer, that does not already exist', function (done) {
        var tUser = "johndoe"; // Username that shouldn't exist
        API.delete("/consumer/" + tUser)
            .expect(404)
            .end(function(error, response) {
                Expect(response.body.code).to.eql("ResourceNotFound");
                done();
            });
    });
});