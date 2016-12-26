(function(module) {
    'use strict';

    module.service('novelService', service);

    service.$inject = ['$http', 'EntityService', 'config'];

    function service($http, EntityService, config) {
        var novelService = new EntityService('novel');
        var monkeyPatch = novelService.patch;
        novelService.patch = function(newEntity, previousEntity) {
            var novelToSave = stripTrees(newEntity);
            return monkeyPatch(novelToSave, previousEntity);
        };
        return novelService;

        function stripTrees(novel) {
            var newNovel = _.omit(novel, _.concat(config.entities, 'loaded'));
            config.entities.forEach(function(entity) {
                newNovel[entity.plural] = recursiveStripTree(novel[entity.plural]);
            });
            return newNovel;
        }

        /**
         * Only allow bare essentials to be saved with the novel's event tree.
         * (All else is saved to individual event documents)
         * @param eventTree
         * @returns {Array}
         */
        function recursiveStripTree(tree) {
            var newTree = [];
            if (tree) {
                tree.forEach(function(entity) {
                    var newEntity = _.pick(entity, ['_id', 'title']);
                    newEntity.children = recursiveStripTree(entity.children);
                    newTree.push(newEntity);
                });
            }
            return newTree;
        }
    }
})(angular.module('novel'));