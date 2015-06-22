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
  res.sendFile( __dirname + '/index.html');
});

app.get('/upd8', function(req, res) {
  var data = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
        {
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 86, 27, 90]
        }
    ]
  };
  res.json(data);
})

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
