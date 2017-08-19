var express = require('express');
var router = express.Router();
var ChatRoom = require('../models/chatroom');

router.post('/', function(req, res, next) {
    //console.log(req.session.username);
    var room_name = req.body.chat_room_name;
    var created_by = req.session.username;
    var description = req.body.description;

    var newChatRoom = new ChatRoom({
        room_name: room_name,
        created_by: created_by,
        description: description
    });
    
    ChatRoom.createChatRoom(newChatRoom, function(err, room) {
        if (err) throw err;
        console.log(room);
    });
    res.redirect('/dashboard');
});

router.get('/:id', function(req, res) {
    ChatRoom.findById(req.params.id, function(err, room) {
        res.render('chat', {
            username: req.session.username,
            room: room
        });
    });
});

module.exports = router;