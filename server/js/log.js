var consoleSockets = [];

module.exports = {
    addConsoleUser: function(socket) {
        if (consoleSockets.indexOf(socket) === -1)
            consoleSockets.push(socket);
    },

    removeConsoleUser: function(socket) {
        var consoleIndex = consoleSockets.indexOf(socket);
        if (consoleIndex === -1)
            return false;

        consoleSockets.splice(consoleIndex, 1); //remove console list  
        return true;
    },

    getConsoleUserCount: function() {
        return consoleSockets.length;
    },

    resetConsoleUser: function () {
        consoleSockets.length = 0;
    },

    consoleLog: function (message) {
        console.log(message);

        consoleSockets.forEach(function(socket) {
            socket.emit('send_consoledata', message);
        });
    }
};



