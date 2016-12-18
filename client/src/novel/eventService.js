(function (module) {
    'use strict';

    module.service('eventService', service);

    service.$inject = ["$http"];

    function service($http) {
        //ctor
        function EventService() {
            // public interface
            this.get = get;
            this.update = update;
            this.insert = insert;

            function get(id) {
                if (id){
                    return $http.get('/api/event/' + id.$oid).then(setAllLoaded);
                }
                return $http.get('/api/event').then(setAllLoaded);
            }
            function setAllLoaded(result){
                if (Array.isArray(result.data)) {
                    result.data.forEach(function (entity) {
                        entity.loaded = true;
                    })
                } else {
                    result.data.loaded = true;
                }
                return result;
            }



            function update(entity){
                var entityToSave = prepareEntity(entity);
                return $http.put('/api/event', entityToSave).then(function(){
                    entity.rev++;
                });
            }


            function insert(entity){
                var entityToSave = prepareEntity(entity);
                return $http.post('/api/event', entityToSave).then(function(){
                    entity.rev=0;
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

        return new EventService();
    }
})(angular.module('novel'));