var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var socket = require('socket.io');
var ChatRoom = require('./models/chatroom');

mongoose.connect('mongodb://localhost/dschat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to mongodb...');
});

var app = express();

var index = require('./routes/index');
var chat = require('./routes/chat');
var dashboard = require('./routes/dashboard');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret: "secret"}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
app.use('/', index);
app.use('/chat', chat);
app.use('/dashboard', dashboard);

// Start server
app.set('port', (process.env.PORT || 3000));

var server = app.listen(app.get('port'), function() {
    console.log('Server started on port '+app.get('port'));
});

var io = socket(server);
var chatroom;
io.on('connection', function(socket) {
    socket.on('room', function(data) {
        socket.username = data.username;
        socket.roomname = data.room_name;
        socket.join(data.room_name);
        var user = {username: data.username};
        console.log(user.username + ' joined chatroom ' + data.room_name);
        ChatRoom.update(
            {room_name: data.room_name},
            {$push: {users: user}},
            function(err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    ChatRoom.findOne({room_name: socket.roomname}, function(err, chatroom) {
                        io.sockets.in(socket.roomname).emit('displayUser', {
                            current_users: chatroom.users
                        });
                    });
                }
            }
        );
    });

    socket.on('typing', function(data) {
        socket.broadcast.in(data.room_name).emit('typing', data);
    });

    socket.on('chat', function(data) {
        var message = {
            username: socket.username,
            message: data.message
        };
        ChatRoom.update(
            {room_name: socket.roomname},
            {$push: {history:message}},
            function(err) {
                if(err) {
                    console.log(err);
                    return;
                }
            }
        );
        io.sockets.in(data.room_name).emit('chat', data);
    });

    socket.on('disconnect', function(data) {
        ChatRoom.update(
            {room_name: socket.roomname},
            {$pull: {users: {username: socket.username}}},
            function(err) {
                if(err) {
                    console.log(err);
                    return;
                } else {
                    ChatRoom.findOne({room_name: socket.roomname}, function(err, chatroom) {
                        socket.broadcast.in(socket.roomname).emit('displayUser', {
                            current_users: chatroom.users
                        });
                    });
                }
            }
        );
        
        console.log(socket.username + ' disconnected from' + socket.roomname);
    });
});