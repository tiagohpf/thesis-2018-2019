/*
 * The MIT License
 *
 * Copyright (c) 2013, Sebastian Sdorra
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('fuxiDashboard', [
  'adf',
  'fuxiDashboard.widgets.weather',
  'fuxiDashboard.widgets.linklist',
  'fuxiDashboard.widgets.iframe',
  'LocalStorageModule',
  'structures',
  'ngRoute'
])
.controller('fuxiDashboard', function ($scope, localStorageService, $timeout) {

    //#NS - clear localStorage
    localStorageService.clearAll();

    var getID = function () {
        return Math.floor((Math.random() * 100000) + 1);
    }

    $scope.dashboardsData = [];
    $scope.dashboardsData.push({ id: 1, "title": "Dashboard #1", "structure": "12/4-4-4/12", "visible": true, 'editMode': true , 'actions' : {'delete': false, 'edit': false } });
    $scope.dashboardsData.push({ id: 2, "title": "Dashboard #2", "structure": "12/4-4-4", "visible": true, 'actions': { 'delete': true, 'edit': true }, "rows": [{ "columns": [{ "styleClass": "col-md-12", "widgets": [{ "type": "linklist", "config": { "links": [{ "title": "Aves PT", "href": "http://www.avespt.com" }, { "title": "Google", "href": "http://www.google.pt" }] }, "title": "Links" }] }] }, { "columns": [{ "styleClass": "col-md-4", "widgets": [{ "type": "weather", "config": { "location": "Aveiro, PT" }, "title": "Weather - Aveiro" }] }, { "styleClass": "col-md-4", "widgets": [] }, { "styleClass": "col-md-4", "widgets": [] }] }] });
    $scope.dashboardsData.push({ id: 3, "title": "Dashboard #3", "structure": "12/4-4-4", "visible": true, 'actions': { 'delete': false, 'edit': false }, "rows": [{ "columns": [{ "styleClass": "col-md-12", "widgets": [] }] }, { "columns": [{ "styleClass": "col-md-4", "widgets": [{ "type": "weather", "config": { "location": "Lisbon, PT" }, "title": "Weather Lisbon" }] }, { "styleClass": "col-md-4", "widgets": [] }, { "styleClass": "col-md-4" }] }] });

    $scope.dBoardCount = function () {
        return $scope.dashboardsData.length - 1;
    }

    $scope.url = '';
    $scope.loadDBoard = function (boardIdx) {

        $scope.url = 'partials/content.html?';
        getModelData(boardIdx);
        $scope.url += 'idx=' + boardIdx;
        $scope.dBoardIndexLoaded = boardIdx;

        return $scope.url + "&t=" + Date.now();
    }

    var getModelData = function (boardIdx) {
        var name = 'sample-' + boardIdx;
        var model = localStorageService.get(name);
        if (!model) {
            model = $scope.dashboardsData[boardIdx];
        }

        $scope.name = name;
        $scope.model = model;
    }
    var setDefaultModelData = function () {
        var id = getID();
        var model = { id: id, "title": "Dashboard #" + id, "structure": "12/4-4-4/12", "visible": true, 'editMode': false, 'actions': { 'delete': true, 'edit': true } };
        $scope.dashboardsData.push(model);
    }

    $scope.removeDBoard = function (idx) {

        if (confirm('Delete Dashboard! Are you sure?')) {
            $scope.dashboardsData.splice(idx, 1);
            localStorageService.remove($scope.name);
            var nidx = $scope.dBoardCount()
            $scope.loadDBoard(nidx);

        }
    }
    $scope.newDBoard = function () {
        setDefaultModelData();
        $scope.loadDBoard($scope.dBoardCount());

        // call edit    
        //if ($scope.model.editMode)
        {
            $scope.callback = function () { $scope.$broadcast("editDashboardClick", { 'newDBoard': true }) };
        }
    }

    $scope.$on('adfAddDashboard', function (event, name, model) {
        $scope.newDBoard();
    });
    $scope.$on('$includeContentLoaded', function (event) {
        $timeout(function () {
            if ($scope.callback) {
                $scope.callback();
                $scope.callback = undefined;
            }

            //un-select all tabs
            var $lis = $("li", $("#divDashboards"));
            $lis.removeClass('active');

            // select tab                    
            var idx = $scope.dBoardIndexLoaded;
            var $li = $lis.eq(idx);
            $li.addClass('active');

        }, 0);
    });

    // filter widget
    $scope.widgetFilter = function (widget, type) {
        return true;//type.indexOf('github') >= 0 || type === 'markdown';
    };
    $scope.$on('adfDashboardChanged', function (event, name, model) {
        localStorageService.set(name, model);
    });

});