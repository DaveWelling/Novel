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
]).config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $locationProvider.html5Mode(true); // Remove # from url
    //$urlRouterProvider.when('/', '/gantt');

    $stateProvider
        .state('gantt',{
            url: '/gantt',
            templateUrl: 'src/gantt/ganttTemplate.html',
            controller: 'GanttController'
        })
        .state('novel', {
            url: '/',
            templateUrl: 'src/novel/novelTemplate.html',
            controller: 'NovelController'
        })
        .state('event', {
            url: '/event/:entityId',
            templateUrl: 'src/event/eventTemplate.html',
            controller: 'EventController',
            resolve: {
                entityType: function(){return 'event';},
                novelPropertyName : function(){return 'events';}
            }
        });


});