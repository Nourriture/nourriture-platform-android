/**
 * Created by Niels Søholm on 2014.01.02
 */

var Expect      = require('chai').expect;
var Supertest   = require('supertest');  // high-level abstraction for testing HTTP, while still allowing you to drop down to the lower-level API provided by super-agent
var API         = Supertest('http://localhost:8081');
var MongoClient = require('mongodb').MongoClient;
var sampleData  = require("../utilities/sample_data.json");

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

    beforeEach(function(done) {
        // Insert mock data into MongoDB
        MongoClient.connect(process.env.dbcon, function(err, connection) {
            var consumers = connection.collection('consumers');
            consumers.insert(sampleData.consumers, function() {
                connection.close();
                done();
            });
        });
    });

    afterEach(function(done){
        // Wipe Consumer collection from MongoDB
        MongoClient.connect(process.env.dbcon, function(err, connection) {
            var consumers = connection.collection('consumers');
            consumers.drop(function() {
                connection.close();
                done();
            });
        });
    });

    it('GET consumers', function (done) {
        API.get('/consumer')
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function(error, response){
                Expect(response.body).eql(sampleData.consumers);
                done()
            });
    });

    it('GET specific consumer', function (done) {
        var tUser = sampleData.consumers[0].username; // Username of sample user to be retrieved
        API.get('/consumer/' + tUser)
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function(error, response){
                Expect(response.body).eql(sampleData.consumers[0]);
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
        var tUser = sampleData.consumers[0].username; // Username of sample user to be modified
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
        var tUser = sampleData.consumers[0].username; // Username of sample user to be modified
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
        var tUser = sampleData.consumers[0].username; // Username of sample user to be deleted
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