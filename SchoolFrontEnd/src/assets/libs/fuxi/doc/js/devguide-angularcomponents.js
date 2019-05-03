var myApp = angular.module('ngApp', ['fxselectboxtree', 'fxtree', 'fxtabs', 'ui.router']);

myApp.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        //.state('root', {
        //    url: "/root",
        //    templateUrl: "partials/angularcomponents/page-default.html"
        //})
        //.state('docs-selectboxtree-root', {
        //    url: "/selectboxtree-root",
        //    templateUrl: "partials/angularcomponents/selectboxtree/selectboxtree-root.html"
        //})
        //.state('docs-tree-root', {
        //    url: "/tree-root",
        //    templateUrl: "partials/angularcomponents/tree/tree-root.html"
        //})
        .state('docs-tabs-root-demo', {
            url: "/tabs-root-demo",
            templateUrl: "partials/angularcomponents/tabs/tabs-demo-view.html",
            controller: function ($scope) {
                $scope.Hello = "Hello";
            }
        })

    // For any unmatched url, send to /selectboxtree-root
    //$urlRouterProvider.otherwise("/selectboxtree-root");
});


myApp.directive('preventDefault', function () {
    return function (scope, element, attrs) {
        $(element).click(function (event) {
            console.log("preventDefault...");
            event.preventDefault();
        });
    }
});
//myApp.directive('scrollSpy', function ($timeout) {
//    return {
//        restrict: 'A',
//        link: function (scope, elem, attr) {
//            var offset = parseInt(attr.scrollOffset, 10)
//            if (!offset) offset = 10;
//            console.log("offset:  " + offset);
//            elem.scrollspy({ "offset": offset });
//            scope.$watch(attr.scrollSpy, function (value) {
//                console.log(value);
//                $timeout(function () {
//                    var $spy = elem.scrollspy('refresh', { "offset": offset });
//                    console.log($spy);
//                }, 1);
//            }, true);
//        }
//    }
//});
myApp.directive("scrollTo", ["$window", function ($window) {
    return {
        restrict: "AC",
        compile: function () {

            function scrollInto(elementId) {                
                if (!elementId) $window.scrollTo(0, 0);
                //check if an element can be found with id attribute
                var el = document.getElementById(elementId);
                if (el) el.scrollIntoView();
            }

            return function (scope, element, attr) {
                element.bind("click", function (event) {
                    scrollInto(attr.scrollTo);
                });
            };
        }
    };
}]);

myApp.controller('AngularComponents', ['$scope', function ($scope) {
    devGuideUtils.setCodeMirror();
    devGuideUtils.setCopyCode(); // copy code block initializer
    devGuideUtils.toggleCode();
    devGuideUtils.onResizeWindow();

    $(window).scrollTop(0);
}])


