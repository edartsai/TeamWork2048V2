var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);


var sql = require(__dirname + '/js/sql.js');
var clog = require(__dirname + '/js/log.js');


server.listen(9001, function() {
    clog.consoleLog(1, 'listen', 'ready on port 9001');
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

app.get('/index3.html', function (req, res) {
    res.sendFile(__dirname + '/pages/index3.html');
});

app.get('/game2048single', function (req, res) {
    var isBattleMode = "0";
    fs.readFile(
        './pages/game2048single.html',
        { encoding: 'utf-8' },
        function (errf, data) {
            if (!errf) {
                //replace special tag
                data = data.replace(/{{{isbattlemode}}}/gi, isBattleMode);

                res.send(data);
                res.end();
            }
        }
    );
});

app.get('/game2048battle', function(req, res) {
    var isBattleMode = "1";
    fs.readFile(
        './pages/game2048.html',
        { encoding: 'utf-8' },
        function (errf, data) {
            if (!errf) {
                //replace special tag
                data = data.replace(/{{{isbattlemode}}}/gi, isBattleMode);
                
                res.send(data);
                res.end();
            }
        }
    );
});

app.get('/inputleaderboard', function (req, res) {
    var score = "-1";
    var size = "4";
    var isshow = "0";

    fs.readFile(
        './pages/leaderboard.html',
        { encoding: 'utf-8' },
        function (errf, data) {
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

app.get('/console', function (req, res) {
    res.sendFile(__dirname + '/pages/console.html');
});

app.use('/pages', express.static('pages'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));
app.use('/intro', express.static('intro'));
app.use('/js', express.static('js'));
app.use('/js_lib', express.static('js_lib'));


var rooms = [];
var countdown1Interval = 5;     //in sec
var countdown2Interval = 30;   //in sec

io.on('connection', function (socket) {
    socket.on('get_leaderboard', function (data) {
        getLeaderboard(socket, data.rowCount, data.mapsize);
    });

    socket.on('add_leaderboard', function (data) {
        sql.addLeaderListItem(data, function (result) {
            if (result.returnValue === 0) {
                getLeaderboard(socket, data.querycount, data.mapsize);
                send2Client(socket, 'add_leaderboard', undefined);
            }
        });
    });

    socket.on('add_screenshot', function (data) {
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

    // 玩家尋找房間及安排角色
    socket.on('init_room', function () {
        var room = findEmptyRoom();
        if (room === undefined || room === null)
            return;

        if (room.player1 === undefined) {
            room.player1 = socket;
            socket.emit('init_room', { id: room.id, player: 1 });
            clog.consoleLog(0, 'init_room', 'room:' + room.id + ' p1:' + room.player1.id);

            if (room.player2 !== undefined) {
                room.player2.emit('init_room_opposite');
            }
            
        }
        else if (room.player2 === undefined) {
            room.player2 = socket;
            socket.emit('init_room', { id: room.id, player: 2 });
            clog.consoleLog(0, 'init_room', 'room:' + room.id + ' p2:' + room.player2.id);

            if (room.player1 !== undefined) {
                room.player1.emit('init_room_opposite');
            }
        }

        if (room.player1 !== undefined && room.player2 !== undefined ) {
            sendPlayersEvent(room, 'init_room_full', undefined);
            clog.consoleLog(1, 'init_room_full', 'room:' + room.id );
        }
    });

    // 玩家初始化遊戲
    socket.on('init_game', function (data) {
        var room = findRoom(data.id);
        if (room === undefined || room === null)
            return;

        if (room.player1 === socket) {
            room.gamestatus.p1agreenext = true;
            clog.consoleLog(0, 'init_game', 'room:' + room.id + ' p1:' + room.player1.id);
        }
        else if (room.player2 === socket) {
            room.gamestatus.p2agreenext = true;
            clog.consoleLog(0, 'init_game', 'room:' + room.id + ' p2:' + room.player2.id);
        }

        if (room.gamestatus.p1agreenext && room.gamestatus.p2agreenext) {
            initGameStatus(room);

            sendPlayersEvent(room, 'init_ready', undefined);
            clog.consoleLog(1, 'init_ready', 'room:' + room.id );
        }
    });

    // [ready]完成
    socket.on('send_ready', function (data) {
        var room = findRoom(data.id);
        if (room === undefined || room === null)
            return;

        if (socket === room.player1) {
            room.gamestatus.p1ready = true;
            room.gamestatus.p1map = data.map;
            clog.consoleLog(0, 'send_ready', 'room:' + room.id + ' p1:' + room.player1.id);

            if (room.player2 !== undefined) {
                room.player2.emit('send_ready_opposite', data.map);
            }
        } else if (socket === room.player2) {
            room.gamestatus.p2ready = true;
            room.gamestatus.p2map = data.map;
            clog.consoleLog(0, 'send_ready', 'room:' + room.id + ' p2:' + room.player2.id);

            if (room.player1 !== undefined) {
                room.player1.emit('send_ready_opposite', data.map);
            }
        }
    });

    // 收到遊戲資料 將資料送給 對方玩家
    socket.on('send_map', function (data) {
        var room = findRoom(data.id);
        if (room === undefined || room === null)
            return;

        if (socket === room.player1) {
            room.gamestatus.p1map = data.map;
            clog.consoleLog(0, 'send_map', 'room:' + room.id + ' p1:' + room.player1.id);
		    if (room.player2 !== undefined) {
                room.player2.emit('send_map_opposite', data.map);
		    }
	    }

        if (socket === room.player2) {
            room.gamestatus.p2map = data.map;
            clog.consoleLog(0, 'send_map', 'room:' + room.id + ' p2:' + room.player2.id);
            if (room.player1 !== undefined) {
                room.player1.emit('send_map_opposite', data.map);
            }
        }
    });

    // 每秒檢查所有 rooms 的遊戲狀態，並發出倒數事件
    setInterval(function () {
        rooms.forEach(function (room) {
            if (room.gamestatus.p1ready && room.gamestatus.p2ready) {
                var nDate = new Date();
                var interval1, interval2;

                if (!room.gamestatus.starting) {  //遊戲未開始
                    room.gamestatus.starttime = nDate;
                    room.gamestatus.countdown1 = new Date(room.gamestatus.starttime.getTime() + countdown1Interval * 1000);
                    room.gamestatus.countdown2 = new Date(room.gamestatus.starttime.getTime() + (countdown1Interval + countdown2Interval) * 1000);
                    room.gamestatus.starting = true;

                    interval1 = room.gamestatus.countdown1.getTime() - nDate.getTime();
                    sendPlayersEvent(room, 'send_countdown1', Math.ceil(interval1 / 1000));
                    clog.consoleLog(1, 'send_countdown1', 'room:' + room.id + ' game started');
                }
                else { //遊戲已開始
                    interval1 = room.gamestatus.countdown1.getTime() - nDate.getTime(); //in msecond
                    interval2 = room.gamestatus.countdown2.getTime() - nDate.getTime(); //in msecond

                    if (interval1 >= 0) { //倒數準備開始
                        sendPlayersEvent(room, 'send_countdown1', Math.ceil(interval1 / 1000));
                        if (interval1 >= 0 && interval1 < 1000 ) { // game start!! 
                            sendPlayersEvent(room, 'send_countdown1_over');
                        }
                    }
                    else if (interval1 < 0 && interval2 >= 0) { //遊戲中
                        sendPlayersEvent(room, 'send_countdown2', Math.ceil(interval2 / 1000));
                    } else { //countdown2 <= 0  // 遊戲時間到
                        room.gamestatus.p1ready = false;
                        room.gamestatus.p2ready = false;
                        room.gamestatus.starting = false;
                        sendPlayersEvent(room, 'send_countdown2', 0);
                        sendPlayersEvent(room, 'send_countdown2_over');
                        clog.consoleLog(1 ,'send_countdown2_over', 'room:' + room.id );

                        var winnerData = getWinner(room);
                        sendPlayersEvent(room, 'send_winner', winnerData);
                        if (winnerData === undefined || winnerData === null)
                            clog.consoleLog(1, 'send_winner', 'room:' + room.id + ' winner: error');
                        else
                            clog.consoleLog(1, 'send_winner', 'room:' + room.id + ' winner:' + winnerData.winner + ' score:' + winnerData.map[0].Score);
                    }
                }
            }
        });
    }, 1000);


    // add console user
    socket.on('add_consoleuser', function (loglevel) {
        clog.addConsoleUser(loglevel, socket);
        clog.consoleLog(1, 'add_consoleuser', 'id:' + socket.id + ' users:' + clog.getConsoleUserCount() );
    });

    // 將離線的玩家移除 or remove console user
    socket.on('disconnect', function () {
        if (clog.removeConsoleUser(socket)) {
            clog.consoleLog(1, 'leave consoleuser', 'id:' + socket.id + ' users:' + clog.getConsoleUserCount());
            return;
        }

        var room = findRoomByUserSocket(socket);

        if (room === undefined || room === null) {
            return;
        }

        if (room.player1 === socket) {
            room.player1 = undefined;
            clog.consoleLog(1, 'disconnect', 'room:' + room.id + ' p1:' + socket.id);

            if (room.player2 !== undefined) {
                room.player2.emit('disconnect_opposite');
            }
        }
        if (room.player2 === socket) {
            room.player2 = undefined;
            clog.consoleLog(1, 'disconnect', 'room:' + room.id + ' p2:' + socket.id);

            if (room.player1 !== undefined) {
                room.player1.emit('disconnect_opposite');
            }
        }

    });
});

function getLeaderboard(socket, rowcount, mapsize) {
    sql.getLeaderList(
        {
            mapsize: mapsize,
            sortType: 0,
            startIndex: 1,
            rowCount: rowcount
        },
        function (rtndata) {
            send2Client(socket, 'get_leaderboard', rtndata);
        }
    );
}

function send2Client(socket, cmd, data) {
    if (data !== undefined)
        socket.emit(cmd, data);
    else
        socket.emit(cmd);
}

function genRoom() {
    var room = {
        id: -1,
        player1: undefined,
        player2: undefined,
        gamestatus: genGameStatus()
    };

    return room;
}

function genGameStatus() {
    return {
        starting: false,
        p1ready: false,
        p1map: undefined,
        p1agreenext: false,
        p2ready: false,
        p2map: undefined,
        p2agreenext: false,
        starttime: undefined,
        countdown1: undefined,
        countdown2: undefined
    };
}

function findEmptyRoom() {
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        if (!room.gamestatus.starting) {
            if (room.player1 === undefined) {
                return room;
            } else if (room.player2 === undefined) {
                return room;
            }
        }
    }

    var nroom = genRoom();
    rooms.push(nroom);
    nroom.id = rooms.indexOf(nroom);

    return nroom;
}

function findRoom(id) {
    return rooms[id];
}

function initGameStatus(room) {
    room.gamestatus = genGameStatus();
}

function findRoomByUserSocket(socket) {
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        if (room.player1 === socket || room.player2 === socket) {
            return room;
        }
    }

    return undefined;

}

function addMinutes(date, plusMins) {
    date.setMinutes(date.getMinutes() + plusMins);
    return date;
}

function sendPlayersEvent(room, eventName, data) {
    if (data === undefined) {
        if (room.player1 !== undefined)
            room.player1.emit(eventName);
        if (room.player2 !== undefined)
            room.player2.emit(eventName);
    } else {
        if (room.player1 !== undefined)
            room.player1.emit(eventName, data);
        if (room.player2 !== undefined)
            room.player2.emit(eventName, data);
    }
}

function getWinner(room) {
    if (room === undefined || room === null ||
        room.gamestatus === undefined || room.gamestatus === null ||
        room.gamestatus.p1map === undefined || room.gamestatus.p1map === null ||
        room.gamestatus.p2map === undefined || room.gamestatus.p2map === null ||
        room.gamestatus.p1map.Score === undefined || room.gamestatus.p1map.Score === null ||
        room.gamestatus.p2map.Score === undefined || room.gamestatus.p2map.Score === null ) {
        return undefined;
    }

    if (room.gamestatus.p1map.Score > room.gamestatus.p2map.Score) {
        return { winner: 1, map: [room.gamestatus.p1map] };  //p1 win
    }
    if (room.gamestatus.p1map.Score < room.gamestatus.p2map.Score) {
        return { winner: 2, map: [room.gamestatus.p2map] };  //p2 win
    }
    if (room.gamestatus.p1map.Score === room.gamestatus.p2map.Score) {
        return { winner: 0, map: [room.gamestatus.p1map, room.gamestatus.p2map] };  //tie
    }

}