'use strict';

angular.module('fuxiDashboard.widgets.iframe', ['adf.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('iframe', {
        title: 'IFrame',
        description: 'Displays a iframe',
        controller: 'iframeCtrl',
        templateUrl: 'scripts/widgets/iframe/iframe.html',
        reload: true,
        edit: {
            templateUrl: 'scripts/widgets/iframe/edit.html'
        }
      });
  }).controller('iframeCtrl', function ($scope, $sce, config) {
      
      $scope.trustSrc = function (src) {
          return $sce.trustAsResourceUrl(src);
      };

      $scope.data = config;
      $scope.src = $scope.trustSrc(config.src);
                              
  });
