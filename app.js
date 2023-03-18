// Create a new express application instance
var express = require('express');
var app = express();
var fs = require('fs');

// The app.get() method is used to define a route for the GET HTTP method.
// The first argument is the path of the route, and the second argument is the callback function that will be executed when the route is matched.
app.get('/', function (req, res) {
	res.send('Hello World!');
});

const downloadFile = (res, fileName) => {
	res.download(fileName, fileName, function (err) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
		} else {
			console.log('File downloaded');
		}
	});
};

app.get('/tv', function (req, res) {
	downloadFile(res, 'tv.m3u');
});

app.get('/all-tv', function (req, res) {
	downloadFile(res, 'allTv.m3u');
});

app.get('/vod', function (req, res) {
	downloadFile(res, 'vod.m3u');
});

app.get('/full', function (req, res) {
	downloadFile(res, 'iptv.m3u');
});

// The app.listen() method binds and listens for connections on the specified host and port.
app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
