angular.module('novel', [
    'gantt', // angular-gantt.
    'gantt.sortable',
    'gantt.movable',
    'gantt.drawtask',
    'gantt.tooltips',
    'gantt.bounds',
    'gantt.progress',
    'gantt.table',
    'gantt.tree',
    'gantt.groups',
    'gantt.dependencies',
    'gantt.overlap',
    'gantt.resizeSensor',
    'ngAnimate',
    'ui.bootstrap',
    'ui.router',
    'ui.tree',
    'textAngular'
]).constant('config', {
    entities: [
        {name: 'event', plural: 'events'},
        {name: 'character', plural: 'characters'}
    ]
}).config(function($stateProvider, $urlRouterProvider, $locationProvider){
    $locationProvider.html5Mode(true); // Remove # from url
    // $urlRouterProvider.when('/', '/gantt');

    $stateProvider
        .state('gantt', {
            url: '/gantt',
            templateUrl: 'src/gantt/ganttTemplate.html',
            controller: 'GanttController'
        })
        .state('novel', {
            url: '/',
            templateUrl: 'src/novel/novelTemplate.html',
            controller: 'NovelController'
        })
        .state('entity', {
            url: '/:entityTypeName/:entityId',
            templateUrl: 'src/entity/entityTemplate.html',
            controller: 'EntityController'
        });
});