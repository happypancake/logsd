/*jshint node:true, laxcomma:true */

var dgram  = require('dgram')
  , util    = require('util')
  , config = require('./lib/config')
  , helpers = require('./lib/helpers')
  , events = require('events')
  , logger = require('./lib/logger')
  , process_mgmt = require('./lib/process_mgmt')
  , uuid = require('node-uuid');

var server;
var flushInterval;
var backendEvents = new events.EventEmitter();
var entries = {};
var startup_time = Math.round(new Date().getTime() / 1000);

// Load and init the backend from the backends/ directory.
function loadBackend(config, name) {
  var backendmod = require(name);

  if (config.debug) {
    l.log("Loading backend: " + name, 'DEBUG');
  }

  var ret = backendmod.init(startup_time, config, backendEvents, l);
  if (!ret) {
    l.log("Failed to load backend: " + name);
    process.exit(1);
  }
}

// global for conf
var conf;

// Flush logs to each backend.
function flushLogs() {
  var entriesToFlush = entries;

  // After all listeners, reset the entries
  backendEvents.once('flush', function clear_entries(entries) {
    for (var id in entries) {
      delete(entries[id]);
    }
  });

  if (entriesToFlush != {}) {
    backendEvents.emit('flush', entriesToFlush);
  }
}

// Global for the logger
var l;

config.configFile(process.argv[2], function (config, oldConfig) {
  conf = config;

  process_mgmt.init(config);

  l = new logger.Logger(config.log || {});

  if (server === undefined) {
    var udp_version = config.address_ipv6 ? 'udp6' : 'udp4';
    server = dgram.createSocket(udp_version, function (msg, rinfo) {
      
      var packet = msg.toString();
      var fragments = packet.split('|');

      if (config.dumpMessages) {
        l.log(packet);
      }

      if (!helpers.is_valid_packet(fragments)) {
          l.log('Bad packet: ' + packet);
          return;
      }

      var payload = fragments[1].trim();
      var severity = fragments[0].trim(); 
      entries[uuid.v1()] = { severity: severity, payload: payload};
    });
    server.bind(config.port || 8127, config.address || undefined);
    util.log("server is up");

    flushInterval = Number(config.flushInterval || 10000);
    config.flushInterval = flushInterval;

    if (config.backends) {
      for (var i = 0; i < config.backends.length; i++) {
        loadBackend(config, config.backends[i]);
      }
    } else {
      // The default backend is graphite
      loadBackend(config, './backends/console');
    }

    // Setup the flush logs
    var flushInt = setInterval(flushLogs, flushInterval);
  }
});

process.on('exit', function () {
  flushLogs();
});
