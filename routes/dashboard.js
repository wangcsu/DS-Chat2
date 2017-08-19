var express = require('express');
var router = express.Router();
var ChatRoom = require('../models/chatroom');

router.get('/', function(req, res, next) {
    ChatRoom.find({}, function(err, chatrooms) {
        if (err) {
            console.log(err);
        } else {
            res.render('dashboard', {
                rooms: chatrooms
            });
        }
    });
});

router.post('/', function(req, res, next) {
    ChatRoom.find({}, function(err, chatrooms) {
        if (err) {
            console.log(err);
        } else {
            req.session.username = req.body.username;
            res.render('dashboard', {
                rooms: chatrooms
            });
        }
    });
});

router.get('/create', function(req, res, next) {
    res.render('create');
});

module.exports = router;