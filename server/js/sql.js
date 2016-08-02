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

            if (queryParams.sortType === undefined || parseInt(queryParams.sortType) !== queryParams.sortType)
                queryParams.sortType = 0;

            if (queryParams.startIndex === undefined || parseInt(queryParams.startIndex) !== queryParams.startIndex)
                queryParams.startIndex = -1;

            if (queryParams.rowCount === undefined || parseInt(queryParams.rowCount) !== queryParams.rowCount)
                queryParams.rowCount = -1;

            request.input("sortType", sql.Int, queryParams.sortType)
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

            if (queryParams.score === undefined || parseInt(queryParams.score) !== queryParams.score)
                queryParams.score = 0;

            if (queryParams.movetimes === undefined || parseInt(queryParams.movetimes) !== queryParams.movetimes)
                queryParams.movetimes = 0;

            if (queryParams.ip === undefined)
                queryParams.ip = '';

            request.input("name", sql.NVarChar, queryParams.name)
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
    }
};
