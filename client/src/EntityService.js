(function(module){
    'use strict';

    module.service('EntityService', service);

    service.$inject = ['$http'];

    function service($http){
        // ctor
        function EntityService(entityName){
            // public interface
            this.get = get;
            this.update = update;
            this.insert = insert;
            var rootUrl = '/api/' + entityName;
            function get(id){
                if (id){
                    if (typeof id === 'object'){
                        return $http.get(rootUrl + '/' + id.$oid).then(setAllLoaded);
                    } else {
                        return $http.get(rootUrl + '/' + id).then(setAllLoaded);
                    }
                }
                return $http.get(rootUrl).then(setAllLoaded);
            }
            function setAllLoaded(result){
                if (Array.isArray(result.data)){
                    result.data.forEach(function(entity){
                        entity.loaded = true;
                    });
                } else {
                    result.data.loaded = true;
                }
                return result;
            }



            function update(entity){
                var entityToSave = prepareEntity(entity);
                return $http.put(rootUrl, entityToSave).then(function(){
                    entity.rev++;
                });
            }


            function insert(entity){
                var entityToSave = prepareEntity(entity);
                return $http.post(rootUrl, entityToSave).then(function(){
                    entity.rev = 0;
                    entity.loaded = true;
                });
            }

            function prepareEntity(entity){
                var entityToSave = _.omit(entity, ['children', '$$hashKey', 'loaded']);
                if (!entityToSave._id.$oid){
                    entityToSave._id = entityToSave._id.toOid();
                }
                return entityToSave;
            }
        }

        return EntityService;
    }
})(angular.module('novel'));