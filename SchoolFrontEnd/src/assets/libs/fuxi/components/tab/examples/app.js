//Definicao do Modulo

// instanciação dos módulos
angular.module('demo', [])

angular.module('ngApp', ['fxtabs', 'demo']);

var demoModule = angular.module('demo', ['ui.router']);
demoModule.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/demo")    
    $stateProvider.state('demo', {
        url: '/demo',
        templateUrl: 'demo.html'
    }).state('demo.view', {
        url: '/view',
        templateUrl: 'demoView.html',
        controller: function ($scope) {
            $scope.Hello = "Hello world!!!!";
        }
    });

});

demoModule.controller('DemoController', ['$scope', '$state', function (scope, state) {
    var self = this;
    self.reload = 0;

    var editTabAction = {
        label: 'editar configurações',
        icon: "{'glyphicon glyphicon-pencil': true}",
        show: false,
        disabled: false,
        cssClass: 'asd',
        action: 'editTabAction'
    };

    var addWidgetTabAction = {
        label: 'adicionar widget',
        icon: "{'glyphicon glyphicon-plus': true}",
        show: true,
        disabled: false,
        cssClass: 'qwe',
        action: 'addWidgetTabAction',
    };

    var addGlobalFiltersTabAction = {
        label: 'adicionar filtros globais',
        icon: "{'glyphicon glyphicon-plus': true}",
        show: true,
        disabled: false,
        cssClass: 'uyt',
        action: 'addGlobalFiltersTabAction'
    };


    var hideTabAction = {
        label: 'ocultar',
        icon: "{'fa fa-eye-slash': true}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'hideTabAction'
    };

    var defaultTabAction = {
        label: 'marcar como default',
        icon: "{'fuxicons fuxicons-thumb-tack': actionitem.show, 'fuxicons fuxicons-thumb-tack-o': !actionitem.show}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'defaultTabAction'
    };


    var cloneTabAction = {
        label: 'clonar',
        icon: "{'fuxicons fuxicons-clone': true}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'cloneTabAction'
    };


    var exportTabAction = {
        label: 'exportar',
        icon: "{'glyphicon glyphicon-export': true}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'exportTabAction'
    };

    var removeTabAction = {
        label: 'Remover',
        icon: "{'glyphicon glyphicon-remove': true}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'removeTabAction'
    };

    self.getTabActions = function () {
        return [editTabAction, addWidgetTabAction, addGlobalFiltersTabAction, 'divider', cloneTabAction, hideTabAction, exportTabAction, defaultTabAction, 'divider', removeTabAction];
        //return [editTabAction];
    }

    self.getSystemTabActions = function () {
        var sysEditTabAction = angular.copy(editTabAction);
        sysEditTabAction.permission = false;
        return [sysEditTabAction, cloneTabAction, hideTabAction, exportTabAction, 'divider', defaultTabAction];
    }



    self.getTabs = function () {
        return [
            { "id": "1", "title": "Tab 1 com muito texto a visualizar no title da tab!", "active": true, "sortable": true, href:'http://www.google.pt?q=1', status: 'warning', "actions": true, "dismissible": true, "content": "content 1 com algum texto no heading!", "tabactions": self.getTabActions(), "visible": true },
	        { "id": "2", "title": "Tab 2 (UI-ROUTER)", "disabled": false, "active": false, "sortable": true, "actions": true, href: 'http://www.google.pt?q=2', "route": "demo.view", "content": "", status: 'error', "tabactions": self.getTabActions(), "visible": true },
            { "id": "3", "title": "Tab 3", "disabled": true, "active": false, "sortable": false, "actions": true, "content": "content 3", status: 'info', "visible": true },
	        { "id": "4", "title": "Tab 4", "disabled": false, "active": false, "sortable": true, "actions": false, "dismissible": true, "content": "content 4", status: 'success', "visible": true },
            { "id": "5", "title": "Tab 5", "disabled": false, "active": false, "sortable": true, "content": "content 5", "visible": true},
            { "id": "6", "title": "Tab 6", "active": false, "sortable": true, "content": "content 6", "actions": true, "tabactions": self.getTabActions(), "visible": true },
	        { "id": "7", "title": "Tab 7", "active": false, "sortable": true, "content": "content 7", "actions": true, "tabactions": self.getTabActions(), "visible": true }
        ];
    };


    self.getTabs2 = function () {
        return [
            { "id": "1", "title": "Tab 1 com muito texto a visualizar no title da tab!", "active": true, "sortable": true, status: 'warning', "actions": true, "dismissible": true, "content": "content 1 com algum texto no heading!", "tabactions": self.getTabActions() },
	        { "id": "2", "title": "Tab 2 (UI-ROUTER)", "disabled": false, "active": false, "sortable": true, "actions": true, "route": "demo.view", "content": "", status: 'error', "tabactions": self.getTabActions() }
        ];
    };


    self.addTab = function () {
        console.log("add tab called!");

        var id = self.items.length + 1;
        self.items.push({ "id": id, "title": "Tab " + id, "active": true, "sortable": true, "content": "content " + id, "visible": true });

        //self.reload = true;
        self.reload++;
    };

    self.removeTab = function (index) {
        console.log("APP removeTab");
        //console.log(index);
        if (!isNaN(index) && index >= 0) {
            self.items.splice(index, 1);
        } else {
            self.items.splice(self.items.length - 1, 1);
        }

        self.reload++;
    };

    self.removeAllTabs = function () {
        self.items= [];
        self.reload++;
    };

    self.sortable = function (fromIndex, toIndex) {
        //console.log([fromIndex, toIndex]);
        // http://stackoverflow.com/a/7180095/1319998
        self.items.splice(toIndex, 0, self.items.splice(fromIndex, 1)[0]);
    };

    self.items = self.getTabs();

    self.items2 = self.getTabs2();

    self.alertMe = function () {
        setTimeout(function () {
            alert("You've selected the alert tab!");
        });
    };

    self.selected = function (tab) {
        //console.log(["selected...", arguments]);
        
        var promise = state.go(tab.route || 'demo', { id: tab.id }, undefined);
        promise.catch(function () {
            //console.log("promise.catch fired!!!");
        });
                
    };

    self.deselected = function (tab) {
        //console.log(["deselected...", arguments]);
    };


    self.hideTab = function (index){
        console.log("APP: hideTab...: "+index);
        if (!isNaN(index) && index >= 0) {
            self.items[index].visible = false;
        }
        //self.reload++;
    };


    self.showTab = function(tab) {
        console.log("APP: showTab...: " + tab);
        tab.visible = true;
        //self.reload++;
    }


    scope.$on('fxtabAction::editTabAction', function (event, args) {
        console.log('APP: fxtabAction::editTabAction');
        alert("APP: fxtabAction::editTabAction");
    });

    scope.$on('fxtabAction::defaultTabAction', function (event, args) {
        console.log('APP: fxtabAction::defaultTabAction');
        args.show = !args.show;
    });

    scope.$on('fxtabAction::removeTabAction', function (event, args) {
        console.log('APP: fxtabAction::removeTabAction');
        self.removeTab(args.tabIndex);
    });

    scope.$on('fxtabAction::hideTabAction', function (event, args) {
        console.log('APP: fxtabAction::hideTabAction');
        self.hideTab(args.tabIndex);
    });
    

    
}]);

