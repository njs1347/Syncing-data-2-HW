var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');

var port = process.env.PORT || process.env.NODE_PORT || 3000;

//read the client html file into memory
//__dirname in node is the current directory
//in this case the same folder as the server js file
var index = fs.readFileSync(__dirname + '/../client/client.html');
		
function onRequest(request, response) {

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(index);
	response.end();
}

var app = http.createServer(onRequest).listen(port);

console.log("Listening on 127.0.0.1:" + port);

//pass in the http server into socketio and grab the websocket server as io
var io = socketio(app);

//object to hold all of our connected users
var users ={};

function onJoin(socket){
	socket.on('join', function(data){
		users[data.username] = data.username;
		
		var Msg = {
			Msg: "You Have Joined The Server"
		};
		
		socket.emit('joined', Msg);
		socket.username = data.username;
	});
}

function onDraw(socket) {
	socket.on('draw', function(data){
		var drawPara = {};
		
		var timeStamp = new Date().getTime();
		
		//Construct draw call object
		drawPara.x = data.x;
		drawPara.y = data.y;
		drawPara.user = socket.user;
		drawPara.time = timeStamp;
		
		io.sockets.in('room1').emit('drawline',drawPara);
	});
}

function onDisconnect(socket){
	socket.on('disconnect', function(data){
		console.log("User Disconnected");
	});
}

io.sockets.on('connection', function(socket){
	console.log("New Connection");
	onDraw(socket);
	onDisconnect(socket);
	onJoin(socket);
	
	socket.join('room1');
});