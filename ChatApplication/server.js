var http = require('http'),
  fs = require('fs'),
  path = require('path'),
  mime = require('mime'),
  cache = {},
  server = http.createServer(function(req,res) {
    var filepath = '';
    if(req.url == '/') {
      filepath = 'index.html'
    }
    else
      filepath =   req.url;

    var abspath = './' + filepath;
    serveStatic(res,cache,abspath);
  });

server.listen(3000,function() {
  console.log('Server listening on port 3000');
})

function send404(res) {
  res.writeHead(404, {'Content-Type' : 'text/plain'});
  res.write('Error 404 : resource not found.');
  res.end();
}

function sendFile(res,filepath,fileContents) {
  res.writeHead(200 , {'content-type' : mime.lookup(path.basename(filepath))}); // ===  content-type : application
  res.end(fileContents);  // html파일을 그려준다
}

function serveStatic(res,cache,abspath) {
  if(cache[abspath])
    sendFile(res,abspath,cache[abspath]);
  else {
    fs.exists(abspath,function(exists) {  // 파일이 있는지없는지 확인
      if (exists) {
        fs.readFile(abspath,function(err,data) {
          if(err)
            send404(res);
          else {
            cache[abspath] = data;
            sendFile(res,abspath,data);
          }
        });
      } else
          send404(res);
    })
  }
}

var chatServer =  require('./app/lib/chat_server');
chatServer.listen(server);
