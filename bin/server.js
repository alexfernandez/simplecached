#!/usr/bin/env node
'use strict';

/**
 * Binary to run deployment server.
 * (C) 2013 Alex Fernández.
 */

// requires
var args = require('optimist').argv;
var server = require('../lib/server');

// globals
var port;


// init
if(args.help || args.h)
{
	help();
}
if(args._.length > 0)
{
    if(!isNaN(args._[0]))
	{
        port = parseInt(args._[0], 10);
    }
	else
	{
		console.log('Invalid port %s', args._[0]);
		help();
	}
}
new server.Server(port);

/**
 * Show online help.
 */
function help()
{
	console.log('Usage: simplecached [port]');
	console.log('  starts a simplecached server on the given port, default 11311.');
	process.exit(0);
}

