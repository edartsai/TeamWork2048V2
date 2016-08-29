var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);


var sql = require(__dirname + '/js/sql.js');
var clog = require(__dirname + '/js/log.js');


server.listen(8787, function() {
    clog.consoleLog(1, 'listen', 'ready on port 8787');
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/pages/index3.html');
});

app.get('/console', function (req, res) {
    res.sendFile(__dirname + '/pages/console.html');
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
    res.sendFile(__dirname + '/pages/game2048single.html');
});

app.get('/game2048battle', function(req, res) {
    res.sendFile(__dirname + '/pages/game2048.html');
});

app.get('/game2048viewer', function(req, res) {
    res.sendFile(__dirname + '/pages/game2048viewer.html');
});

app.get('/leaderboard', function(req, res) {
    res.sendFile(__dirname + '/pages/leaderboard2.html');
});

app.post('/getleaderboarddata', function(req, res) {
    var rowcount = req.body.rowcount;
    var mapsize = req.body.mapsize;

    getLeaderboard(res, rowcount, mapsize);
});

app.post('/addleaderboarddata', function (req, res) {
    var data = {
        score: parseInt(req.body.score),
        mapsize: parseInt(req.body.size),
        name: req.body.name,
        movetimes: 0,
        ip: ''
    };
    
    sql.addLeaderListItem(data, function (result) {
        res.json({ result: result });
    });
});

app.post('/getscreenshot', function(req, res) {
    var ssid = parseInt(req.body.ssid);

    sql.getScreenshotByssid({
        ssid: ssid
    }, function(result) {
        res.json({ result : result });
    });

});

app.post('/addscreenshot', function(req, res) {
    var lbid = parseInt(req.body.lbid);
    var datatype = parseInt(req.body.datatype);
    var data = req.body.data;

    sql.addScreenshot({
        lbid: lbid,
        datatype: datatype,
        data: data
    }, function (result) {
        res.json({ result : result });
    });
});

app.post('/getfunctionstreedata', function (req, res) {
    res.sendFile(__dirname + '/intro/functionstree.json');
});

app.use('/pages', express.static('pages'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));
app.use('/intro', express.static('intro'));
app.use('/js', express.static('js'));
app.use('/js_lib', express.static('js_lib'));
app.use('/js_out', express.static('js_out'));
app.use('/typings', express.static('typings'));


// room 架構
// var room = {
//      id:int,                         //房間id (key)
//      player1:socket                  //player1 socket data
//      {
//          socket.nickname:string      //player1 nickname    
//      },      
//      player2:socket                  //player2 socket data
//      {
//          socket.nickname:string      //player2 nickname    
//      },     
//      viewers:array[socket],          //觀戰者 socket data
//      gamestatus:自訂物件              //game status                
//      {
//          starting:boolean,           //此房是否正在遊戲中
//          p1ready:boolean,            //player1 是否已按下 ready
//          p1map:自訂物件               //player1 遊戲內容狀態、分數   
//          { 
//              Size:int,               //遊戲 n*n size
//              Items:array[自訂物件]    //畫面上有數字的區塊狀態  
//              {
//                  Id:int,             //此區塊物件id
//                  X:int,              //現在位置之x座標
//                  Y:int,              //現在位置之y座標
//                  Value:int,          //區塊的數值(合併後會增加)
//                  PreId:int,          //此區塊當下步驟若有合併其他區塊，則PreId=被合併(消失)之區塊id
//                  ToDel:boolean       //若為被合併(需消失)之區塊，會被標註為true，執行完計算後移除此欄為 true 之 item
//              }, 
//              IdMax:int,              //區塊排序key值
//              Score:int,              //分數
//              IsGameOver:boolean      //是否已無可動
//          },
//          p1agreenext:boolean,        //player1 是否已同意下一場
//          p2ready:boolean,            //player2 是否已按下 ready
//          p2map:自訂物件(同p1map){  }, //player2 遊戲內容狀態、分數       
//          p2agreenext:boolean,        //player2 是否已同意下一場
//          starttime:date              //紀錄p1 & p2 均按下 ready 之時間
//          countdown1:date             //紀錄遊戲開始前倒數的 deadline
//          countdown2:date             //紀錄遊戲結束的 deadline
//      }
//};


var rooms = [];
var countdown1Interval = 5;     //in sec
var countdown2Interval = 60;    //in sec

