(function (module) {
    'use strict';

    module.controller('EventController', EventController);

    EventController.$inject = ['EntityService', '$stateParams', '$scope'];

    function EventController(EntityService, $stateParams, $scope) {
        var eventService = new EntityService('event');
        init();


        $scope.entitySubmit = entitySubmit;
        
        function init() {
            eventService.get($stateParams.entityId).then(function (results) {
                $scope.currentEntity = results.data;
            }).catch(function (err) {
                console.error(err);
                toastr.error(err.message, 'Failed to load event');
            });
        }

        function entitySubmit(){
            var eventToUpdate = $scope.currentEntity;
            eventService.update(eventToUpdate).then(function (results) {
                toastr.success(eventToUpdate.title, 'Saved');
            }).catch(function (err) {
                console.error(err);
                toastr.error(err.message, 'Failed to update the novel');
            });
        }
    }


})(angular.module('novel'));