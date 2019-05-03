//Definicao do Modulo

// instanciação dos módulos
angular.module('demo', [])

angular.module('ngApp', ['fxselectboxtree', 'fxtree', 'demo']);

var demoModule = angular.module('demo');
demoModule.controller('DemoController', ['$scope',  'fxselectboxtreeService', function ($scope, fxselectboxtreeService) {
    var self = this;

    $scope.getData = function () {
        var items =     [
            {
                "id": "1", "text": "[1] Root 1", "type": "root",
                "children": [
                    { "id": "111", "text": "Child 1" },
                    { "id": "112", "text": "Child 2" },
                    { "id": "113", "text": "Child 3" },
                    { "id": "114", "text": "Child 4" }]
            },
	        { "id": 2, "text": "[2] Root 2", "type": "root" },
            { "id": "a3", "text": "[3] Root 3", "type": "root-error" }
        ];
        //return items;
        
        for (var i = 24; i <= 501; i++) {
            items.push({ "id": "demo_root_" + i, "parent": "#", "text": "["+ i +"] Item " + i });
        }
        return items;
    }

    $scope.getSelectedValues = function () {
        //return [];
        return [{ "id": "a3", label: "Root 3" }];
    }
    $scope.getSelectedValues1 = function () {
        return [];
        return [{ "id": "a99", label: "Root a99" }, { "id": "a5", label: "Root a5" }, { "id": "a3", label: "Root 3" }];
    }
    $scope.getSelectedValues2 = function () {
        return [{ "id": "a3", label: "Root 3" }];
    }

    // objecto form que fica com os dados do input hidden
    $scope.form = {};
    $scope.form.isInvalid = false;

    $scope.submit = function () {
        // check
        console.log($scope);        
        console.log("valid dirty pristine", $scope.formDemo.$valid, $scope.formDemo.$dirty, $scope.formDemo.$pristine);
        
        //$scope.form.isInvalid = !$scope.form.isInvalid; // DEMO
        
        $scope.$broadcast('selectBoxTree::formSubmitted');

        return false;
    }

    $scope.saveChanges = function () {

        $scope.$broadcast('selectBoxTree::formSubmitted');

    }

    //fxselectboxtreeService.loadCustomLocales({
    //    'fr': {
    //        'MESSAGE-LOADING': 'chargement...',
    //        'PLACEHOLDER-SEARCH': 'recherche ...',
    //        'PLACEHOLDER-ELEMENT': 'select...',
    //        'MESSAGE-EMPTY-DATA': 'données vide...',
            
    //        'REQUEST-ERROR-MSG': 'error loading data!',
    //        'REQUEST-EMPTY-DATA': 'No results found',
    //        'REQUEST-SEARCHING': 'Searching...',
    //        'REQUEST-INITIAL-SEARCH': 'Enter {0} character{1}',
    //        'CHARACTER-PLURAL-SUFFIX': 's'
    //    }
    //});

    console.log("$scope", $scope);

    //fxselectboxtreeService.setCurrentLanguage('fr');
    //fxselectboxtreeService.setLabelByKey("PLACEHOLDER-SEARCH", "!!! search !!!!");

}]).directive('fxDummy', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        require: '?fxSelectBoxTree',
        link: function (scope, element, attrs, ctrl) {
            console.log("ctrl", ctrl);

            $timeout(function () {
                ctrl.SetDisabled();
            }, 5000);

            $timeout(function () {
                ctrl.SetEnabled();
            }, 10000);

        }
    };
}]);

