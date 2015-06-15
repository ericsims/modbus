var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('powerdata.db', sqlite3.OPEN_READONLY, function(err){
    if(err) { 
      console.log(err);
      process.exit(1);
    }
  });
var express = require('express');
var app = express();

var polldb = setInterval(function() { 
  db.each("SELECT * FROM powerdata", function(err, data) {
    if(err) console.log(err);
    console.log('data: ' + JSON.stringify(data));
  });
}, 1000);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
