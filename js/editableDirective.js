// bind blur event
projectIdentity.directive('ngModelOnblur', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attr, ngModelCtrl) {
      if (attr.type === 'radio' || attr.type === 'checkbox') return;

      elm.unbind('input').unbind('keydown').unbind('change');
      elm.bind('blur', function() {
        scope.$apply(function() {
          ngModelCtrl.$setViewValue(elm.val());
        });
      });
    }
  };
});

//editable
projectIdentity.directive("clickToEdit", function() {
  var editorTemplate = '<div class="click-to-edit">' +
    '<div ng-hide="view.editorEnabled">' +
      '{{value}} ' +
      '<a ng-click="enableEditor()">Edit</a>' +
    '</div>' +
    '<div ng-show="view.editorEnabled">' +
      '<input ng-model="view.editableValue" ng-model-onblur ng-change="save()">' +
      '<a href="#" ng-click="save()">Gem</a>' +
      // ' or ' +
      //'<a ng-click="disableEditor()">cancel</a>.' +
    '</div>' +
  '</div>';

  return {
    restrict: "A",
    replace: true,
    template: editorTemplate,
    scope: {
      value: "=clickToEdit"
    },
    link: function(scope, element, attrs) {
      scope.input = element.find('input')[0];
    },
    controller: function($scope, $timeout) {
      $scope.view = {
        editableValue: $scope.value,
        editorEnabled: false
      };

      $scope.enableEditor = function() {
        $scope.view.editorEnabled = true;
        $scope.view.editableValue = $scope.value;

        // focus on input
        $timeout(function() {
          $scope.input.focus();
        });
      };

      $scope.disableEditor = function() {
        $scope.view.editorEnabled = false;
      };

      $scope.save = function() {
        $scope.value = $scope.view.editableValue;
        $scope.disableEditor();
      };
    }
  };
});