var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var mysql = require('mysql').createConnection({
//    user     : 'root',
//    password : '123456'
//});
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var http = require('http').createServer(app);
global.server = http;
var io = require('socket.io')(http);
//==DB=========================================================================|
//mysql.connect(err => {
//    if (err) {console.error(err)}
//})
//==View=======================================================================|
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use((req,res,next) => {req.DB = mysql});
app.use(favicon(path.join(__dirname, 'public', 'octopus.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', require("./routes/app"));
app.use('/api', require("./routes/api"));
app.use('/assets', express.static(path.join(__dirname, 'bower_components')));
app.use('/assets', express.static(path.join(__dirname, 'public')));

var users = 0, ans = {};
io.on('connection', function(socket){
    users++
    socket.broadcast.emit('user',users);
    socket.on('disconnect', function(){
        users--
        socket.broadcast.emit('user',users);
        console.log('user disconnected');
    });
    socket.on('poll_choice', function(msg){
        ans[msg] = ans[msg] || 0
        ans[msg]++
        io.emit('choice_update',{choices: ans});
    });
    socket.on('get_user', function(){
        io.emit('user',users)
    })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
