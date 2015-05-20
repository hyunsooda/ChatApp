function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}


function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp,socket) {
  var message = $('#send-message').val();
  var systemMessage;

  if(message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage)
      $('#messages').appned(divSystemContentElement(systemMessage));
  } else {
    chatApp.sendMessage($('#room').text(), message);
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('#send-message').val('');
}


// ---------------------------------------

var socket = io.connect();

$(document).ready(function() {
  var chatApp = new Chat(socket);

  socket.on('nameResult', function(result) {
    var message;

    if(result.success)
      message = 'You are now known as ' + result.name + '.';
    else
      message = result.message;

    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult',function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  socket.on('message',function(message) {
    var newElem = $('<div></div>').text(message.text);
    $('#messages').append(newElem);
  });

  socket.on('rooms',function(rooms) {
    var tmp=[123]
      ,tmp2
      ,count = 0,
      j;
    $('#room-list').empty();

    for(var i in rooms.currentRoom) {
      if (   tmp[count] != rooms.currentRoom[i]) {
        $('#room-list').append($('<div></div>').text(rooms.currentRoom[i]))
      }

      tmp.push( rooms.currentRoom[i] );

      count++;
    }

    count = 0;

    for (var i in rooms.UserOfcurrentRoom) {
        if (tmp[count+1] == i) {
          for (var j in rooms.UserOfcurrentRoom[i]) {
            $('#room-list').append($('<div></div>').text(j))
          }
        }
    }

    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('#sned-message').focus();
    })
  });

  setInterval(function() {
    socket.emit('rooms');
  },1000);

  $('#send-message').focus();

  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  })

});

