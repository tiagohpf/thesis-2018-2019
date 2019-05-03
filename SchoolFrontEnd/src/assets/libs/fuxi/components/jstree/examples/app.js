// Definicao do Modulo
// instanciação dos módulos
angular.module('demo', [])
angular.module('ngApp', ['fxtree', 'demo']);

var demoModule = angular.module('demo');

demoModule.controller('DemoController', ['$scope', 'treeServices', function ($scope, treeServices) {
    var self = this;

    // do something!!!

}]).directive('fxInstTree', ['$timeout', 'treeServices', function ($timeout, treeServices) {
    getAdditionalTreePlugins = function () {
        var plugins = ['search', 'fxsearchmatch', 'checkbox'];

        return plugins;
    };

    getAdditionalTreePluginsConfiguration = function () {
        /*jshint camelcase: false */
        return [
            {
                key: 'search',
                value: {
                    show_only_matches: true
                }
            },
            {
                key: 'checkbox',
                value: {
                    three_state: false
                }
            }
        ];
        /*jshint camelcase: false */
    };

    getAdditionalTreeCoreConfiguration = function () {
        return [
            {
                key: 'themes',
                value: {
                    name: 'fuxi',
                    icons: false
                }
            },
            {
                key: 'multiple',
                value: true
            },
            {
                key: 'check_callback',
                value: true
            }
        ];
    };

    return {
        restrict: 'A',
        require: '?fxTree',
        link: function (scope, element, attrs, ctrl) {
            console.log("ctrl", ctrl);
            console.log("attrs", attrs);
            
            var treeCtrl = ctrl,
                treeObj;

            treeCtrl.treeAfterLoad = function () {
                treeObj = treeServices.getTree(attrs.id).tree;
                console.log("treeAfterLoad : ", treeObj);
            };
            
            treeCtrl.treeElementClicked = function (ev, data) {
                console.log("treeElementClicked: ev, data", ev , data);
            };

            treeCtrl.onRequestSuccess = function (tree, data) {
                console.log("onRequestSuccess tree,data:", tree, data);
            };
            treeCtrl.onRequestError = function (data, status) {
                console.log("onRequestError status, data:", status, data);
            };


            treeCtrl.callInitializeTreeWithRest(getAdditionalTreePlugins(), getAdditionalTreePluginsConfiguration(), getAdditionalTreeCoreConfiguration());
        }
    };
}]);
