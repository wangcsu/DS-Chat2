var socket = io.connect();

var message = document.getElementById('message'),
    handle = document.getElementById('session_username').getAttribute('data-prodnumber'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    current_users = document.getElementById('users'),
    feedback = document.getElementById('feedback');

var room = document.getElementById('room-name');
var room_name = room.textContent || room.innerText;

btn.addEventListener('click', function() {
    socket.emit('chat', {
        message: message.value,
        handle: handle,
        room_name: room_name
    });
    message.value = '';
});

message.addEventListener('keypress', function() {
    socket.emit('typing', {
        handle: handle,
        room_name: room_name
    });
});

socket.on('connect', function(){
    socket.emit('room', {
        room_name: room_name,
        username: handle
    });
});

socket.on('typing', function(data) {
    feedback.innerHTML = '<p><em>' + data.handle + ' is typing a message...</em></p>';
});

socket.on('chat', function(data) {
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('displayUser', function(data) {
    current_users.innerHTML = '';
    for(var i = 0; i < data.current_users.length; i++) {
        current_users.innerHTML += '<li class="list-group-item">' + data.current_users[i].username + '</li>';
    }
});