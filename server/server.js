var express = require('express');
var app = express();

var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var sql = require(__dirname + '/js/sql.js');

server.listen(8001, function() {
    console.log('ready on port 8001');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index2.html');
});

app.get('/index2.html', function (req, res) {
    res.sendFile(__dirname + '/index2.html');
});

app.get('/game2048.html', function (req, res) {
    res.sendFile(__dirname + '/game2048.html');
});

app.get('/queryLeaderboard.html', function (req, res) {
    res.sendFile(__dirname + '/queryLeaderboard.html');
});


app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));
app.use('/intro', express.static('intro'));
app.use('/js', express.static('js'));
app.use('/js_lib', express.static('js_lib'));



io.on('connection', function (socket) {
    socket.on('user_login', function (data) {
        var rowcount = data.rowCount;
        GetLeaderboard(socket, rowcount);

    });

    socket.on('chat_message', function (data) {
        var now = new Date();
        var nowStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        console.log(nowStr + ' ' + socket.username + ' ' + data.msg);

        io.emit('chat_message', {
            'time': nowStr,
            'user': socket.username,
            'msg': data.msg
        });
    });

    socket.on('add_leaderboard', function (data) {
        sql.addLeaderListItem(data, function(result) {
            if (result.returnValue === 0) {
                GetLeaderboard(socket);
            }
        });
       
    });

});

function GetLeaderboard(socket, rowcount) {
    sql.getLeaderList(
        {
            sortType: 0,
            startIndex: 1,
            rowCount: rowcount
        },
        function (rtndata) {
            SendLeaderboard2Client(socket, rtndata);
        }
    );
}

function SendLeaderboard2Client(socket, data) {
    socket.emit('sendLeaderboard', data);
}