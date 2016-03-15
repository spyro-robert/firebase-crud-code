/* Setup general page controller */
angular.module('foundationApp').controller('UserGroupController', ['$rootScope', '$scope', 'settings', 'UserGroup',
    function($rootScope, $scope, settings, UserGroup) {
        $scope.groups = [];

        UserGroup.groups().then(function(groups){
            $scope.groups = groups;
        });
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();

            Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_groups'));

            // set default layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
        });

        $scope.init = function() {

        };
    }]);
