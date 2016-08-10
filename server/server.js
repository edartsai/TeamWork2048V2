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

app.get('/game2048single', function (req, res) {
    var isBattleMode = "0";
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


//app.get('/leaderboard.html', function(req, res) {
//    res.sendFile(__dirname + '/pages/leaderboard.html');
//});

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

app.use('/pages', express.static('pages'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));
app.use('/intro', express.static('intro'));
app.use('/js', express.static('js'));
app.use('/js_lib', express.static('js_lib'));


var groups = [];
var viewerMax = 2;

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

    // 玩家及觀戰者 online 時安排角色及初始化
    socket.on('init_battle', function (initmap) {
	    var group = findEmptyGroup();
        if (group === undefined || group === null)
            return;

        if (group.player1 === undefined) {
            group.player1 = socket;
            group.currentmap = initmap;
            socket.emit('init_battle', { gid: group.id, player: 1, map: group.currentmap });
            console.log('Init - Group' + group.id + ' Player1 SocketId:' + group.player1.id);
        }
        //else if (group.player2 === undefined) {
        //group.player2 = socket;
        //group.currentmap = initmap;
        //socket.emit('init_battle', { gid: group.id, player: 2, map: group.currentmap });
        //}
        else {
            socket.emit('init_battle', { gid: group.id, player: 0,  map: group.currentmap });
	        if (group.viewers.indexOf(socket) === -1) {
                group.viewers.push(socket);
                console.log('Init - Group' + group.id + ' Player0 SocketId:' + socket.id);
	        }
        }

    });

    // 將資料送給 玩家與觀戰者
    socket.on('send_battle', function (data) {
        var group = findGroup(data.gid);
        if (group === undefined || group === null)
            return;

        if (socket === group.player1 || socket === group.player2) {
            group.currentmap = data.map;

	        if (socket === group.player1) {
		        if (group.player2 !== undefined) {
                    group.player2.emit('send_battle', group.currentmap);
                    console.log('Send - Group' + group.id + ' Player2 SocketId:' + group.player2.id);
		        }
	        }

	        //if (socket === player2)
            //    if(player1 !== undefined)
            //        player1.emit('send_battle', group.currentmap);


            group.viewers.forEach(function (item) {
                item.emit('send_battle', group.currentmap);
                console.log('Send - Group' + group.id + ' Player0 SocketId:' + item.id);
            });
        }

    });

    // 將離線的玩家或觀戰者移除角色
    socket.on('disconnect', function () {

        var userData = findUserBySocket(socket);

        if (userData === undefined || userData === null)
            return;

        var group = userData.Group;
        if (group === undefined || group === null)
            return;

        if (userData.Player === 1) {
            group.player1 = undefined;
            console.log('Leav - Group' + group.id + ' Player1 SocketId:' + socket.id);
        }
        if (userData.Player === 2) {
            group.player2 = undefined;
            console.log('Leav - Group' + group.id + ' Player2 SocketId:' + socket.id);
        }
        else if (userData.Player === 0) {
            var index = group.viewers.indexOf(socket);

            if (index !== -1) {
                arrayRemove(group.viewers, index);
                console.log('Leav - Group' + group.id + ' Player0 SocketId:' + socket.id);
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

function genGroup() {
    var group = {
        id : -1,
        player1: undefined,
        player2: undefined,
        viewers: [],
        currentmap: undefined
    };

	return group;
}

function findEmptyGroup() {
    for (var i = 0; i < groups.length; i++) {
	    var group = groups[i];
        if (group.player1 === undefined ) {
            return group;
        }
        //else if (group.player2 === undefined) {
        //    return group;
        //}
        else if (group.viewers.length < viewerMax) {
            return group;
        }
    }

	var nGroup = genGroup();
    groups.push(nGroup);
	nGroup.id = groups.indexOf(nGroup);

	return nGroup;
}

function findGroup(gid) {
	return groups[gid];
}

function arrayRemove(array, index) {
	if (array.length <= index)
        return;

	array.splice(index, 1);
}

function findUserBySocket(socket) {
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        if (group.player1 === socket) {
            return { Group: group, Player: 1 };
        }
        if (group.player2 === socket) {
            return { Group: group, Player: 2 };
        }
        for (var j = 0; j < group.viewers.length; j++) {
            var viewer = group.viewers[j];
            if (viewer === socket)
                return { Group: group, Player: 0 };
        }
    }

    return undefined;

}
