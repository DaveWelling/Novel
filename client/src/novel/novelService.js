(function (module) {
    'use strict';

    module.service('novelService', service);

    service.$inject = ["$http"];

    function service($http) {
        //ctor
        function NovelService() {
            // public interface
            this.get = get;
            this.update = update;
            this.insert = insert;

            function insert(entity){
                var novelToSave = stripEventTree(entity);
                return $http.post('/api/novel', novelToSave).then(function(){
                    entity.rev=0;
                });
            }

            function get() {
                return $http.get('/api/novel');
            }

            function update(entity){
                var novelToSave = stripEventTree(entity);
                return $http.put('/api/novel', novelToSave).then(function(){
                    entity.rev++;
                });
            }
        }

        function stripEventTree(novel){
            var newNovel = _.omit(novel, ['events']);
            newNovel.events = recursiveStripEventTree(novel.events);
            return newNovel;
        }

        /**
         * Only allow bare essentials to be saved with the novel's event tree.
         * (All else is saved to individual event documents)
         * @param eventTree
         * @returns {Array}
         */
        function recursiveStripEventTree(eventTree){
            var newTree = [];
            if (eventTree) {
                eventTree.forEach(function (event) {
                    var newEvent = _.pick(event, ['_id', 'title', 'rev']);
                    if (!event._id.$oid) {
                        event._id = event._id.toOid();
                    }
                    newEvent.children = recursiveStripEventTree(event.children);
                    newTree.push(newEvent);
                });
            }
            return newTree;
        }

        return new NovelService();
    }
})(angular.module('novel'));