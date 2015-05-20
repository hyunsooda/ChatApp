angular.module('AppController').controller('login_ctrl',['$scope','$location','RscFac', function($scope ,$location,RscFac) {
  var count = 0;
  var useraccount;

  $scope.login = function(user) {
    var userInfo = RscFac.query(function(data) {
      for ( var i in userInfo) {
        if(userInfo[i].ID == user.ID) {
          if (userInfo[i].PSWD == user.PSWD)
              useraccount = userInfo[i];
            }
            count = 1;
      }
      if (count == 1) {
        $scope.$emit('login', useraccount);
        alert('성공적으로 로그인되었습니다');
        $location.url('/main');  // 아직 ..

      }
      else
        alert(' 잘못 입력한 것 같습니다 ');

    });


  }

}]);
