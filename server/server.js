var express = require('express');
var app = express();

app.listen(8001, function() {
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

app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));
app.use('/intro', express.static('intro'));
app.use('/js', express.static('js'));
app.use('/js_lib', express.static('js_lib'));




//var server = http.createServer(function (request, response) {
    //console.log('Connection');
    //var path = url.parse(request.url).pathname;

    //switch (path) {
    //    case '/':
    //        response.writeHead(200, { 'Content-Type': 'text/html' });
    //        response.write('Hello, World.');
    //        response.end();
    //        break;
    //    case '/index.html':
    //        fs.readFile(__dirname + path, function (error, data) {
    //            if (error) {
    //                response.writeHead(404);
    //                response.write("opps this doesn't exist - 404");
    //            } else {
    //                response.writeHead(200, { "Content-Type": "text/html" });
    //                response.write(data, "utf8");
    //            }
    //            response.end();
    //        });
    //        break;
    //    case '/index2.html':
    //        fs.readFile(__dirname + path, function (error, data) {
    //            if (error) {
    //                response.writeHead(404);
    //                response.write("opps this doesn't exist - 404");
    //            } else {
    //                response.writeHead(200, { "Content-Type": "text/html" });
    //                response.write(data, "utf8");
    //            }
    //            response.end();
    //        });
    //        break;
    //    case '/game2048.html':
    //        fs.readFile(__dirname + path, function (error, data) {
    //            if (error) {
    //                response.writeHead(404);
    //                response.write("opps this doesn't exist - 404");
    //            } else {
    //                response.writeHead(200, { "Content-Type": "text/html" });
    //                response.write(data, "utf8");
    //            }
    //            response.end();
    //        });
    //        break;
    //    default:
    //        response.writeHead(404);
    //        response.write("opps this doesn't exist - 404");
    //        response.end();
    //        break;
    //}
//});

