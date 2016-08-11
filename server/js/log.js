/*
 * enum:  log level 
 *       0 = debug
 *       1 = message
 *       2 = error
 */


var consoleUsers = [];

module.exports = {
    addConsoleUser: function (loglevel, socket) {
        var user = findUserBySocket(socket);
        if (user === undefined || user === null)
            consoleUsers.push(
            {
                loglevel: loglevel,
                socket: socket
            });
        else {
            user.loglevel = loglevel;
        }
    },

    removeConsoleUser: function (socket) {
        var user = findUserBySocket(socket);
        if (user === undefined || user === null) {
            return false;
        }

        var consoleIndex = consoleUsers.indexOf(user);
        if (consoleIndex === -1)
            return false;

        consoleUsers.splice(consoleIndex, 1); //remove console list  
        return true;
    },

    getConsoleUserCount: function() {
        return consoleUsers.length;
    },

    resetConsoleUser: function () {
        consoleUsers.length = 0;
    },

    consoleLog: function (loglevel, cmd, msg) {
        console.log('' + loglevel + ' ' + cmd + ' ' + msg);

        consoleUsers.forEach(function (user) {
            if (loglevel >= user.loglevel) {
                user.socket.emit('send_consoledata', {
                    lvl: loglevel,
                    cmd: cmd,
                    msg: msg,
                    time: new Date()
                });
            }
        });
    }
};


function findUserBySocket(socket) {
    for (var i = 0; i < consoleUsers.length; i++) {
        var user = consoleUsers[i];
        if (user.socket === socket)
            return user;
    }

    return undefined;
}
