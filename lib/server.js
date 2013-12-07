'use strict';

/**
 * simplecached: server.
 * (C) 2013 Alex Fernández.
 */

// requires
var testing = require('testing');
var net = require('net');
var Log = require('log');

// globals
var log = new Log('info');

// constants
var DEFAULT_PORT = 11311;


/**
 * Server for simplecached.
 */
exports.Server = function(port, callback)
{
	// self-reference
	var self = this;

	// attributes
	var server;
	var cache = {};

	// init
	init();

	/**
	 * Init the connection.
	 */
	function init()
	{
		server = net.createServer(function(connection)
		{
			new ServerConnection(connection, cache);
		});
		port = port || DEFAULT_PORT;
		server.listen(port, function()
		{
			if (callback)
			{
				return callback(null, self);
			}
			log.notice('Started server on port %s', port);
		});
	}

	/**
	 * Close the server down.
	 */
	self.close = function(callback)
	{
		server.close(callback);
	};
};

/**
 * Connection to the server.
 */
var ServerConnection = function(connection, cache)
{	
	// init
	connection.on('data', receiveData);
	connection.on('error', function(error)
	{
		log.error('Received error %s', error);
	});

	/**
	 * Receive some data.
	 */
	function receiveData(data)
	{
		var line = String(data).trim();
		var words = line.split(' ');
		var command = words[0];
		if (command == 'quit' && words.length == 1)
		{
			log.info('Closing connection');
			return connection.end();
		}
		if (words.length < 2)
		{
			return error();
		}
		var key = words[1];
		if (command == 'get')
		{
			if (words.length != 2)
			{
				return error();
			}
			if (key in cache)
			{
				return write('VALUE ' + cache[key]);
			}
			return write('END');
		}
		if (command == 'set' && words.length >= 3)
		{
			cache[key] = words.slice(2).join(' ');
			return write('STORED');
		}
		if (command == 'delete')
		{
			if (key in cache)
			{
				delete cache[key];
				return write('DELETED');
			}
			return write('NOT_FOUND');
		}
		return write('ERROR');
	}

	/**
	 * Show an error.
	 */
	function error()
	{
		write('ERROR');
	}

	function write(message)
	{
		connection.write(message + '\r\n');
	}
};

/**
 * Test the server.
 */
function testServer(callback)
{
	var server = new exports.Server(DEFAULT_PORT, function(error)
	{
		testing.check(error, 'Error opening server', callback);
		server.close(function(error)
		{
			testing.check(error, 'Error closing server', callback);
			testing.success(callback);
		});
	});
}

/**
 * Run all tests.
 */
exports.test = function(callback)
{
	testing.run([testServer], callback);
};

// run tests if invoked directly
if (__filename == process.argv[1])
{
	exports.test(testing.show);
}

