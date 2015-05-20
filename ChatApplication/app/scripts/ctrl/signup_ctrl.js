angular.module('AppController').controller('sign_ctrl', ['$scope','RscFac' ,'$location','mongoLabApiKey','$http',
  function($scope,RscFac,$location,mongoLabApiKey,$http) {

  $scope.sign = function(user) {

    if (user.PSWD == user.PSWD2) {

      var userInfo = new RscFac();

      angular.extend(userInfo,user);

      userInfo.$save(function(data,header) {
        alert('ID가 생성되었습니다.');
        $location.url('/main')
      },function(err) {
        alert('fqw');
      });
    }
  }

}]);