io.sockets.on('connection', function (socket) {

    // 玩家尋找房間及安排角色
    socket.on('init_room', function () {
        var room = findEmptyRoom();
        if (room === undefined || room === null)
            return;

        if (room.player1 === undefined) {
            room.player1 = socket;
            socket.emit('init_room', { id: room.id, player: 1 , time: new Date()});
            clog.consoleLog(0, 'init_room', 'room:' + room.id + ' p1:' + room.player1.id);

            if (room.player2 !== undefined) {
                room.player2.emit('init_room_opposite', { time: new Date() });
            }

            if (room.viewers !== undefined) {
                room.viewers.forEach(function(viewer) {
                    viewer.emit('init_room_opposite', { player: 1 , time: new Date()});
                });
            }
        }
        else if (room.player2 === undefined) {
            room.player2 = socket;
            socket.emit('init_room', { id: room.id, player: 2 , time: new Date()});
            clog.consoleLog(0, 'init_room', 'room:' + room.id + ' p2:' + room.player2.id);

            if (room.player1 !== undefined) {
                room.player1.emit('init_room_opposite', { time: new Date()});
            }

            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('init_room_opposite', { player: 2 ,time: new Date()});
                });
            }
        }

        if (room.player1 !== undefined && room.player2 !== undefined ) {
            sendPlayersEvent(room, 'init_room_full', { time: new Date() });
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

            sendPlayersEvent(room, 'init_ready', { time: new Date() });
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
                room.player2.emit('send_ready_opposite', { map: data.map, time: new Date() });
            }
            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('send_ready_opposite', { player: 1 , map: data.map , time: new Date()});
                });
            }
        } else if (socket === room.player2) {
            room.gamestatus.p2ready = true;
            room.gamestatus.p2map = data.map;
            clog.consoleLog(0, 'send_ready', 'room:' + room.id + ' p2:' + room.player2.id);

            if (room.player1 !== undefined) {
                room.player1.emit('send_ready_opposite', { map: data.map , time: new Date()});
            }

            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('send_ready_opposite', { player: 2, map: data.map, time: new Date() });
                });
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
                room.player2.emit('send_map', { map: data.map , time: new Date()});
            }

            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('send_map', { player: 1, map: data.map, time: new Date() });
                });
            }
	    }

        if (socket === room.player2) {
            room.gamestatus.p2map = data.map;
            clog.consoleLog(0, 'send_map', 'room:' + room.id + ' p2:' + room.player2.id);
            if (room.player1 !== undefined) {
                room.player1.emit('send_map', { map: data.map, time: new Date() });
            }

            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('send_map', { player: 2, map: data.map, time: new Date() });
                });
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
                    sendPlayersEvent(room, 'send_countdown1', { secs: Math.ceil(interval1 / 1000), time: new Date() });
                    clog.consoleLog(1, 'send_countdown1', 'room:' + room.id + ' game started');
                }
                else { //遊戲已開始
                    interval1 = room.gamestatus.countdown1.getTime() - nDate.getTime(); //in msecond
                    interval2 = room.gamestatus.countdown2.getTime() - nDate.getTime(); //in msecond

                    if (interval1 >= 0) { //倒數準備開始
                        sendPlayersEvent(room, 'send_countdown1', { secs: Math.ceil(interval1 / 1000), time: new Date() });
                        if (interval1 >= 0 && interval1 < 1000 ) { // game start!! 
                            sendPlayersEvent(room, 'send_countdown1_over', { time: new Date() });
                        }
                    }
                    else if (interval1 < 0 && interval2 >= 0) { //遊戲中
                        sendPlayersEvent(room, 'send_countdown2', { secs: Math.ceil(interval2 / 1000), time: new Date() });
                    } else { //countdown2 <= 0  // 遊戲時間到
                        room.gamestatus.p1ready = false;
                        room.gamestatus.p2ready = false;
                        room.gamestatus.starting = false;
                        sendPlayersEvent(room, 'send_countdown2', {secs:0, time: new Date()});
                        sendPlayersEvent(room, 'send_countdown2_over', { time: new Date()});
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
                room.player2.emit('disconnect_opposite', { time: new Date()});
            }

            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('disconnect_opposite', { player: 1 , time: new Date()});
                });
            }
        }
        else if (room.player2 === socket) {
            room.player2 = undefined;
            clog.consoleLog(1, 'disconnect', 'room:' + room.id + ' p2:' + socket.id);

            if (room.player1 !== undefined) {
                room.player1.emit('disconnect_opposite', { time: new Date()});
            }

            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('disconnect_opposite', { player: 2, time: new Date() });
                });
            }
        }
        else if (room.viewers.indexOf(socket) > -1) {
            if (removeViewer(room, socket)) {
                clog.consoleLog(1, 'disconnect', 'room:' + room.id + ' viewer:' + socket.id);
            }
        }

    });


    socket.on('init_viewer', function() {
        sendRoomsInfo(socket);
    });

    socket.on('viewer_changeroom', function (data) {
        if (data === undefined || data === null)
            return;

        var id = data.roomid;
        var nroom = findRoom(id);
        if (nroom === undefined || nroom === null)
            return;

        //leave room
        rooms.forEach(function (oroom) {
            if (removeViewer(oroom, socket)) {
                clog.consoleLog(1, 'viewer_leaveroom', 'room:' + oroom.id + ' user:' + socket.id);
            }
        });

        // goto new room
        if (nroom.viewers.indexOf(socket) === -1) {
            nroom.viewers.push(socket);
            clog.consoleLog(1, 'viewer_inroom', 'room:' + nroom.id + ' user:' + socket.id);
        }

        var p1Nickname = (nroom.player1 === undefined || nroom.player1.nickname === undefined) ? "" : nroom.player1.nickname;
        var p2Nickname = (nroom.player2 === undefined || nroom.player2.nickname === undefined) ? "" : nroom.player2.nickname;
        var p1Map = (nroom.player1 === undefined || nroom.gamestatus.p1map === undefined) ? undefined : nroom.gamestatus.p1map;
        var p2Map = (nroom.player2 === undefined || nroom.gamestatus.p2map === undefined) ? undefined : nroom.gamestatus.p2map;
        socket.emit('viewer_changeroom_suc', { roomid: nroom.id, p1name: p1Nickname, p1map: p1Map, p2name: p2Nickname, p2map: p2Map, time: new Date() });
    });

    socket.on('send_nickname', function(data) {
        if (data === undefined || data === null)
            return;

        var room = findRoom(data.id);
        if (room === undefined || room === null)
            return;

        if (socket === room.player1) {
            socket.nickname = data.nickname;
            clog.consoleLog(1, 'send_nickname', 'player1 set name:' + socket.nickname);

            if (room.player2 !== undefined) {
                room.player2.emit('send_nickname_opposite', { nickname: socket.nickname, time: new Date() });
            }
            
            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('send_nickname_opposite', { player: 1, nickname: socket.nickname, time: new Date() });
                });
            }
        }
        else if (socket === room.player2) {
            socket.nickname = data.nickname;
            clog.consoleLog(1, 'send_nickname', 'player2 set name:' + socket.nickname);
            
            if (room.player1 !== undefined) {
                room.player1.emit('send_nickname_opposite', { nickname: socket.nickname, time: new Date() });
            }
            
            if (room.viewers !== undefined) {
                room.viewers.forEach(function (viewer) {
                    viewer.emit('send_nickname_opposite', { player: 2, nickname: socket.nickname, time: new Date() });
                });
            }
        }
    });
});

