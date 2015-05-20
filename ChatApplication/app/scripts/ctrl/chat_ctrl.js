angular.module('AppController').controller('chat_ctrl',['$scope' , 'broadcast',  function($scope,broadcast) {

  $scope.CurrentRoom ='fqw';  // 현재방이름 출력
  $scope.roomList = [];
  $scope.nickNames = [];
  var temp;

  $scope.EntireMsg = {
    outputMsg : [],  // 채팅메세지
    SystemMsg : []  // // 시스템메세지 (채팅입장,닉네임변경,채팅방생성 등)
  };

  if (broadcast == 777)   {// 로그인을하고 채팅방에입장햇을떄 소켓과 클라이언트가연결된다 . (14행)
    var socket = io.connect(); // 1.3.5v --> io();   io.connect함수로 서버와 연결을하고 반환값으로 클라이언트를 반환.
    var chatApp = new Chat(socket,[]);

    socket.on('nameResult', function(result) {
      if (result.success)
        $scope.EntireMsg.SystemMsg.push('당신의 이름은 ' + result.name + ','); // chatApp.SystemmessageArray.push('You are now known as ' + result.name + ',');
      else
        $scope.EntireMsg.SystemMsg.push(result.message);// chatApp.SystemmessageArray.push( result.message );
    });

    socket.on('whisperError',function(data) {
      $scope.EntireMsg.SystemMsg.push(data);
    });

    $scope.joinRoom = function(room) {
      socket.emit('join', {
        newRoom : room
      })
    }

    socket.on('joinResult',function(result) {
      $scope.CurrentRoom =  result.room;
      $scope.$digest();
    });

    socket.on('rooms',function(result) {   // 자세한설명은 36행 주석을참고
      $scope.roomList.length = 0; // 초기화해야하는이유 2가지중에 1번쨰는 일단 배열의크기가 순식간에 커지므로 서버에 과부하가 걸린다.
      $scope.nickNames.length = 0; // 두번쨰는 아마 AngularJS내부에서 배열의크기가너무커지면 정상동작하지못하게끔하는듯하다??

      for(var i in result.currentRoom) {
        $scope.roomList.push(result.currentRoom[i]);
        $scope.$digest()
      }

      for(var i in result.Entire) {
        if( $scope.CurrentRoom == i ) {
          for(var j in result.Entire[i]) {
            $scope.nickNames.push(result.nickNames[j])

            $scope.$digest()
          }
        }
      }
    });

    setInterval(function() {
      socket.emit('rooms');  // 1초마다 전체 방목록을 실시간업데이트 (서버쪽으로이벤트 발생후 서버에서 다시 클라이언트로 이벤트를발생시켜서 서버쪽에서 필요한 정보를 얻어옴 즉, 클라이언트->서버->클라이언트
    },1000);

    $scope.userMessage = '';  // 사용자가 입력한 메세지값

    $scope.msgRequest = function(userMessage,keyCode) { // 사용자가 메시지를 입력햇을떄
      if(keyCode == 13) {
        var r = chatApp.userInput(userMessage, $scope.CurrentRoom); // 유저가 입력한값을넘김

        if (r == 1)
          $scope.EntireMsg.SystemMsg.push(userMessage);
        else
          $scope.EntireMsg.outputMsg.push(userMessage);
        $scope.userMessage = '';
      }
    }

    socket.on('message',function(message) {
      chatApp.UsermessageArray.push(message.text); // 프로그램에서내뿜는 메시지는 프로토타입에서 푸쉬하고 유저메시지는 소켓이벤트로 푸쉬한다.(그러나 구지 푸쉬를하지않아도된다)
      $scope.EntireMsg.outputMsg.push(message.text);
      //$scope.EntireMsg.SystemMsg = chatApp.SystemmessageArray;
      $scope.$digest();
    });

    socket.on('whisperToClient',function(result) {
      $scope.EntireMsg.outputMsg.push(result.text);
      $scope.$digest();
    });

    socket.on('Cdisconnect',function(message) {
      $scope.EntireMsg.outputMsg.push(message.text);
      $scope.digest();
    })
  }





}]).directive('systemMsg',function($timeout) {
  return {
    restrict : 'EA',
    transclude : true,
    template : '<p> <strong><ng-transclude></ng-transclude></strong> </p>',
    scope : {
      attr : '='
    },
    link : function(scope,elem,attrs,ctrl) {  // 링크함수는 ng-repeat로인해  태그가 동적으로생성될때마다 실행되고 $compile은 태그가전부생성되고나서 한번에 컴파일한다.
      (scope.func = function() {  // link함수 안에서도 scope를 추가핧수잇다.
        $timeout(function () {
          scope.attr.splice(0, 1);
        },3000);
      })();
    }
  }
});
