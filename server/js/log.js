

module.exports = {
    consoleLog:function(sockets, message) {
        sockets.forEach(function(socket) {
            socket.emit('send_consoledata', message);
        });
    }
};