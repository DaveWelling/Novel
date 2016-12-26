(function(module) {
    'use strict';

    module.controller('EntityController', EntityController);

    EntityController.$inject = ['EntityService', '$stateParams', '$scope'];

    function EntityController(EntityService, $stateParams, $scope) {
        var entityName = $stateParams.entityTypeName;
        $scope.entityLabel = _.startCase(entityName);
        var entityService = new EntityService(entityName);
        init();

        $scope.entitySubmit = entitySubmit;

        function init() {
            entityService.get($stateParams.entityId).then(function(results) {
                $scope.currentEntity = results.data;
            }).catch(function(err) {
                console.error(err);
                toastr.error(err.message, 'Failed to load event');
            });
        }

        function entitySubmit() {
            var entityToUpdate = $scope.currentEntity;
            entityService.patch(entityToUpdate).then(function(results) {
                toastr.success(entityToUpdate.title, 'Saved');
            }).catch(function(err) {
                console.error(err);
                toastr.error(err.message, 'Failed to update the novel');
            });
        }
    }
})(angular.module('novel'));