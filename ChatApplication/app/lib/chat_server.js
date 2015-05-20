var socketio = require('socket.io'),// 1.3.5v --> require('socket.io')()
  io,
  guestNumber = 1,
  nickNames = {},
  namesUsed = [],  // 이떄까지 사용한 닉네임
  currentRoom = {},   // 만들어진 방 목록이 담길 객체
  count = 0;

/// 서버가 켜져있는 동안 위의 변수들은 사라지지않는다.

exports.listen = function(server) {
  io = socketio.listen(server); // socketio의 listen함수의 반환값은 전체소켓을관리하는 객체이다.

  io.sockets.on('connection',function(socket) { // 클라이언트에서 서버에접속하면 connection이벤트가발생하고 , 콜백함수의 socket인자는 연결된 클라이언트(1개)와 통신하는 서버를말한다.
    console.log('클라이언트에서 커넥트햇다');

      guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
      joinRoom(socket, 'Thinkhack');

      handleMessageBroadcasting(socket, nickNames);
      handleNameChangeAttempts(socket, nickNames, namesUsed);
      handleRoomJoining(socket);

      socket.on('rooms', function () {
        //  console.log(io.sockets.adapter.rooms)
        socket.emit('rooms', {
          Entire: io.sockets.adapter.rooms, // io.sockets.adapter.rooms 는 전체Room을 관리하며 생성된Room과 생성된socket.id값이 다 들어있다  // 0.9v --> io.sockets.manager.rooms  1.3.5v --> io.sockets.adapter.rooms
          currentRoom: currentRoom,
          nickNames: nickNames
        });
      });
      whisper(socket,io);
      handleClientDisconnection(socket, nickNames, namesUsed);
  });
};


function assignGuestName(socket,guestNumber,nickNames,nameUsed) {
  var name = 'Guest' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult',{
    success : true,
    name : name
  });
  nameUsed.push(name);
  return guestNumber+1;
}

function joinRoom(socket,room) {
  var namespace ='/';

  socket.join(room);
  currentRoom[socket.id] = room;

  socket.emit('joinResult',{room : room});

  socket.broadcast.to(room).emit('message',{
    text : nickNames[socket.id] + 'has joined ' + room + '.'
  });
}

function handleNameChangeAttempts(socket,nickNames,nameUsed) {
  socket.on('nameAttempt', function(name) {

    if (name.indexOf('Guest') == 0 ) {
      socket.emit('nameResult', {
        success : false,
        message : 'Names cannot begin whit "Guest". '
      });
    } else {
      if (nameUsed.indexOf(name) == -1) {
        var prevName = nickNames[socket.id];
        var prevNameIndex = namesUsed.indexOf(prevName);
        nameUsed.push(name);   // 새로운닉네임을 추가
        nickNames[socket.id] = name; // 새로운닉네임으로 덮어씀
        delete namesUsed[prevNameIndex]; // 전에 쓰던 닉네임을삭제

        socket.emit('nameResult', {
          success : true,
          name : name
        });

        socket.broadcast.to(currentRoom[socket.id]).emit('message',{
          text : prevName + '(이)가 ' + name + ' 로 바뀌엇습니다.'
        });
      } else {
        socket.emit('nameResult', {
          success : false,
          message : 'That name is already in use.'
        });
      }
    }
  });
}

function handleMessageBroadcasting(socket) {
  socket.on('message',function(message) {
    console.log('클라이언트로 message 이벤트발생시킴('+ message.text +')' )
    socket.broadcast.to(message.room).emit('message',{
      text : nickNames[socket.id] + ' : ' + message.text
    });
  });
}

function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);

    socket.broadcast.to(currentRoom[socket.id]).emit('Cdisconnect', {
      text : nickNames[socket.id] + '님이 나가셧습니다 '
    });
    joinRoom(socket,room.newRoom)
  })
}

function handleClientDisconnection(socket,nickNames,namesUsed) {
  socket.on('disconnect',function() {
    socket.broadcast.to(currentRoom[socket.id]).emit('Cdisconnect', {
      text : nickNames[socket.id] + '님이 나가셧습니다 '
    });

    var nameIndex = namesUsed.indexOf(nickNames[socket.id])
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
    console.log('discunnect이벤트발생')

  });
}

function whisper(socket,io) {
  socket.on('whisper', function (result) {
    var temp = 0;
    var idconfirm = false;
    for(var id in nickNames) {
      if ( nickNames[id] == result.target)
        idconfirm = true;
    }
    if (!idconfirm) {
      socket.emit('whisperError','잘못된 명령어입니다.');
      return;  // ID가 존재하지않으면 여기서 콜백함수를 종료한다. 즉 밑의내용을 실행하지않는다.
    }

    for(var i in io.sockets.adapter.rooms[result.roomName]) {
      if(nickNames[i] == result.target )
        if ( currentRoom[i] == result.roomName) {
          io.to(i).emit('whisperToClient',{  // 0.9v --> io.sockets(socket.id).emit('이벤트명',function(data){ });
            text : '귓속말('+nickNames[socket.id] +') : ' + result.sayIt
          });
          temp = 1;
        }
    }
    if ( temp = 0)
      socket.emit('whisperError','잘못된 명령어입니다.');
  });
}

/* 자바스크립트는 페이지가 로드될떄 함수목록부터 쫙 뽑아서 읽기때문에 함수를먼저호출하고 뒤에서 정의해도 상관없다 */

