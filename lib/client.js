'use strict';

/**
 * simplecached: client.
 * (C) 2013 Alex Fernández.
 */

// requires
require('prototypes');
var net = require('net');
var Log = require('log');
var testing = require('testing');
var serverLib = require('./server.js');

// globals
var log = new Log('info');

// constants
var DEFAULT_PORT = 11311;

/**
 * Client for simplecached.
 */
exports.Client = function(options, callback)
{
	// self-reference
	var self = this;

	// attributes
	var client;
	var pending;

	// init
	init();

	/**
	 * Init the connection.
	 */
	function init()
	{
		options = options || {};
		var parsedPort = parseInt(options, 10);
		var params = {
			port: parsedPort || options.port || DEFAULT_PORT,
			host: 'localhost',
		};
		client = net.connect(params, callback);
		client.on('data', receiveData);
		client.on('error', receiveError);
		client.on('end', end);
	}

	/**
	 * Receive some data.
	 */
	function receiveData(data)
	{
		var message = String(data).trim();
		log.debug('Received %s', message);
		if (!pending)
		{
			log.error('No pending function for message %s', message);
			return;
		}
		var callback = pending;
		pending = null;
		callback(null, message);
	}

	/**
	 * Receive a connection error.
	 */
	function receiveError(error)
	{
		if (!pending)
		{
			log.error('No pending function for error %s', error);
			return;
		}
		pending(error);
		pending = null;
	}

	/**
	 * End the connection.
	 */
	function end()
	{
		log.debug('Connection finished');
		if (pending)
		{
			pending(null);
		}
	}

	/**
	 * Get a value from the remote simplecached.
	 */
	self.get = function(key, callback)
	{
		client.write('get ' + key + '\r\n');
		pending = function(error, result)
		{
			if (error)
			{
				return callback(error);
			}
			if (result == 'END')
			{
				return callback(null);
			}
			if (!result.startsWith('VALUE '))
			{
				log.error('Invalid line %s', result);
				callback('Invalid result');
			}
			var value = result.substringFrom('VALUE ');
			callback(null, value);
		};
	};

	/**
	 * Set a value in the remote simplecached.
	 */
	self.set = function(key, value, callback)
	{
		client.write('set ' + key + ' ' + value + '\r\n');
		pending = function(error, result)
		{
			return callback(error, result == 'STORED');
		};
	};

	/**
	 * Delete a value in the remote simplecached.
	 */
	self.delete = function(key, callback)
	{
		client.write('delete ' + key + '\r\n');
		pending = function(error, result)
		{
			return callback(error, result == 'DELETED');
		};
	};

	/**
	 * Close the connection.
	 */
	self.close = function(callback)
	{
		pending = callback;
		client.end();
	};
};

/**
 * Test the client.
 */
function testClient(callback)
{
	var port = 11312;
	var server = new serverLib.Server(port, function(error)
	{
		testing.check(error, 'Error creating server', callback);
		var client = new exports.Client(port, function(error)
		{
			testing.check(error, 'Error creating client', callback);
			var key = 'test' + Math.random();
			var value = 'naïve value';
			client.set(key, value, function(error, result)
			{
				testing.check(error, 'Error setting value', callback);
				testing.assertEquals(result, true, 'Invalid set', callback);
				client.get(key, function(error, result)
				{
					testing.check(error, 'Error getting value', callback);
					testing.assertEquals(result, value, 'Different value', callback);
					client.delete(key, function(error, result)
					{
						testing.check(error, 'Error deleting value', callback);
						testing.assertEquals(result, true, 'Invalid set', callback);
						client.close(function(error)
						{
							testing.check(error, 'Error closing client', callback);
							server.close(function(error)
							{
								testing.check(error, 'Error closing server', callback);
								testing.success(callback);
							});
						});
					});
				});
			});
		});
	});
}

/**
 * Run all tests.
 */
exports.test = function(callback)
{
	testing.run([ testClient ], callback);
};

// run tests if invoked directly
if (__filename == process.argv[1])
{
	exports.test(testing.show);
}

