var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');

var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var sql = require(__dirname + '/js/sql.js');

server.listen(8001, function() {
    console.log('ready on port 8001');
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


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
app.get('/leaderboard.html', function(req, res) {
    res.sendFile(__dirname + '/pages/leaderboard.html');
});

app.post('/inputleaderboard', function (req, res) {
    var score = req.body.score;
    var size = req.body.size;
    var isshow = req.body.isshowinput;

    if (!score)
        score = "-1";
    if (!size)
        size = "4";
    if (!isshow)
        isshow = "0";

    fs.readFile(
        './pages/leaderboard.html',
        { encoding: 'utf-8' },
        function(errf, data) {
            if (!errf) {
                //replace special tag
                data = data.replace(/{{{score}}}/gi, score);
                data = data.replace(/{{{size}}}/gi, size);
                data = data.replace(/{{{isshowinput}}}/gi, isshow);

                res.send(data);
                res.end();
            }
        }
    );

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


var group = {
    player1: undefined,
    player2: undefined,
    viewers: [],
    currentmap: undefined
};


io.on('connection', function (socket) {
    
    socket.on('get_leaderboard', function (data) {
        getLeaderboard(socket, data.rowCount, data.mapsize);  
    });

    socket.on('add_leaderboard', function (data) {
        sql.addLeaderListItem(data, function(result) {
            if (result.returnValue === 0) {
                getLeaderboard(socket, data.querycount, data.mapsize);
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


io.sockets.on('connection', function (socket) {

    socket.on('init_battle', function (initmap) {
        if (group.player1 === undefined) {
            group.player1 = socket;
            group.currentmap = initmap;
            socket.emit('init_battle', { player: 1, map: group.currentmap });
        }
        //else if (group.player2 === undefined) {
        //    group.player2 = socket;
        //    socket.emit('init_battle', { player: 2 });
        //}
        else {
            socket.emit('init_battle', { player: 0, map: group.currentmap });
            if (group.viewers.indexOf(socket) === -1)
                group.viewers.push(socket);
        }

    });

    // 將資料送給 玩家與觀戰者
    socket.on('send_battle', function (map) {
        if (socket === group.player1 || socket === group.player2) {
            group.currentmap = map;

            if (socket === group.player1)
                if (group.player2 !== undefined)
                    group.player2.emit('send_battle', group.currentmap);

            //if (socket === player2)
            //    if(player1 !== undefined)
            //        player1.emit('send_battle', data);


            group.viewers.forEach(function (item) {
                item.emit('send_battle', group.currentmap);
            });
        }

    });

    socket.on('leave_battle', function() {
        if (group.player1 === socket)
            group.player1 = undefined;
        else if (group.player2 === socket)
            group.player2 = undefined;
        else {
            if (group.viewers.indexOf(socket) !== -1)
                group.viewers.remove(socket);
        }
    });
});

function getLeaderboard(socket, rowcount, mapsize) {
    sql.getLeaderList(
        {
            mapsize : mapsize,
            sortType: 0,
            startIndex: 1,
            rowCount: rowcount
        },
        function (rtndata) {
            send2Client(socket, 'get_leaderboard',  rtndata);
        }
    );
}


function send2Client(socket, cmd, data) {
    socket.emit(cmd, data);
}