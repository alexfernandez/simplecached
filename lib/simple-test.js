'use strict';

var client = require('./lib/client.js');
var options = {
	port: 11311,
	host: 'localhost'
};
var client = new client.Client(options, function(error) {
	console.assert(!error, 'Could not open connection');
	var key = 'testing';
	var value = 'real value';
	client.set(key, value, function(error, result) {
		console.assert(!error, 'Error setting key');
		console.assert(result, 'Could not set key');
		client.get(key, function(error, result) {
			console.assert(!error, 'Error getting key');
			console.assert(result == value, 'Invalid get key');
			client.delete(key, function(error, result) {
				console.assert(!error, 'Error deleting key');
				console.assert(result, 'Could not delete key');
				client.close(function(error) {
					console.assert(!error, 'Error closing client');
				});
			});
		});
	});
});
