var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('powerdata.db', sqlite3.OPEN_READONLY, function(err){
    if(err) { 
      console.log(err);
      process.exit(1);
    }
  });
var express = require('express');
var app = express();

app.use(express.static('static'));

function getData(callback, complete){
  db.each("SELECT * FROM powerdata", callback, complete);
}

app.get('/', function (req, res) {
  res.sendFile( __dirname + '/index.html');
});

app.get('/upd8', function(req, res) {
  var chartData = {
    labels: [],
    datasets: [
      {
            label: "Power Data Set",
            fillColor: "rgba(0,0,0,0)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: []
      }
    ]
  }
  getData(function(err, rows) {
    if(err) console.log(err);
    console.log(JSON.stringify(rows));
    chartData.labels.push(rows['time']);
    chartData.datasets[0].data.push(rows['kilowatts']);
  }, function(){
    res.json(chartData);
  });
})

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
