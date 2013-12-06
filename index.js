'use strict';

/**
 * simplecached: simplified memcached server and client.
 * (C) 2013 Alex Fernández.
 */

var server = require('./lib/server.js');
var client = require('./lib/client.js');

exports.Server = server.Server;
exports.Client = client.Client;


