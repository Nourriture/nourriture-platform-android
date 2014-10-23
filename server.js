/**
 * Created by Pavel Prochazka on 23/10/14.
 * The main server based on restify.
 */

var restify         = require('restify');
var consumerModule  = require('./modules/consumer_module');
var momentModule    = require('./modules/moment_module');

var server = restify.createServer({ name: 'Nourriture Android backed server', version: '0.0.1' });

server.use(restify.fullResponse());
server.use(restify.bodyParser());

server.listen(8080, function () {
    console.log('- - - %s listening at %s - - -', server.name, server.url);
    require('./utilities/document')(server.router.mounts, 'restify');
});

//CONSUMER related API calls
server.post('/consumer/:name', consumerModule.createConsumer);
server.get('/consumer/:name', consumerModule.readConsumer);
server.get('/consumer/',      consumerModule.readAllConsumers);
server.put('/consumer/:name', consumerModule.updateConsumer);
server.del('/consumer/:name', consumerModule.deleteConsumer);

//MOMENT related API calls
//server.post('/moment/', momentModule.createMoment);
//server.get('')