angular.module('novel').controller('NovelController', controller);

controller.$inject = ['$scope', '$state', 'novelService', 'ObjectId', 'EntityService'];

function controller($scope, $state, novelService, ObjectId, EntityService) {
    var eventService = new EntityService('event');
    // Novel state
    $scope.novel = {title: 'placeholder', events: []};

    init().then(function(){
        $scope.$broadcast('initComplete');
    });

    // Novel Actions
    $scope.novelSubmit = function () {
        novelService.update($scope.novel).then(function (results) {
            toastr.success("Novel Saved", "Saved")
        }).catch(function (err) {
            console.error(err);
            toastr.error(err.message, 'Failed to update the novel');
        });
    };

    $scope.$on('saveNovel', function(){
        $scope.novelSubmit();
    });


    function createStarterEvent(novel) {
        var starterEvent = {
            _id: new ObjectId().toOid(),
            title: {value: 'Start', type: 'shortText'},
            children: []
        };
        return eventService.insert(starterEvent).then(function (results) {
            novel.events = [starterEvent];
            return novelService.update(novel).then(function () {
                $state.transitionTo('novel.events');
            });
        });
    }

    function ensureNovelExists(results){
        if (results.data.length === 0){
            var novel = {
                _id : (new ObjectId()).toOid(),
                title : {
                    value: '',
                    type: 'shortText'
                }
            };
            return novelService.insert(novel).then(function(){
                return novel;
            })
        } else {
            return new Promise(function(resolve){ resolve(results.data[0]);});
        }
    }

    function init() {
        return novelService.get().then(function (results) {
            return ensureNovelExists(results).then(function(novel){
                $scope.novel = novel;
                // Starter event (if none already exist).
                if (!novel.events || novel.events.length === 0) {
                    return createStarterEvent(novel);
                } else {
                    //return $state.transitionTo('novel.events');
                    return new Promise(function(resolve){ resolve();});
                }
            })
        }).catch(function (err) {
            console.error(err);
            toastr.error(err.message, 'Failed to load the novel');
        });
    }
}