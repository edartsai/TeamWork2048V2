
var sql = require('mssql');

var request = new sql.Request(connection);
request.input('input_parameter', sql.Int, 10);
request.output('output_parameter', sql.VarChar(50));
request.execute('procedure_name', function (err, recordsets, returnValue) {
    // ... error checks

    console.dir(recordsets);
});