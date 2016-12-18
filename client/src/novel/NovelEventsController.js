angular.module('novel').controller('NovelEventsController', controller);
controller.$inject = ['$scope', 'ObjectId', 'eventService', '$stateParams'];
function controller($scope, ObjectId, eventService, $stateParams) {

    $scope.currentEvent = {};

    $scope.$on('initComplete', function(){
        var selectedEvent = $scope.novel.events[0];
        loadSelectedEvent(selectedEvent);
        $scope.currentEvent = selectedEvent;
    });

    $scope.eventSubmit = function(){
        var eventToUpdate = $scope.currentEvent;
        if (typeof eventToUpdate.rev === 'undefined'){
            eventService.insert(eventToUpdate).then(function(results){
                $scope.$emit('saveNovel');
            }).catch(function (err) {
                console.error(err);
                toastr.error(err.message, 'Failed to create the novel');
            });
        } else {
            eventService.update(eventToUpdate).then(function (results) {
                toastr.success("Event Saved", "Saved");
                $scope.$emit('saveNovel');
            }).catch(function (err) {
                console.error(err);
                toastr.error(err.message, 'Failed to update the novel');
            });
        }
    };
    $scope.eventSelected = function(scope){
        var selectedEvent = scope.$modelValue;
        loadSelectedEvent(selectedEvent);
        $scope.currentEvent = selectedEvent;
    };

    function loadSelectedEvent(event){
        // loaded already or never saved.
        if (event.loaded || !event.rev) return;
        eventService.get(event._id).then(function(results){
            _.merge(event, results.data);
            event.loaded = true;
        }).catch(function(err){
            console.error(err);
            toastr.error(err.message, 'Failed to load event ' + event.title);
        })
    }

    $scope.remove = function (scope, clickEvent) {
        clickEvent.stopPropagation();
        scope.remove();
    };

    $scope.toggle = function (scope, clickEvent) {
        clickEvent.stopPropagation();
        scope.toggle();
    };

    $scope.moveLastToTheBeginning = function () {
        var a = $scope.data.pop();
        $scope.data.splice(0, 0, a);
    };

    $scope.newSubItem = function (scope, clickEvent) {
        clickEvent.stopPropagation();
        var event = scope.$modelValue;
        var newEvent = {
            _id: new ObjectId().toOid(),
            title: {value:'', type:'shortText'},
            children: []
        };
        event.children.push(newEvent);
        $scope.currentEvent = newEvent;
    };

    $scope.collapseAll = function () {
        $scope.$broadcast('angular-ui-tree:collapse-all');
    };

    $scope.expandAll = function () {
        $scope.$broadcast('angular-ui-tree:expand-all');
    };

    // $scope.data = [{
    //     'id': 1,
    //     'title': 'node1',
    //     'children': [
    //         {
    //             'id': 11,
    //             'title': 'node1.1',
    //             'children': [
    //                 {
    //                     'id': 111,
    //                     'title': 'node1.1.1',
    //                     'children': []
    //                 }
    //             ]
    //         },
    //         {
    //             'id': 12,
    //             'title': 'node1.2',
    //             'children': []
    //         }
    //     ]
    // }, {
    //     'id': 2,
    //     'title': 'node2',
    //     'nodrop': true, // An arbitrary property to check in custom template for nodrop-enabled
    //     'children': [
    //         {
    //             'id': 21,
    //             'title': 'node2.1',
    //             'children': []
    //         },
    //         {
    //             'id': 22,
    //             'title': 'node2.2',
    //             'children': []
    //         }
    //     ]
    // }, {
    //     'id': 3,
    //     'title': 'node3',
    //     'children': [
    //         {
    //             'id': 31,
    //             'title': 'node3.1',
    //             'children': []
    //         }
    //     ]
    // }];
}