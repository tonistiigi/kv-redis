var net = require('net')
var Stream = require('stream').Stream
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
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
  this._queue = []
}
inherits(Redis, EventEmitter)

Redis.prototype._connect = function() {
  var socket = this._socket = net.connect(this._port, this._host)
  var parser = new Parser
  var self = this

  if (this._auth) {
    this.exec(['auth', this._auth]).on('error', function(err) {
      self.emit('error', err)
    })
  }

  socket.on('data', parser.execute.bind(parser))

  socket.on('error', function(err) {
    self._queue.forEach(function(stream) {
      stream.emit('error', err)
    })
    self._queue = []
    self._socket = null
  })

  parser.on('reply', function(data) {
    self._queue[0].emit('data', data)
    self._queue.shift().emit('end')
  })

  parser.on('reply partial', function(data) {
    self._queue[0].emit('data', data)
  })

  parser.on('reply error', function(err) {
    self._queue.shift().emit('error', err)
  })

  parser.on('error', socket.emit.bind(socket, 'error'))

}

Redis.prototype.exec = function(args) {
  if (!this._socket) this._connect()

  // Accepts both strings and buffers.
  this._socket.write('*' + args.length + '\r\n')
  for (var i = 0; i < args.length; i++) {
    this._socket.write('$' + Buffer.byteLength(args[i]) + '\r\n')
    this._socket.write(args[i])
    this._socket.write('\r\n')
  }
  var stream = new Stream
  stream.readable = true
  this._queue.push(stream)
  return stream
}

exports.Redis = Redis