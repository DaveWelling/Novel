angular.module('novel').controller('NovelController', controller);

controller.$inject = ['$scope', '$state', 'novelService', 'ObjectId', 'EntityService', 'config'];

function controller($scope, $state, novelService, ObjectId, EntityService, config) {
    var entityServices = {};
    config.entities.forEach(entity => {
        entityServices[entity.name] = new EntityService(entity.name);
    });
    $scope.entities = config.entities;
    // Novel state
    $scope.novel = { title: 'placeholder', events: [] };

    init().then(function() {
        $scope.$broadcast('initComplete');
    });

    function ensureNovelExists(results) {
        if (results.data.length === 0) {
            var novel = {
                _id: (new ObjectId()).toOid(),
                title: {
                    value: '',
                    type: 'shortText'
                }
            };
            const entityPromises = [];
            config.entities.forEach(function(entity) {
                novel[entity.plural] = [];
                entityPromises.push(createStarterEntity(novel, entity));
            });
            return Promise.all(entityPromises).then(function() {
                return novelService.insert(novel).then(function() {
                    return novel;
                });
            });
        } else {
            return new Promise(function(resolve) { resolve(results.data[0]); });
        }
    }

    function createStarterEntity(novel, entity) {
        const starterEntity = {
            _id: new ObjectId().toOid(),
            title: { value: 'Starting ' + entity.name, type: 'shortText' },
            children: []
        };
        return entityServices[entity.name].insert(starterEntity).then(function(results) {
            novel[entity.plural] = [starterEntity];
        });
    }

    function init() {
        return novelService.get().then(function(results) {
            return ensureNovelExists(results).then(function(novel) {
                $scope.novel = novel;
                $scope.$watch('novel', function(newEntity, oldEntity) {
                    novelService.patch(newEntity, oldEntity);
                }, true);
            });
        }).catch(function(err) {
            console.error(err);
            toastr.error(err.message, 'Failed to load the novel');
        });
    }
}
