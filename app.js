var express = require('express');
var path = require( 'path' );
var port = process.env.PORT || 4000;
var app = express();

app.use(express.static(path.join(__dirname, "/app")));
app.set('views', __dirname + '/app');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.get('/', function (req, res) {
  res.render('index.html');
});

app.listen(port);