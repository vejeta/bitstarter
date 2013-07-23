var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {

    // response.send('Hello World 2!');
    bufferIndex= fs.readFileSync('index.html');
    response.send(bufferIndex.toString());

});

process.env.PWD = process.cwd();
app.use('/media',express.static(process.env.PWD+'/media'));



var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
