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
    res.sendFile(__dirname + '/pages/index2.html');
});

app.get('/index.html', function (req, res) {
    res.sendFile(__dirname + '/pages/index.html');
});

app.get('/index2.html', function (req, res) {
    res.sendFile(__dirname + '/pages/index2.html');
});

app.get('/game2048.html', function (req, res) {
    res.sendFile(__dirname + '/pages/game2048.html');
});

app.get('/queryLeaderboard.html', function (req, res) {
    res.sendFile(__dirname + '/pages/queryLeaderboard.html');
});

app.get('/screenshot.html', function (req, res) {
    res.sendFile(__dirname + '/pages/screenshot.html');
});

app.use('/pages', express.static('pages'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));
app.use('/intro', express.static('intro'));
app.use('/js', express.static('js'));
app.use('/js_lib', express.static('js_lib'));



io.on('connection', function (socket) {
    socket.on('user_login', function (data) {
        GetLeaderboard(socket, data.rowCount, data.mapsize);  // use default mapsize
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
                GetLeaderboard(socket, data.querycount, data.mapsize);
            }
        });
    });

    socket.on('add_screenshot', function(data) {
        sql.addScreenshotItem({
            datatype: data.datatype,
            data: data.data
        }, function (result) {
            socket.emit('add_screenshot', {
                result: result
            });
        });
    });

    socket.on('get_screenshotdata', function (data) {
        if (data.id.length > 0) {
            var ssid = parseInt(data.id[0]);
            sql.getScreenshotData({
                ssid: ssid
            }, function (result) {
                if (result !== undefined) {
                    socket.emit('get_screenshotdata', result);    
                }
            });
        }
    });
});

function GetLeaderboard(socket, rowcount, mapsize) {
    sql.getLeaderList(
        {
            mapsize : mapsize,
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