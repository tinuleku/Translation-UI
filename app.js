/**
 * Module dependencies.
 */

var express = require('express');
/** Routes **/
var routes = require('./routes');

var http = require('http');
var path = require('path');

var app = express();

//
// all environments
//
app.configure(function() {
    app.set('port', 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    //app.use(express.csrf());
    //app.use(flash());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

// Development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

//
// Routes
//
app.get('/', routes.index);
app.post('/edit_lng', routes.edit_lng);
app.post('/save', routes.save);
app.post('/rename_key', routes.rename_key);
app.post('/delete_key', routes.delete_key);

//error 404 page
app.use(function(req, res, next) {
    console.log('404 : ' + req.url);
    res.status(404);
    if (req.accepts('html')) {
        return res.render('404/index', {
            status: 404,
            url: req.url,
            user: req.user
        });
    }
    if (req.accepts('json')) {
        return res.send({
            error: 'Not found'
        });
    }

    return res.type('txt').send('Not found');
});

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});