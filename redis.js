var net = require('net')
var Parser = require('redisparse').Parser

/*
  Simplified Redis client.
  Returns readable stream for any Redis command.
  Data type depends on the command.
  
*/

function Redis(port, host, auth) {
  this._port = port || 6379
  this._host = host || 'localhost'
  this._auth = auth
  this._socket = null
  this._parser = null
  this._queue = []
}

Redis.prototype._connect = function() {
  var socket = this._socket = net.connect(this._port, this._host)
  var parser = new Parser

  socket.on('data', parser.execute)
  
  socket.on('error', function() {
    
  })
  
  parser.on('reply', function() {
    
  })
  
  parser.on('reply partial', function() {
    
  })
  
  parser.on('reply error', function() {
    
  })
  
  parser.on('error', function() {
    
  })

}

Redis.prototype.exec = function(args) {

}

exports.Redis = Redis