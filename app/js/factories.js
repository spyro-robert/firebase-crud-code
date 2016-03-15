foundationApp
    .factory('settings', ['$rootScope', function ($rootScope) {
        // supported languages
        var settings = {
            layout: {
                pageSidebarClosed: false, // sidebar menu state
                pageContentWhite: true, // set page content layout
                pageBodySolid: false, // solid body color state
                pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
            },
            assetsPath: 'assets',
            globalPath: 'assets/global',
            layoutPath: 'assets/layouts/layout4',
            firebaseUrl: 'https://foundation-app.firebaseio.com/',
            bodyClass: 'login',
            signinpage: true,
            checkedAuth: false
        };

        $rootScope.settings = settings;

        return settings;
    }])
    .service('User', ['settings', 'userPromise', 'simpleLogin', '$q', function( settings, userPromise, simpleLogin, $q ) {
        var curUser = {};
        var loggedIn = false;
        var checkedAuth = false;

        return {
            user: function() {
                return curUser;
            },
            checkAuth: function() {
                var deferred = $q.defer();
                userPromise.getPromise({}).then(
                    function(userInfo){
                        curUser = userInfo;
                        loggedIn = true;
                        settings.signinpage = false;
                        settings.bodyClass = 'page-header-fixed page-sidebar-closed-hide-logo page-container-bg-solid page-sidebar-closed-hide-logo page-on-load';
                        settings.checkedAuth = true;
                        deferred.notify('get user profile');
                        deferred.resolve();
                    }).catch(function(err){
                        settings.checkedAuth = true;
                    });
                return deferred.promise;
            },
            setUserInfo: function( user ) {
                curUser = user;
                loggedIn = true;
                settings.signinpage = false;
                settings.bodyClass = 'page-header-fixed page-sidebar-closed-hide-logo page-container-bg-solid page-sidebar-closed-hide-logo page-on-load';
            },
            isLoggedIn: function() {
                return loggedIn;
            },
            isCheckedAuth: function() {
                return checkedAuth;
            },
            logout: function() {
                simpleLogin.$logout();
                curUser = {};
                loggedIn = false;
                settings.signinpage = true;
                settings.bodyClass = 'signin';

                location.href = '#/signin';
            }
        };
    }])
    .service('UserGroup', ['$firebase', '$q', 'userPromise', 'settings', function ($firebase, $q, userPromise, settings) {
        var groupsURL = new Firebase(settings.firebaseUrl + 'groups/');
        var groups = function () {
            var deferred = $q.defer();
            var all_groups = $firebase(groupsURL).$asArray();
            all_groups.$loaded().then(function () {
                deferred.notify('Get all user groups');
                deferred.resolve(all_groups);
            });

            return deferred.promise;
        };

        var currentPromise = function () {
            var deferred = $q.defer();
            groups().then(function (all_groups) {
                deferred.notify('get default group');
                deferred.resolve(all_groups[0]);
            });
            //return promise
            return deferred.promise;
        };

        var updatePromise = function (groupInfo) {
            var deferred = $q.defer();
            groupInfo.$save().then(function () {
                deferred.notify('update group info');
                deferred.resolve({});
            });
            //return promise
            return deferred.promise;
        };

        var getGroup = function (gid) {
            var deferred = $q.defer();
            var groupUrl = new Firebase(settings.firebaseUrl + 'groups/' + gid);
            var group = $firebase(groupUrl).$asObject();
            group.$loaded().then(function () {
                deferred.notify('get user group by ' + gid);
                deferred.resolve(group);
            });
            return deferred.promise;
        };

        var addGroup = function (groupInfo) {
            var deferred = $q.defer();
            var Group = $firebase(groupsURL).$asArray();
            Group.$add(groupInfo).then(function () {
                deferred.notify('added a new group');
                deferred.resolve({});
            });
            return deferred.promise;
        };

        var removeGroup = function (gid) {
            var deferred = $q.defer();
            var Group = $firebase(groupsURL).$asArray();
            Group.$remove(Group[gid]).then(function () {
                deferred.notify('removed group');
                deferred.resolve({});
            });
        };

        return {
            groups: groups,
            current: currentPromise,
            update: updatePromise,
            get: getGroup,
            add: addGroup,
            remove: removeGroup
        };
    }])
    .service("simpleLogin", ['$firebaseSimpleLogin', '$firebase', 'settings', function ($firebaseSimpleLogin, $firebase, settings) {
        var ref = new Firebase(settings.firebaseUrl);
        var authProvider = $firebaseSimpleLogin(ref);
        return authProvider;
    }])
    .service("userPromise", ['simpleLogin', '$firebase', '$q', 'settings', function (simpleLogin, $firebase, $q, settings) {
        //function returnPromise will generate a promise that will get the authenticated user, make a profile if it doesn't exist,
        //and then return both objects on resolution.
        var returnPromise = function (profile) {
            var user, publicUser;
            var deferred = $q.defer();

            //this function will take a user object and check for existing profile "publicUser" and create it if not
            var getPublicUser = function (auth_user) {
                var ref = new Firebase(settings.firebaseUrl);
                var remoteUser = $firebase(ref.child('users').child(auth_user.uid)).$asObject();
                remoteUser.$loaded().then(function () {
                    if (remoteUser.profile) {
                        deferred.notify('Existing public profile');
                        publicUser = remoteUser;
                        deferred.resolve({user: user, profile: remoteUser.profile});
                    } else {
                        deferred.notify('New user - initializing profile');

                        // remoteUser.profile_img_url = auth_user.thirdPartyUserData.profile_image_url;
                        remoteUser.profile = profile;
                        remoteUser.$save(function () {
                            console.log('successfully saved')
                        });  //save to firebase
                        publicUser = remoteUser;
                        deferred.resolve({user: user, profile: remoteUser.profile});
                    }
                }).catch(function(){ console.log('catch event')});
            };

            //get the authenticated user
            simpleLogin.$getCurrentUser().then(function (userData) {
                if (userData) {
                    deferred.notify('User ' + userData.id + " successfully logged in through simpleLogin");
                    user = userData;
                    //if authenticated, get the public object
                    getPublicUser(userData);
                } else {
                    deferred.reject('Not authenticated')
                }
            }).catch(function(err) {
                console.log( 'catch event' );
            });

            //return promise
            return deferred.promise;
        };
        //return function to generate the promise. We return a function instead of
        //the promise directly so they can regenerate the promise if they fail authentication.
        return {getPromise: returnPromise};
    }]);