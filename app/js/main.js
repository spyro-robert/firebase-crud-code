var foundationApp = angular.module("foundationApp", [
    "ui.router",
    "oc.lazyLoad",
    "ngSanitize",
    "firebase"
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
foundationApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

/* Setup App Main Controller */
foundationApp.controller('AppController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function () {
        App.initComponents(); // init core components
    });
}]);

/* Setup Layout Part - Header */
foundationApp.controller('HeaderController', ['$scope', '$state', 'User', function ($scope, $state, User) {
    $scope.user = {};

    $scope.$on('$includeContentLoaded', function () {
        Layout.initHeader(); // init header

        $scope.user = User.user();
    });

    $scope.logout = function() {
        User.logout(function() {
            $state.go('signin');
        });
    };
}]);

/* Setup Layout Part - Sidebar */
foundationApp.controller('SidebarController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Sidebar */
foundationApp.controller('PageHeadController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
foundationApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
foundationApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard.html");

    $stateProvider

        // Dashboard
        .state('dashboard', {
            url: "/dashboard.html",
            templateUrl: "views/dashboard.html",
            data: {pageTitle: 'Admin Dashboard Template'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'foundationApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/global/plugins/morris/morris.css',
                            'assets/global/plugins/morris/morris.min.js',
                            'assets/global/plugins/morris/raphael-min.js',
                            'assets/global/plugins/jquery.sparkline.min.js',

                            'assets/pages/scripts/dashboard.min.js',
                            'js/controllers/DashboardController.js',
                        ]
                    });
                }]
            }
        })

        // User Authentication
        .state('signin', {
            url: "/signin",
            templateUrl: "views/auth/signin.html",
            data: {pageTitle: 'Signin'},
            controller: "AuthController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'foundationApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            'assets/pages/css/login-2.css',

                            'js/controllers/AuthController.js'
                        ]
                    });
                }]
            }
        })

        // User Group
        .state('usergroup', {
            url: "/groups",
            templateUrl: "views/groups.html",
            data: {pageTitle: 'User Groups'},
            controller: "UserGroupController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'foundationApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [,
                            'js/controllers/UserGroupController.js',
                        ]
                    });
                }]
            }
        })

        // User Profile
        .state("profile", {
            url: "/profile",
            templateUrl: "views/profile/main.html",
            data: {pageTitle: 'User Profile'},
            controller: "UserProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'foundationApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            'assets/pages/css/profile.css',

                            'assets/global/plugins/jquery.sparkline.min.js',
                            'assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            'assets/pages/scripts/profile.min.js',

                            'js/controllers/UserProfileController.js'
                        ]
                    });
                }]
            }
        })

        // User Profile Dashboard
        .state("profile.dashboard", {
            url: "/dashboard",
            templateUrl: "views/profile/dashboard.html",
            data: {pageTitle: 'User Profile'}
        })

        // User Profile Account
        .state("profile.account", {
            url: "/account",
            templateUrl: "views/profile/account.html",
            data: {pageTitle: 'User Account'}
        })

        // User Profile Help
        .state("profile.help", {
            url: "/help",
            templateUrl: "views/profile/help.html",
            data: {pageTitle: 'User Help'}
        })

}]);

/* Init global settings and run the app */
foundationApp.run(["$rootScope", "settings", "$state", "$stateParams", "User", function ($rootScope, settings, $state, $stateParams, User) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // settings to be accessed from view
    $rootScope.$stateParams = $stateParams; // stateParams to be accessed from view

    // Listen to '$locationChangeSuccess', not '$stateChangeStart'
    $rootScope.$on('$locationChangeSuccess', function() {
        if ( User.isLoggedIn() ){
            settings.bodyClass = 'page-header-fixed page-sidebar-closed-hide-logo page-container-bg-solid page-sidebar-closed-hide-logo page-on-load';
            settings.signinpage = false;
        } else {
            // if (User.isCheckedAuth()) {
            settings.bodyClass = 'login';
            settings.signinpage = true;
            $state.go('signin');
        }
    })
}]);
