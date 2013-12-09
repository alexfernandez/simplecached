[![Build Status](https://secure.travis-ci.org/alexfernandez/simplecached.png)](http://travis-ci.org/alexfernandez/simplecached)

# simplecached

Simplified version of memcached, useful for didactic purposes.

## Installation

Just run:

    npm install simplecached

or add it to your dependencies in package.json:

    "dependencies": {
        "simplecached": "*",
        ...
    },

## Server

To start a server, just require simplecached and create a server:

    var simplecached = require('simplecached');
    var server = new simplecached.Server();

To start the server on a port different than the default (11311),
add it to the Server constructor:

    var server = simplecached.Server(port);

Also a callback can be added to be notified when the server has started:

    var server = simplecached.Server(port, function(error, result) {
        console.log('Server started');
    });

To stop the server, call close() on it:

    server.close();

## Client

To create a client for a simplecached server, just create it.

    var simplecached = require('simplecached');
    var client = new simplecached.Client();

### new Client(options, callback);

The client constructor accepts an options object with port and host.
Also, an optional callback can be added to be notified when the client is connected.

    var options = {
        port: 11312,
        host: '192.168.1.15'
    };
    var client = new simplecached.Client(options, function(error) {
        console.log('Connected');
    });

The following functions can be called on the client.

### client.get(key, callback);

Get a key from the remote simplecached.
The callback is a `function(error, result)` that will be called either with an error or the result,
or null if the value was not found.

### client.set(key, value, callback);

Set a value into the remote simplecached.
The callback is a `function(error, result)` that will be called with an error or a result.
The `result` can be true if the value was stored, false otherwise.

### client.delete(key, callback);

Delete a value from the remote simplecached.
The callback is a `function(error, result)` that will be called with an error or a result.
The `result` can be true if the value was deleted, false if not found.

### client.close(callback);

Close the connection. The optional callback will be called after the connection is actually closed.

### Example

The following code opens a connection to a remote simplecached server.
Then it sets a key, retrieves it and checks that the value is correct.
Then it closes the connection.

    var simplecached = require('simplecached');
    var options = {
        port: 11312,
        host: '192.168.1.15'
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

The pyramid of callbacks can be avoided with a few named functions.

## Protocol

The line protocol for simplecached is a simplified version of memcached's.

### `get <key>\r\n`

Gets a key from the cache. The response can be either:

    VALUE <value>\r\n

when a value is found, or

    END\r\n

if the value was not found.

### `set <key> <value>\r\n`

Sets a value in the cache, always a string (without line feeds).
The response can be either:

    STORED\r\n

if the value was stored, or

    NOT_STORED\r\n

otherwise.

### `delete <key>\r\n`

Deletes a value from the cache.
The response can be either:

    DELETED\r\n

if the value was stored, or

    NOT_FOUND\r\n

otherwise.

### `quit\r\n`

Close the connection.

## License

Simplecached is licensed under the MIT license.
Please consult the LICENSE file for details.

