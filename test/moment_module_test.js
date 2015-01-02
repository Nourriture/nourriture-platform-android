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

describe('Moments module API tests', function() {
    var samplesUsed = ["consumers", "moments"]; // Collection names of sample data to be used in tests

    beforeEach(function(done) {
        // Insert sample data into MongoDB
        async.each(samplesUsed,
            function(collName, collDone) {
                var file = "test/samples/" + collName + ".json";
                var args = ['--db', 'nourriture-android-test', '--collection', collName, file];
                var mongoimport = spawn('mongoimport', args);
                mongoimport.on('exit', function (code) {
                    console.log('mongodump exited with code ' + code);
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

    it('GET specific moment', function (done) {
        var tId = "54a689987048351b5d2972a7"; // ID of sample moment to be retrieved
        API.get('/moment/' + tId)
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function(error, response){
                Expect(response.body.text).to.eql("I cooked a delicious lasagna from this amazing recipe! You should do the same, dude.");
                done()
            });
    });

    it('GET moments of specific consumer', function (done) {
        var uId = "ctverecek"; // Username of consumer whose moment should be retrieved
        API.get('/moment?consumer=' + uId)
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function(error, response){
                Expect(response.body.length).to.eql(1);
                done()
            });
    });

    it('POST a moment, with required fields', function (done) {
        var sampleMoment = {
            author: "54a688dc7048351b5d2972a3", // ID of sample consumer to be author of moment
            text: "This is my test moment about test food"
        };

        API.post('/moment')
            .set('Content-Type', 'application/json')
            .send(sampleMoment)
            .expect(200)
            .end(function(error, response){
                // Well-formed response
                var rMoment = response.body;
                Expect(rMoment._id).to.exist();
                Expect(rMoment.created).to.exist();
                Expect(rMoment.modified).to.exist();
                Expect(rMoment.author).to.eql(sampleMoment.author);
                Expect(rMoment.text).to.eql(sampleMoment.text);
                Expect(rMoment).to.have.property("likes")
                    .that.is.empty();
                Expect(rMoment).to.have.property("comments")
                    .that.is.empty();

                done()
            });
    });

    it('DELETE a moment', function (done) {
        var tId = "54a689987048351b5d2972a7"; // ID of sample moment to be retrieved
        API.delete("/moment/" + tId)
            .expect(200)
            .end(function(error, response) {
                Expect(response.body.text).to.eql("I cooked a delicious lasagna from this amazing recipe! You should do the same, dude.");
                done();
            });
    });
});