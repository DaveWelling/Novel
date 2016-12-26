angular.module('novel').controller('NovelEntityController', controller);
controller.$inject = ['$scope', 'ObjectId', 'EntityService', '$state', '$timeout'];
function controller($scope, ObjectId, EntityService, $state, $timeout) {
    var entityService;
    // var loadedEntities = [];
    $scope.init = function(entityType, novelPropertyName) {
        $scope.novelArrayProperty = novelPropertyName;
        $scope.entityType = entityType;
        entityService = new EntityService(entityType);
        $scope.entityTitle = _.startCase(entityType);
        $scope.entityPluralTitle = _.startCase(novelPropertyName);
    };
    $scope.isCollapsed = true;

    $scope.$on('initComplete', function() {
        setWatch();
        $scope.selectedEntity = $scope.novel[$scope.novelArrayProperty][0];
        loadSelectedEntity();
    });


    $scope.entitySelected = function(scope) {
        $scope.selectedEntity = scope.$modelValue;
        loadSelectedEntity();
    };

    var deregisterPreviousWatch;
    function setWatch() {
        if (deregisterPreviousWatch) deregisterPreviousWatch();
        deregisterPreviousWatch = $scope.$watch('currentEntity', handleChange, true);

        function handleChange(newEntity, oldEntity) {
            if (!newEntity) return;
            entityService.patch(newEntity, oldEntity);
            updateEntityInNovel(newEntity, oldEntity);
        }
    }

    function updateEntityInNovel(newEntity, oldEntity) {
        if (!oldEntity) return;
        if (newEntity.title !== oldEntity.title) {
            $scope.selectedEntity.title = newEntity.title;
        }
    }

    function loadSelectedEntity() {
        var entity = $scope.selectedEntity;
        // loaded already or never saved.
        // if (loadedEntities[entity._id.$oid]) return;
        entityService.get(entity._id).then(function(results) {
            $scope.currentEntity = results.data;
            // loadedEntities.push(entity._id.$oid);
        }).catch(function(err) {
            console.error(err);
            toastr.error(err.message, 'Failed to load ' + $scope.entityType + ' ' + entity.title);
        });
    }

    $scope.remove = function(scope, clickEvent) {
        clickEvent.stopPropagation();
        scope.remove();
    };

    $scope.toggle = function(scope, clickEvent) {
        clickEvent.stopPropagation();
        scope.toggle();
    };

    $scope.moveLastToTheBeginning = function() {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
    };

    $scope.newSubItem = function(scope, clickEvent) {
        clickEvent.stopPropagation();
        var entity = scope.$modelValue;
        var newEntity = {
            _id: new ObjectId().toOid(),
            title: { value: '', type: 'shortText' },
            children: []
        };
        entity.children.push(_.clone(newEntity));
        entityService.insert(newEntity).then(function(result) {
            $scope.currentEntity = newEntity;
        }).catch(function(error) {
            console.log(error);
            toastr.error('Error saving new ' + $scope.entityTitle + '.', error);
        });
        // loadedEntities.push(newEntity._id.$oid);
    };

    $scope.resizeFull = function(scope) {
        $state.go('entity', {
            entityTypeName: $scope.entityType,
            entityId: scope.$modelValue._id.$oid
        });
    };
    $scope.collapseAll = function(clickEvent) {
        clickEvent.stopPropagation();
        $scope.$broadcast('angular-ui-tree:collapse-all');
    };

    $scope.expandAll = function(clickEvent) {
        clickEvent.stopPropagation();
        $scope.$broadcast('angular-ui-tree:expand-all');
    };
}
