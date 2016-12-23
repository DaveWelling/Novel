angular.module('novel').controller('NovelEntityController', controller);
controller.$inject = ['$scope', 'ObjectId', 'EntityService', '$state'];
function controller($scope, ObjectId, EntityService, $state) {
    var entityService;
    $scope.init = function(entityType, novelPropertyName) {
        $scope.novelArrayProperty = novelPropertyName;
        $scope.entityType = entityType;
        entityService = new EntityService(entityType);
        $scope.entityTitle = _.startCase(entityType);
        $scope.entityPluralTitle = _.startCase(novelPropertyName);
    };
    $scope.isCollapsed = true;
    $scope.currentEntity = {};

    $scope.$on('initComplete', function() {
        var selectedEntity = $scope.novel[$scope.novelArrayProperty][0];
        loadSelectedEntity(selectedEntity);
        $scope.currentEntity = selectedEntity;
    });

    $scope.entitySubmit = function() {
        var entityToUpdate = $scope.currentEntity;
        if (typeof entityToUpdate.rev === 'undefined') {
            entityService.insert(entityToUpdate).then(function(results) {
                $scope.$emit('saveNovel');
            }).catch(function(err) {
                console.error(err);
                toastr.error(err.message, 'Failed to create the novel');
            });
        } else {
            entityService.update(entityToUpdate).then(function(results) {
                toastr.success(_.startCase($scope.entityType) + ' Saved', 'Saved');
                $scope.$emit('saveNovel');
            }).catch(function(err) {
                console.error(err);
                toastr.error(err.message, 'Failed to update the novel');
            });
        }
    };
    $scope.entitySelected = function(scope) {
        var selectedEntity = scope.$modelValue;
        $scope.currentEntity = selectedEntity;
        loadSelectedEntity(selectedEntity);
    };

    function loadSelectedEntity(entity) {
        // loaded already or never saved.
        if (entity.loaded || !entity.rev) return;
        entityService.get(entity._id).then(function(results) {
            _.merge(entity, results.data);
            entity.loaded = true;
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
        entity.children.push(newEntity);
        $scope.currentEntity = newEntity;
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