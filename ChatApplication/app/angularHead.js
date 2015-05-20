angular.module('app',['ngRoute','assistApp']);

angular.module('assistApp',['AppController','ResSvc']);

angular.module('ResSvc',['ngResource']);

angular.module('AppController',['ngAnimate']);

angular.module('app').config(['$routeProvider',function($routeProvider) {
  $routeProvider.when('/login' , { templateUrl : 'app/scripts/template/login_tmpl.html' , controller : 'login_ctrl' })
    .when('/signup', { templateUrl : 'app/scripts/template/signup_tmpl.html' , controller : 'sign_ctrl' })
    .when('/main',{ templateUrl : 'app/scripts/template/main_tmpl.html' } ).
    when('/chat',{templateUrl : 'app/scripts/template/chat_tmpl.html',controller : 'chat_ctrl' , resolve : {
      broadcast : function() {
        return 777  // 반수로 함수로작성해서 리턴해주어야한다. 컨트롤러함수는 함수만을 인자로취할수잇기떄문.
      }
    } } ).
    otherwise( { redirectTo : '/main'});
}]).controller('mainCtrl',['$scope','$route','$rootScope', function($scope,$route,$rootScope) {
   $scope.me = '';
  $scope.view = true;
  $scope.user;

  $scope.viewFunc = function() {
    if ($scope.me.length >= 3)
      return false;
    return true;
  }

  $rootScope.$on('login',function(e,data) {  // 루트스코프에서 이벤트를들을필요없이 mainCtrl의  $scope로 이벤트를들어도된다.

    $scope.me = data.ID + '님 ' ;
    $scope.user = data;
    //$route.reload();
  });

  }]);