demoModule.controller('DemoController2', ['$scope', '$state', function (scope, state) {
    var self = this;
    self.reload = 0;

    var editTabAction = {
        label: 'editar configurações',
        icon: "{'glyphicon glyphicon-pencil': true}",
        show: false,
        disabled: false,
        cssClass: 'asd',
        action: 'editTabAction'
    };

    var addWidgetTabAction = {
        label: 'adicionar widget',
        icon: "{'glyphicon glyphicon-plus': true}",
        show: true,
        disabled: false,
        cssClass: 'qwe',
        action: 'addWidgetTabAction',
    };

    var addGlobalFiltersTabAction = {
        label: 'adicionar filtros globais',
        icon: "{'glyphicon glyphicon-plus': true}",
        show: true,
        disabled: false,
        cssClass: 'uyt',
        action: 'addGlobalFiltersTabAction'
    };


    var hideTabAction = {
        label: 'ocultar',
        icon: "{'fa fa-eye-slash': true}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'hideTabAction'
    };

    var defaultTabAction = {
        label: 'marcar como default',
        icon: "{'fuxicons fuxicons-thumb-tack': actionitem.show, 'fuxicons fuxicons-thumb-tack-o': !actionitem.show}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'defaultTabAction'
    };


    var cloneTabAction = {
        label: 'clonar',
        icon: "{'fuxicons fuxicons-clone': true}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'cloneTabAction'
    };


    var exportTabAction = {
        label: 'exportar',
        icon: "{'glyphicon glyphicon-export': true}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'exportTabAction'
    };

    var removeTabAction = {
        label: 'Remover',
        icon: "{'glyphicon glyphicon-remove': true}",
        show: true,
        disabled: false,
        cssClass: '',
        action: 'removeTabAction'
    };

    self.getTabActions = function () {
        return [editTabAction, addWidgetTabAction, addGlobalFiltersTabAction, 'divider', cloneTabAction, hideTabAction, exportTabAction, defaultTabAction, 'divider', removeTabAction];
        //return [editTabAction];
    }

    self.getTabs = function () {
        return [
            { "id": "1", "title": "Tab 1 com muito texto a visualizar no title da tab!", "active": true, "sortable": true, "dismissible": true, "content": "content 1 com algum texto no heading!", "actions": true, "tabactions": self.getTabActions()},
	        { "id": "2", "title": "Tab 2", "disabled": false, "active": false, "sortable": false, "content": "content 2", "actions": true, "tabactions": self.getTabActions() },
            { "id": "3", "title": "Tab 3", "disabled": true, "active": false, "sortable": false, "content": "content 3", "actions": true, "tabactions": self.getTabActions() },
	        { "id": "4", "title": "Tab 4", "disabled": false, "active": false, "sortable": true, "dismissible": true, "content": "content 4", "actions": true, "tabactions": self.getTabActions() }
        ];
    };

    self.addTab = function () {
        console.log("add tab called!");

        var id = self.items.length + 1;
        self.items.push({ "id": id, "title": "Tab " + id, "active": true, "sortable": true, "content": "content " + id });

        //self.reload = true;
        self.reload++;
    };

    self.removeTab = function (index) {
        //console.log(index);
        if (!isNaN(index) && index >= 0) {
            self.items.splice(index, 1);
        } else {
            self.items.splice(self.items.length - 1, 1);
        }

        self.reload++;
    };

    self.sortable = function (fromIndex, toIndex) {
        //console.log([fromIndex, toIndex]);
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
        //console.log(["selected...", arguments]);

        var promise = state.go(tab.route || 'demo', { id: tab.id }, undefined);
        promise.catch(function () {
            //console.log("promise.catch fired!!!");
        });

    };

    self.deselected = function (tab) {
        //console.log(["deselected...", arguments]);
    };

    self.hideTab = function (index) {
        //debugger;
        console.log("APP: hideTab...: " + index);
        if (!isNaN(index) && index >= 0) {
            self.items[index].visible = false;
            //tabElm.visible = false;
            //tabElm.scope().$digest();
        }
        //self.reload++;
    };


    self.showTab = function (tab) {
        console.log("APP: showTab...: " + tab);
        tab.visible = true;
        //self.reload++;
    }

    scope.$on('fxtabAction::hideTabAction', function (event, args) {
        console.log('APP2: fxtabAction::hideTabAction');
        self.hideTab(args.tabIndex);
    });

    
}]);
