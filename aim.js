const express = require('express')
const app = express()
const serv = require('http').Server(app);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(11031);

console.log("Started!");

const io = require('socket.io')(serv,{});

var users = [];
var initTime;
var pingTime;

io.sockets.on('connection', function (socket){
  console.log("Socket connection");

  socket.on("login", function (data){
    socket.emit("loginCallback", users.length);
    users.push(data.username);
  });

  socket.on("hit", function (data){
    var usrTime = process.hrtime();
    var time = Math.round(((usrTime[0] + usrTime[1]/1000000000)-(initTime[0] + initTime[1]/1000000000))*10000)/10;
    sendScore(data.id, time);
  });

  socket.on("returnPong", function (data){
    var usrTime = process.hrtime();
    var ms = Math.round(((usrTime[0] + usrTime[1]/1000000000)-(initTime[0] + initTime[1]/1000000000))*10000)/10;
    socket.emit("sendPing", {
      ping: ms
    });
  });

});

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendScore(id, time){
  io.sockets.emit("sendScore", {
    username: users[id],
    time: time
  });
}

function sendPos(){
  initTime = process.hrtime();
  io.sockets.emit("sendPos", {
    x: Math.random(),
    y: Math.random()
  });
}

async function startGame(){
  while (true){
    await sleep(Math.random()*3000+1000);
    sendPos();
  }
}

startGame();
