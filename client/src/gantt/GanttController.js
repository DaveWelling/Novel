angular.module('novel').controller('GanttController', controller);

controller.$inject = ['$scope', 'Sample'];

function controller($scope, Sample){

    // angular-gantt options
    $scope.options = {
        tabShown: false,
        getStyle: function () {
            console.log("here");
        },
        mode: 'custom',
        scale: 'day',
        sortMode: undefined,
        sideMode: 'TreeTable',
        daily: false,
        maxHeight: false,
        width: true,
        zoom: 1,
        tooltipContent: '{{task.model.assignedTo}} | {{task.model.name}}</br>           <small>' +
        '{{task.isMilestone() === true && getFromLabel() || getFromLabel() + \' - \' + getToLabel()}}' +
        '</small>',
        columns: ['model.name', 'from', 'to'],
        treeTableColumns: ['from', 'to'],
        columnsHeaders: {'model.name': 'Name', 'from': 'From', 'to': 'To'},
        columnsClasses: {
            'model.name': 'gantt-column-name',
            'from': 'gantt-column-from',
            'to': 'gantt-column-to'
        },
        columnsContents: {
            'from': '<span ng-class="(row.to > row.model.targetDate) && \'overdue\'">{{getValue()}}</span>',
            'to': '<span ng-class="(row.to > row.model.targetDate) && \'overdue\'">{{getValue()}}</span>'
        },
        treeRowContent: '<a class="{{row.model.classes}}" target="_blank" href="{{row.model.httpUrl}}">{{row.model.name}}</a>',
        columnsFormatters: {
            'from': function (from) {
                return from !== undefined ? from.format('YYYY-MM-DD') : undefined;
            },
            'to': function (to) {
                return to !== undefined ? to.format('YYYY-MM-DD') : undefined;
            }
        },
        treeHeaderContent: '<i class="fa fa-align-justify"></i> {{getHeader()}}',
        columnsHeaderContents: {
            'model.name': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
            'from': '<i class="fa fa-calendar"></i> {{getHeader()}}',
            'to': '<i class="fa fa-calendar"></i> {{getHeader()}}'
        },
        autoExpand: 'none',
        taskOutOfRange: 'truncate',
        fromDate: moment(null),
        toDate: undefined,
        rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
        taskContent: '<i class="fa fa-tasks"></i> <a target="_blank" href="{{task.model.httpUrl}}">{{task.model.name}}</a>',
        allowSideResizing: true,
        labelsEnabled: true,
        currentDate: 'none',
        currentDateValue: moment(),
        draw: false,
        readOnly: true,
        groupDisplayMode: 'group',
        filterTask: '',
        filterRow: '',
        filterAssignedTo: '',
        timeFrames: {
            'day': {
                start: moment('8:00', 'HH:mm'),
                end: moment('20:00', 'HH:mm'),
                working: true,
                default: true
            },
            'closed': {
                working: false,
                default: true
            },
            'weekend': {
                working: false
            },
            'holiday': {
                working: false,
                color: 'red',
                classes: ['gantt-timeframe-holiday']
            }
        },
        dateFrames: {
            'weekend': {
                evaluator: isWeekend,
                targets: ['weekend']
            },
            'holiday': {
                evaluator: isHoliday,
                targets: ['holiday']
            }
        },
        timeFramesWorkingMode: 'hidden',
        timeFramesNonWorkingMode: 'cropped',
        columnMagnet: 'column',
        timeFramesMagnet: true,
        dependencies: {
            enabled: false,
            conflictChecker: false
        },
        targetDataAddRowIndex: undefined,
        api: function (api) {
            // API Object is used to control methods and events from angular-gantt.
            $scope.api = api;

            api.core.on.ready($scope, function () {



                // When gantt is ready, load data.
                // `data` attribute could have been used too.
                $scope.load();

            });
        }
    };
    function isWeekend(date){
        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
    }

    function isHoliday(date){
        if (date.month() === 12 && date.date() === 25) return true;
        if (moment(date).isBetween('2016-11-24', '2016-11-25', null, '[]')) return true;
        return false;
    }
    $scope.load = function () {
        // TfsService.getSampleData().then(function (data) {
        //     $scope.data = data;
        //     $scope.allTasks = TfsService.getUnfinishedTasks();  // synchronous operation, but must follow getSampleData.
        //     $scope.resoureAllocations = Resources.getResourceAllocations(); // synchronous operation, but must follow getSampleData
        // }).catch(function (err) {
        //     toastr.error(err.data ? err.data.message : err.message, "Data load Failed");
        //     console.log(err);
        // });

        // ** Left here for debugging the gantt without going to TFS **
        $scope.data = Sample.getSampleData();
        $scope.allTasks = [
            {
                "firstName": "your",
                "lastName": "mom",
                "dob": "lalahalah"
            },
            {
                "firstName": "your",
                "lastName": "mom",
                "dob": "lalahalah"
            },
            {
                "firstName": "your",
                "lastName": "mom",
                "dob": "lalahalah"
            },
            {
                "firstName": "your",
                "lastName": "mom",
                "dob": "lalahalah"
            }];
        dataToRemove = undefined;


        $scope.timespans = Sample.getSampleTimespans();
    };
}