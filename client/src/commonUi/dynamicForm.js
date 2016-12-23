(function(module) {
    module.directive('dynamicForm', dynamicForm);

    dynamicForm.$inject = ['$compile', '$uibModal', 'config'];

    function dynamicForm($compile, $modal, config) {
        const objectPropertiesNotToRender = ['_id', 'rev', 'events', 'children', '$$hashKey', 'loaded'];
        config.entities.forEach(function(entity) {
            objectPropertiesNotToRender.push(entity.plural);
        })
        return {
            templateUrl: "src/commonUi/dynamicFormTemplate.html",
            restrict: 'E',
            scope: { // Isolated scope
                entity: '=',
                submitMethod: '=',
                title: '@'
            },
            link: link
        };
        function link(scope, element, attributes) {
            scope.availableTypes = ['shortText'];
            scope.saveNewField = function(newFieldLabel) {
                saveNewField(scope.entity, newFieldLabel, scope.newFieldType);
            };
            scope.open = function(newFieldType) {
                scope.newFieldType = newFieldType;
                $modal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'myModalContent.html',
                    scope: scope
                });
            };

            scope.$watch('entity', function() {
                redrawEntity(scope, element);
            });
            scope.$watchCollection('entity', function() {
                redrawEntity(scope, element);
            });
        }

        function redrawEntity(scope, element) {
            if (!scope.entity || !scope.entity._id) return;
            scope.formId = scope.entity._id.$oid;
            addNewElements(element, scope.entity, scope);
        }

        function addNewElements(parentElement, entity, scope) {
            var container = parentElement.find('div[name="dynamicFormHolder"]');
            container.empty();
            var form = angular.element('<div class="col-md-11 col-xs-12"><form id="form{{formId}}" name="form{{formId}}"></form></div>');
            $compile(form)(scope);
            container.append(form);
            var newElement = angular.element(getElements(entity));
            $compile(newElement)(scope);
            form.append(newElement);
            var submitButton = angular.element('<div class="col-md-1 col-xs-12"><button class="submitBtn btn btn-novel pull-right" ng-click="submitMethod()"><i class="glyphicon glyphicon-floppy-disk"></i></button></div>');
            $compile(submitButton)(scope);
            container.append(submitButton);

            // addDebugging(form, scope);
        }

        // This doesn't work.  Scoping problem?
        function addDebugging(form, scope) {
            var formId = scope.formId;
            var template = "<span> Dirty: {{form" + formId + ".$dirty}} <br>" +
                "Touched: {{form" + formId + ".$touched}} <br>" +
                "Valid: {{form" + formId + ".$valid}}</span>";
            $compile(template)(scope);
            form.append(template);
        }

        function getElements(entity) {
            var html = '<div>';
            Object.keys(_.omit(entity, objectPropertiesNotToRender)).forEach(function(propertyName) {
                var newHtml = getHtmlForType(propertyName, entity);
                html += addDecorators(newHtml, propertyName, entity);
            });
            html += '</div>';
            return html;
        }

        function getHtmlForType(propertyName, entity) {
            var type = entity[propertyName].type;
            var label = entity[propertyName].label || _.startCase(propertyName);
            var inputId = propertyName + '_' + entity._id;
            var entityValueExpression = 'entity.' + propertyName + '.value';
            switch (type) {
                case 'shortText': {
                    return getShortText(inputId, label, entityValueExpression);
                }
                case 'textArea': {
                    return getTextArea(inputId, label, entityValueExpression);
                }
                default: {
                    throw new Error('Not a supported type: ' + type);
                }
            }
        }

        function saveNewField(entity, fieldLabel, type) {
            entity[_.camelCase(fieldLabel)] = {
                value: getDefaultValue(type),
                type: type,
                label: fieldLabel
            };
        }

        function getShortText(inputId, label, entityValueExpression) {
            return '<div class="form-group label-floating"> ' +
                '<label class="control-label" for="' + inputId + '">' + label + ': </label>' +
                '<input id="' + inputId + '" class="form-control" type="text" ng-model="' + entityValueExpression + '">' +
                '</div>';
        }

        function getTextArea(inputId, label, entityValueExpression) {
            return '<div class="form-group"> ' +
                '<label class="label-static" for="' + inputId + '">' + label + ': </label>' +
                '<text-angular id="' + inputId + '" ng-model="' + entityValueExpression + '"></text-angular>' +
                '</div>';
        }

        function getDefaultValue(type) {
            switch (type) {
                case 'shortText':
                    return '';
                case 'textArea':
                    return '';
                default:
                    throw new Error('A default value is not defined for ' + type + '.');
            }
        }

        function addDecorators(html) {
            var modeDiv = '<div ng-class="{removable: removeMode, moveUpable: moveUpMode, modeDownable: moveDownMode}">';
            return modeDiv + html + '</div>';
        }
    }
})(angular.module('novel'));