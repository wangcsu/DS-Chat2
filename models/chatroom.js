var mongoose = require('mongoose');

var ChatRoomSchema = mongoose.Schema({
    room_name: {
        type: String
    },
    created_by: {
        type: String
    },
    users: [{
        username: String
    }],
    description: String,
    history: [{username: String, message: String}]
});

var ChatRoom = module.exports = mongoose.model('ChatRoom', ChatRoomSchema);

module.exports.createChatRoom = function(newChatRoom, callback) {
    newChatRoom.save(callback);
}
