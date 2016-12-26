const repositoryInit = require('../repository').init;
const Boom = require('boom');
const EJSON = require('mongodb-extended-json');
const deserialize = require('../../node_modules/mongodb-extended-json/lib/deserialize');

const entities = ['novel', 'character', 'chapter', 'event'];
const ObjectId = require('mongodb').ObjectId;
module.exports = {
    register: register
};


register.attributes = {
    name: 'controller'
};

function register(server, options, next) {
    // Add the status route
    server.route({
        method: 'GET',
        path: '/status',
        handler: function(request, reply) {
            return reply('Server up.');
        }
    });

    repositoryInit(entities).then((repositories) => {
        entities.forEach(entity => {
            createRoute(server, entity, repositories[entity]);
        });
        next();
    }).catch(next);
}

function createRoute(server, routeName, repository) {
    server.route({
        method: 'GET',
        path: `/${routeName.toLowerCase()}/{id}`,
        handler: function(request, reply) {
            var id = ObjectId.createFromHexString(request.params.id);
            repository.get(id).then(result => {
                if (!result) {
                    return reply(Boom.notFound());
                }
                return reply(EJSON.stringify(result)).header('Content-Type', 'application/json');;
            }).catch(function(err) {
                return reply(Boom.badImplementation(err));
            });
        }
    });
    server.route({
        method: 'GET',
        path: `/${routeName.toLowerCase()}`,
        handler: function(request, reply) {
            repository.getAll().then(result => {
                if (!result) {
                    return reply(Boom.notFound());
                }
                return reply(EJSON.stringify(result)).header('Content-Type', 'application/json');
            }).catch(function(err) {
                return reply(Boom.badImplementation(err));
            });
        }
    });
    server.route({
        method: 'PUT',
        path: `/${routeName.toLowerCase()}`,
        handler: function(request, reply) {
            reply(Boom.methodNotAllowed('Use patch instead.'));
            // const objPayload = deserialize(request.payload);
            // repository.update(objPayload).then(result => {
            //     if (!result) {
            //         return reply(Boom.notFound());
            //     }
            //     return reply(result);
            // }).catch(function(err) {
            //     return reply(Boom.badImplementation(err));
            // });
        }
    });
    server.route({
        method: 'POST',
        path: `/${routeName.toLowerCase()}`,
        handler: function(request, reply) {
            const objPayload = deserialize(request.payload);
            repository.insert(objPayload).then(result => {
                if (!result) {
                    return reply(Boom.notFound());
                }
                return reply(result);
            }).catch(function(err) {
                return reply(Boom.badImplementation(err));
            });
        }
    });
    server.route({
        method: 'PATCH',
        path: `/${routeName.toLowerCase()}/{id}`,
        handler: function(request, reply) {
            const objPayload = deserialize(request.payload);
            repository.patch(request.params.id, objPayload).then(result => {
                if (!result) {
                    return reply(Boom.notFound());
                }
                return reply(result);
            }).catch(function(err) {
                return reply(Boom.badImplementation(err));
            });
        }
    });
}