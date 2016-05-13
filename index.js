var express = require('express'),
app = express(),
http = require('http').Server(app),
path = require('path'),
io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use(express.static(path.join(__dirname, '/')));

io.on('connection', function(socket){
  console.log('a user connected');
  // socket.broadcast.emit('MarkerDrop');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('MarkerDrop', function(latlng){
    // io.emit('MarkerDrop', latlng);
    socket.broadcast.emit('MarkerDrop',latlng);
    console.log('Someone dropped a marker at: ' + latlng[0] + " " + latlng[1]);
  })
});