function getLeaderboard(response, rowcount, mapsize) {
    sql.getLeaderList(
        {
            mapsize: parseInt(mapsize),
            sortType: 0,
            startIndex: 1,
            rowCount: parseInt(rowcount)
        },
        function (rtndata) {
            if (rtndata !== undefined && rtndata !== null && rtndata.length > 0)
                response.json({ data: rtndata[0] });
            else
                response.json({ data: undefined });
        }
    );
}

function genRoom() {
    var room = {
        id: -1,
        player1: undefined,
        player2: undefined,
        viewers:[],
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

    // 當有新room開啟時，告訴所有 viewer 讓他們的下拉選單可以選到此 room 
    // (目前不保證有 player 在玩)
    rooms.forEach(function(room) {
        room.viewers.forEach(function(viewer) {
            sendRoomsInfo(viewer);
        });
    });

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
        else if (room.viewers.indexOf(socket) > -1) {
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
        room.viewers.forEach(function(viewer) {
            viewer.emit(eventName);
        });

    } else {
        if (room.player1 !== undefined)
            room.player1.emit(eventName, data);
        if (room.player2 !== undefined)
            room.player2.emit(eventName, data);
        room.viewers.forEach(function (viewer) {
            viewer.emit(eventName, data);
        });
    }
}

function getWinner(room) {
    if (room === undefined || room === null ||
        room.gamestatus === undefined || room.gamestatus === null ||
        room.gamestatus.p1map === undefined || room.gamestatus.p1map === null ||
        room.gamestatus.p2map === undefined || room.gamestatus.p2map === null ||
        room.gamestatus.p1map.Score === undefined || room.gamestatus.p1map.Score === null ||
        room.gamestatus.p2map.Score === undefined || room.gamestatus.p2map.Score === null ) {
        return { time: new Date()};
    }

    if (room.gamestatus.p1map.Score > room.gamestatus.p2map.Score) {
        return { winner: 1, map: [room.gamestatus.p1map], time: new Date() };  //p1 win
    }
    if (room.gamestatus.p1map.Score < room.gamestatus.p2map.Score) {
        return { winner: 2, map: [room.gamestatus.p2map], time: new Date() };  //p2 win
    }
    if (room.gamestatus.p1map.Score === room.gamestatus.p2map.Score) {
        return { winner: 0, map: [room.gamestatus.p1map, room.gamestatus.p2map], time: new Date() };  //tie
    }

    return { time: new Date()};

}

function removeViewer(room, socket) {
    var index = room.viewers.indexOf(socket);
    if (index <= -1)
        return false;

    room.viewers[index] = undefined;
    room.viewers.splice(index, 1); 
    return true;
}

function getRoomsData() {
    var data = [];
    rooms.forEach(function(room) {
        var d = { id: room.id };
        if (data.indexOf(d) === -1) {
            data.push(d);
        }
    });

    return data;
}

function sendRoomsInfo(socket) {
    socket.emit('send_rooms', { rooms: getRoomsData(), time: new Date() });
}