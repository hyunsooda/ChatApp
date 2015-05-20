
var http = require('http');
var fs = require('fs');
var socket = require('socket.io');
var mime = require('mime');
var path = require('path');

var i =0;
var server = http.createServer(function(req,res) {
    res.writeHead(200,{'Content-Type': mime.lookup(path.basename('./dd.html'))});
    fs.readFile('./dd.html',function(err,data) {
      res.end(data);
    })

}).listen(80,function() {
    console.log('start');
});

var io = socket.listen(server);
io.on('connection',function(socket) {
  console.log('connection completed');
  console.log(socket.id);

  socket.on('disconnect',function(data) {
    console.log('disconnect completed');
  })
})

/*
var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app);

app.get('/',function(req,res) {
    res.send('Hello/')
    console.log(req.query);
});

app.get('/world.html',function(req,res) {
    res.send('hello world')
})

server.listen(8000,function() {
    console.log('Express server listening on port' + server.address().port );
})
*/
