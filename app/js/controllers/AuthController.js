/* Setup general page controller */
angular.module('foundationApp')
    .controller('AuthController', ['$rootScope', '$scope', 'settings', 'simpleLogin', '$state', '$timeout', 'User', 'userPromise',
        function($rootScope, $scope, settings, simpleLogin, $state, $timeout, User, userPromise) {
            $scope.userInfo = {};
            $scope.registerInfo = {
                fullname: '',
                username: '',
                phone: '',
                groups: [],
                singleAdmins: [],
                useremail: '',
                password: ''
            };
            $scope.forgotInfo = {};

            $scope.currentForm = {
                loginForm: true,
                forgotForm: false,
                registerForm: false
            };

            $scope.signinError = false;
            $scope.signinErrorMessage = '';
            $scope.regError = false;
            $scope.regErrorMessage = '';

            $scope.$on('$viewContentLoaded', function() {
                if ( User.isLoggedIn() ) {
                    userPromise.getPromise({}).then(function(){});
                    $state.go('dashboard');
                    return;
                } else {
                    User.checkAuth(function(userInfo) {
                        $state.go('dashboard');
                    });
                }

                // initialize core components
                App.initComponents();

                // set default layout mode
                $rootScope.settings.layout.pageContentWhite = false;
                $rootScope.settings.layout.pageBodySolid = false;
                $rootScope.settings.layout.pageSidebarClosed = false;

                $scope.handleLogin();
                $scope.handleForgetPassword();
                $scope.handleRegister();
            });

            // load jquery plugin for login form
            $scope.handleLogin = function() {
                $scope.signinError = false;
                $scope.signinErrorMessage = '';
                $('.login-form').validate({
                    errorElement: 'span', //default input error message container
                    errorClass: 'help-block', // default input error message class
                    focusInvalid: false, // do not focus the last invalid input
                    rules: {
                        username: {
                            required: true,
                            email: true
                        },
                        password: {
                            required: true
                        },
                        remember: {
                            required: false
                        }
                    },

                    messages: {
                        username: {
                            required: "Email address is required."
                        },
                        password: {
                            required: "Password is required."
                        }
                    },

                    invalidHandler: function(event, validator) { //display error alert on form submit
                        $scope.signinError = true;
                        $scope.signinErrorMessage = 'Enter your email address and password.';
                    },

                    highlight: function(element) { // hightlight error inputs
                        $(element)
                            .closest('.form-group').addClass('has-error'); // set error class to the control group
                    },

                    success: function(label) {
                        label.closest('.form-group').removeClass('has-error');
                        label.remove();
                    },

                    errorPlacement: function(error, element) {
                        error.insertAfter(element.closest('.input-icon'));
                    },

                    submitHandler: function(form) {
                        $scope.submitLogin();
                    }
                });

                $('.login-form input').keypress(function(e) {
                    if (e.which == 13) {
                        if ($('.login-form').validate().form()) {
                            $scope.submitLogin();
                        }
                        return false;
                    }
                });
            };

            // load jquery plugin for forgot password form
            $scope.handleForgetPassword = function() {
                $('.forget-form').validate({
                    errorElement: 'span', //default input error message container
                    errorClass: 'help-block', // default input error message class
                    focusInvalid: false, // do not focus the last invalid input
                    ignore: "",
                    rules: {
                        email: {
                            required: true,
                            email: true
                        }
                    },

                    messages: {
                        email: {
                            required: "Email is required."
                        }
                    },

                    invalidHandler: function(event, validator) { //display error alert on form submit

                    },

                    highlight: function(element) { // hightlight error inputs
                        $(element)
                            .closest('.form-group').addClass('has-error'); // set error class to the control group
                    },

                    success: function(label) {
                        label.closest('.form-group').removeClass('has-error');
                        label.remove();
                    },

                    errorPlacement: function(error, element) {
                        error.insertAfter(element.closest('.input-icon'));
                    },

                    submitHandler: function(form) {
                        $scope.forgotPassword();
                    }
                });

                $('.forget-form input').keypress(function(e) {
                    if (e.which == 13) {
                        if ($('.forget-form').validate().form()) {
                            $scope.forgotPassword();
                        }
                        return false;
                    }
                });

            };

            // load jquery plugin for register form
            $scope.handleRegister = function() {

                $('.register-form').validate({
                    errorElement: 'span', //default input error message container
                    errorClass: 'help-block', // default input error message class
                    focusInvalid: false, // do not focus the last invalid input
                    ignore: "",
                    rules: {

                        fullname: {
                            required: true
                        },
                        email: {
                            required: true,
                            email: true
                        },
                        username: {
                            required: true
                        },
                        password: {
                            required: true
                        },
                        rpassword: {
                            equalTo: "#register_password"
                        }
                    },

                    invalidHandler: function(event, validator) { //display error alert on form submit

                    },

                    highlight: function(element) { // hightlight error inputs
                        $(element)
                            .closest('.form-group').addClass('has-error'); // set error class to the control group
                    },

                    success: function(label) {
                        label.closest('.form-group').removeClass('has-error');
                        label.remove();
                    },

                    errorPlacement: function(error, element) {
                        if (element.attr("name") == "tnc") { // insert checkbox errors after the container
                            error.insertAfter($('#register_tnc_error'));
                        } else if (element.closest('.input-icon').size() === 1) {
                            error.insertAfter(element.closest('.input-icon'));
                        } else {
                            error.insertAfter(element);
                        }
                    },

                    submitHandler: function(form) {
                        $scope.processRegister();
                    }
                });

                $('.register-form input').keypress(function(e) {
                    if (e.which == 13) {
                        if ($('.register-form').validate().form()) {
                            $scope.processRegister();
                        }
                        return false;
                    }
                });
            };

            // submit login function
            $scope.submitLogin = function() {
                simpleLogin.$login('password', {
                    email: $scope.userInfo.useremail,
                    password: $scope.userInfo.password
                })
                    .then(function(user) {
                        // Success callback
                        userPromise.getPromise({}).then(function(userInfo){
                            User.setUserInfo(userInfo);

                            location.href = '#/';
                        });
                    }, function(error) {
                        // Failure callback
                        $scope.signinError = true;
                        $scope.signinErrorMessage = error.message.split(':')[1];
                    });
            };

            $scope.goBack = function() {
                $scope.currentForm = {
                    loginForm: true,
                    forgotForm: false,
                    registerForm: false
                };
            };

            $scope.goForgot = function() {
                $scope.currentForm.forgotForm = true;
                $scope.currentForm.loginForm = false;
            };

            $scope.goRegister = function() {
                $scope.currentForm = {
                    loginForm: false,
                    forgotForm: false,
                    registerForm: true
                };
            };

            $scope.forgotPassword = function() {

            };

            $scope.processRegister = function() {
                simpleLogin.$createUser($scope.registerInfo.useremail, $scope.registerInfo.password)
                    .then(function() {
                        // do things if success
                        simpleLogin.$login('password', {
                            email: $scope.registerInfo.useremail,
                            password: $scope.registerInfo.password
                        })
                            .then(function(user) {
                                // Success callback
                                userPromise.getPromise({
                                    email: $scope.registerInfo.useremail,
                                    userid: user.uid,
                                    username: $scope.registerInfo.username,
                                    fullname: $scope.registerInfo.fullname,
                                    phone: $scope.registerInfo.phone,
                                    groups: [],
                                    singleAdmins: []
                                }).then(function(userInfo){
                                    User.setUserInfo(userInfo);
                                    $state.go('dashboard');
                                });
                            }, function(error) {

                            });
                    }, function(error) {
                        // do things if failure
                        $scope.regError = true;
                        $scope.regErrorMessage = error.message;
                    });
            };
    }]);
