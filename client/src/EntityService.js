(function(module) {
    'use strict';

    module.service('EntityService', service);

    service.$inject = ['$http', 'patch'];

    function service($http, jsonPatch) {
        // ctor
        function EntityService(entityName) {
            // public interface
            this.get = get;
            this.update = update;
            this.insert = insert;
            this.patch = patch;
            var rootUrl = '/api/' + entityName;

            function get(id) {
                if (id) {
                    return $http.get(rootUrl + '/' + id.$oid);
                }
                return $http.get(rootUrl);
            }

            function update(entity) {
                throw new Error('Update not supported.  Use patch instead.');
            }

            function patch(newEntity, previousEntity) {
                if (!previousEntity) return;  // do nothing until loaded;
                var entityToSave = prepareEntity(newEntity);
                var patch = jsonPatch.compare(previousEntity, entityToSave, true);
                if (patch.length === 0) return; // no changes to save;
                return $http.patch(rootUrl + '/' + newEntity._id.$oid, patch);
            }

            function insert(entity) {
                var entityToSave = prepareEntity(entity);
                return $http.post(rootUrl, entityToSave).then(function() {
                    entity.loaded = true;
                });
            }

            function prepareEntity(entity) {
                var entityToSave = _.omit(entity, ['children', '$$hashKey', 'loaded']);
                if (!entityToSave._id.$oid) {
                    entityToSave._id = entityToSave._id.toOid();
                }
                return entityToSave;
            }
        }

        return EntityService;
    }
})(angular.module('novel'));