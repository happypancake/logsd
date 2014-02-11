/*jshint node:true, laxcomma:true */

var util = require('util');

function ConsoleBackend(startupTime, config, emitter){
  var self = this;
  this.config = config.console || {};

  // attach
  emitter.on('flush', function(entries) { self.flush(entries); });
}

ConsoleBackend.prototype.flush = function(entries) {
  console.log('Flushing logs');

  if(this.config.prettyprint) {
    console.log(util.inspect(entries, false, 5, true));
  } else {
    console.log(entries);
  }
};

exports.init = function(startupTime, config, events, logger) {
  var instance = new ConsoleBackend(startupTime, config, events);
  return true;
};