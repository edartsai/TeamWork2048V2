var sql = require('mssql');

// config for your database
var config = {
    user: 'testuser',
    password: '123456',
    server: 'localhost',

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
    }
    
};