// SBT
myApp.controller('DevGuideSbtController', ['$scope', 'fxselectboxtreeService', function ($scope, fxselectboxtreeService) {
    var self = this;

    $scope.getData = function () {
        var items = [
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

        for (var i = 24; i <= 501; i++) {
            items.push({ "id": "demo_root_" + i, "parent": "#", "text": "[" + i + "] Item " + i });
        }
        return items;
    }

    $scope.getSelectedValues = function () {
        return [{ "id": "a3", label: "Root 3" }];
    }

    $scope.submit = function () {
        console.log($scope);
        console.log("AngularJS selectboxtree: valid dirty pristine", $scope.formDemo.$valid, $scope.formDemo.$dirty, $scope.formDemo.$pristine);

        $scope.$broadcast('selectBoxTree::formSubmitted');

        alert('Event broadcast: selectBoxTree::formSubmitted');
    }

    //devGuideUtils.setCodeMirror();
    //devGuideUtils.setCopyCode(); // copy code block initializer
    //devGuideUtils.toggleCode();

    //$(window).scrollTop(0);
}]);

// TREE
myApp.controller('DevGuideTreeController', ['$scope', 'treeServices', function ($scope, treeServices) {
    //devGuideUtils.setCodeMirror();
    //devGuideUtils.setCopyCode(); // copy code block initializer
    //devGuideUtils.toggleCode();

    //$(window).scrollTop(0);
}]).directive('fxInstTree', ['$timeout', 'treeServices', function ($timeout, treeServices) {
    getAdditionalTreePlugins = function () {
        var plugins = ['search', 'fxsearchmatch', 'checkbox'];

        return plugins;
    };

    getAdditionalTreePluginsConfiguration = function () {
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
                console.log("treeElementClicked: ev, data", ev, data);
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

// TABS
myApp.controller('DevGuideTabsController', ['$scope', '$state', 'fxtabService', function ($scope, state, fxtabService) {
    var self = this;
    self.reload = 0;

    var editTabAction = {
        label: 'Editar',
        icon: "{'glyphicon glyphicon-pencil': true}",
        show: true,
        disabled: false,
        permission: true,
        action: 'editTabAction'
    };

    var removeTabAction = {
        label: 'Remover',
        icon: "{'glyphicon glyphicon-remove': true}",
        show: true,
        disabled: true,
        permission: true,
        action: 'removeTabAction'
    };

    var defaultTabAction = {
        label: 'Default',
        icon: "{'fuxicons fuxicons-thumb-tack': actionitem.show, 'fuxicons fuxicons-thumb-tack-o': !actionitem.show}",
        show: true,
        disabled: false,
        permission: true,
        action: 'defaultTabAction'
    };

    self.getTabActions = function () {
        return [editTabAction, removeTabAction, 'divider', defaultTabAction];
    }

    self.getTabs = function () {
        return [
            {
                "id": "1", "title": "Tab 1",
                "active": true,
                "sortable": true,
                status: 'warning',
                "actions": true,
                "dismissible": true,
                "content": "content 1",
                "tabactions": self.getTabActions()
            },
            {
                "id": "2",
                "title": "Tab 2 ui router",
                "disabled": false,
                "active": false,
                "sortable": true,
                "actions": true,
                "route": "docs-tabs-root-demo",
                "content": "content 2",
                status: 'error',
                "tabactions": self.getTabActions()
            },
            {
                "id": "3",
                "title": "Tab 3",
                "disabled": true,
                "active": false,
                "sortable": false,
                "actions": false,
                "content": "content 3"
            },
            {
                "id": "4",
                "title": "Tab 4",
                "disabled": false,
                "active": false,
                "sortable": true,
                "actions": false,
                "dismissible": true,
                "content": "content 4",
                status: 'success'
            },
            {
                "id": "5",
                "title": "Tab 5",
                "disabled": false,
                "active": false,
                "sortable": true,
                "content": "content 5"
            },
            {
                "id": "6",
                "title": "Tab 6",
                "active": false,
                "sortable": true,
                "content": "content 6",
                "actions": true,
                "tabactions": self.getTabActions()
            }
        ];
    };

    self.addTab = function () {
        console.log("add tab called!");

        var id = self.items.length + 1;
        self.items.push({ "id": id, "title": "Tab " + id, "active": true, "sortable": true, "content": "content " + id });

        self.reload++;
    };

    self.removeTab = function (index) {
        if (!isNaN(index) && index >= 0) {
            self.items.splice(index, 1);
        } else {
            self.items.splice(self.items.length - 1, 1);
        }

        self.reload++;
    };

    self.removeAllTabs = function () {
        self.items = [];
        self.reload++;
    };

    self.sortable = function (fromIndex, toIndex) {
        // http://stackoverflow.com/a/7180095/1319998
        self.items.splice(toIndex, 0, self.items.splice(fromIndex, 1)[0]);
    };

    self.items = self.getTabs();

    self.alertMe = function () {
        setTimeout(function () {
            alert("You've selected the alert tab!");
        });
    };

    self.selected = function (tab) {
        if (tab.route) {
            var promise = state.go(tab.route, { id: tab.id }, { location: false }); // don´t change url
            promise.catch(function () { });
        }
    };

    self.deselected = function (tab) { };

    $scope.$on('fxtabAction::editTabAction', function (event, args) {
        console.log('APP: fxtabAction::editTabAction');
        alert("APP: fxtabAction::editTabAction");
    });

    $scope.$on('fxtabAction::defaultTabAction', function (event, args) {
        console.log('APP: fxtabAction::defaultTabAction');
        args.show = !args.show;
    });

    //devGuideUtils.setCodeMirror();
    //devGuideUtils.setCopyCode(); // copy code block initializer
    //devGuideUtils.toggleCode();

    //$(window).scrollTop(0);
}]);

