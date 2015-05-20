
// 클라이언트측 자바스크립트

var Chat = function(socket,array) {
  this.socket = socket; //  클라이언트
  this.SystemmessageArray = array;  // 프로그램에서 내뿜는 메세지배열 (메세지를 배열형태로저장해서 ng-repeat로 뿌려줄예정)
  this.UsermessageArray = array;  // 유저가 채팅방에서 입력한값을 내뿜는 메세지배열 (메세지를 배열형태로저장해서 ng-repeat로 뿌려줄예정)
}

Chat.prototype.sendMessage = function(room,text) {
  var message = {
    room : room,
    text : text
  };
  this.socket.emit('message',message); // Chat이라는 객체의 socket이라는속성에서 이벤트를발생하고잇다. 즉, 인자로 Chat의 객체를받을필요가없다.
}

Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join',{
    newRoom : room
  });
};

Chat.prototype.processCommand = function(command,roomName) {
  var words = command.split(' ');
  var command = words[0].substring(1,words[0].length).toLowerCase();  /*  슬래쉬를 제외한 값을 소문자로 바꾼다  이값은 switch함수의 인자로들어감 */
  var message = false;

  switch(command) {
    case 'join' :
          words.shift();
          var room = words.join(' ');
          this.changeRoom(room);
          break;

    case 'nick' :
          words.shift();
          var name = words.join(' ');
          this.socket.emit('nameAttempt', name);
          break;

    case 'w' :
          words.shift(); // 1번째 배열 인덱스 삭제
          var target = words[0]; // 유저이름
          words.shift();
          var sayIt = words.join(' ');
          this.socket.emit('whisper',{
            roomName : roomName,
            sayIt :   sayIt,
            target : target
          });
          break;

    default :
          message = 'Unrecognized command';
          break;

  }
  return message;
}

Chat.prototype.userInput = function(userMessage,roomName) {
  var systemMessage ;

  if (userMessage.charAt(0) == '/') {  // 명령어라면
    systemMessage = this.processCommand(userMessage,roomName)
    if (systemMessage) {
      this.SystemmessageArray.push(systemMessage)  // 프로그램에서내뿜는 메시지는 프로토타입에서 푸쉬하고 유저메시지는 소켓이벤트로 푸쉬한다.(그러나 구지 푸쉬를하지않아도된다)
      return 1;
    }
  } else {  // 명령어가 아니라면
    this.sendMessage(roomName,userMessage); // 프로토타입은 서로간의 메서드를 인자를받지않아도 this로 호출할수있따
    return 0;
  }
}

