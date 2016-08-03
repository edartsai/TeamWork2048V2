var sql = require('mssql');

// config for your database
var config = {
    user: 'testuser',
    password: '123456',
    server: '10.1.4.226',

    options: {
        port: 12001,
        database: 'game2048',
        instancename: 'SQLEXPRESS226'
    }
};

module.exports = {
    getLeaderList : function(queryParams, callback) {
        sql.connect(config, function (err) {
            if (err) console.log(err);

            var request = new sql.Request();

            if (queryParams.mapsize === undefined || parseInt(queryParams.mapsize) !== queryParams.mapsize)
                queryParams.mapsize = 4;

            if (queryParams.sortType === undefined || parseInt(queryParams.sortType) !== queryParams.sortType)
                queryParams.sortType = 0;

            if (queryParams.startIndex === undefined || parseInt(queryParams.startIndex) !== queryParams.startIndex)
                queryParams.startIndex = -1;

            if (queryParams.rowCount === undefined || parseInt(queryParams.rowCount) !== queryParams.rowCount)
                queryParams.rowCount = -1;

            request.input("mapsize", sql.Int, queryParams.mapsize)
                   .input("sortType", sql.Int, queryParams.sortType)
                   .input("startIndex", sql.Int, queryParams.startIndex)
                   .input("pageCount", sql.Int, queryParams.rowCount)
                   .execute("usp_getLeaderList").then(function (recordsets) {
                    callback(recordsets);
                })
                .catch(function (erro) {
                    console.assert(erro);
                });

        });
    },

    addLeaderListItem : function (queryParams, callback) {
        sql.connect(config, function (err) {
            if (err) console.log(err);

            var request = new sql.Request();

            if (queryParams.name === undefined )
                queryParams.name = '';

            if (queryParams.mapsize === undefined || parseInt(queryParams.mapsize) !== queryParams.mapsize)
                queryParams.mapsize = 4;

            if (queryParams.score === undefined || parseInt(queryParams.score) !== queryParams.score)
                queryParams.score = 0;

            if (queryParams.movetimes === undefined || parseInt(queryParams.movetimes) !== queryParams.movetimes)
                queryParams.movetimes = 0;

            if (queryParams.ip === undefined)
                queryParams.ip = '';

            request.input("name", sql.NVarChar, queryParams.name)
                   .input("mapsize", sql.Int, queryParams.mapsize)
                   .input("score", sql.Int, queryParams.score)
                   .input("movetimes", sql.Int, queryParams.movetimes)
                   .input("ip", sql.NChar, queryParams.ip)
                   .execute("usp_addLeaderList").then(function (result) {
                    callback(result);
                })
                .catch(function (erro) {
                    console.assert(erro);
                });

        });
    },

    getScreenshotList: function (queryParams, callback) {
        sql.connect(config, function (err) {
            if (err) console.log(err);

            var request = new sql.Request();

            if (queryParams.startindex === undefined || parseInt(queryParams.startindex) !== queryParams.startindex)
                queryParams.startindex = -1;

            if (queryParams.rowcount === undefined || parseInt(queryParams.rowcount) !== queryParams.rowcount)
                queryParams.rowcount = -1;

            request.input("startindex", sql.Int, queryParams.startindex)
                   .input("rowcount", sql.Int, queryParams.rowcount)
                   .execute("usp_getScreenshotList").then(function (recordsets) {
                    callback(recordsets);
                })
                .catch(function (erro) {
                    console.assert(erro);
                });

        });
    },

    getScreenshotData: function (queryParams, callback) {
        sql.connect(config, function (err) {
            if (err) console.log(err);

            var request = new sql.Request();

            if (queryParams.ssid === undefined || parseInt(queryParams.ssid) !== queryParams.ssid)
                callback(undefined);

            request.input("ssid", sql.Int, queryParams.ssid)
                   .execute("usp_getScreenshotData").then(function (recordsets) {
                    callback(recordsets);
                })
                .catch(function (erro) {
                    console.assert(erro);
                });

        });
    },

    addScreenshotItem : function (queryParams, callback) {
        sql.connect(config, function (err) {
            if (err) console.log(err);

            var request = new sql.Request();

            if (queryParams.datatype === undefined || parseInt(queryParams.datatype) !== queryParams.datatype)
                queryParams.datatype = 0;

            if (queryParams.data === undefined)
                queryParams.data = "";

            request.input("data", sql.NVarChar, queryParams.data)
                   .input("datatype", sql.Int, queryParams.datatype)
                    .execute("usp_addScreenshot").then(function (result) {
                    callback(result);
                })
                .catch(function (erro) {
                    console.assert(erro);
                });

        });
    }
};
