/*jslint node: true, white: true, sloppy: true */

/*
 * Flushes logs to Logentries (https://logenties.com).
 *
 * To enable this backend, include 'logentries' in the
 * backends configuration array:
 *
 *   backends: ['logentries']
 *
 * The backend will read the configuration options from the main
 * logsd configuration file under the sub-hash key 'logentries'.
 */

var   net = require('net'),
     util = require('util'),
url_parse = require('url').parse,
    https = require('https'),
     http = require('http'),
       fs = require('fs');
       le = require('node-logentries');

var debug, logAll;
var token;
var log;
var flushInterval;

var flush = function flush(entries)
{
  for (var id in entries) {
    var entry = entries[id];

    switch (entry.severity) {
      case "error":
        log.log("err", entry.payload);
        break;
      default:
        log.log(entry.severity, entry.payload);
        break;      
    }
  }
};

exports.init = function logentries_init(startup_time, config, events, logger)
{
  logAll = debug = config.debug;

  if (typeof logger !== 'undefined') {
    util = logger; // override the default
    logAll = true;
  }

  // Config options are nested under the top-level 'logentries' hash
  if (config.logentries) {
    token = config.logentries.token;
    sourceName = config.logentries.source;

    if (sourceName == null) {
      var os = require('os');
      sourceName = os.hostname();
    }
  }

  if (!token) {
    util.log("Invalid configuration for Logentries backend", "LOG_CRIT");
    return false;
  }

  flushInterval = config.flushInterval;
  
  log = le.logger({
    token: token
  });

  events.on('flush', flush);

  return true;
};