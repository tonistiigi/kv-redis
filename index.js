var parse = require('url').parse
var es = require('event-stream')
var Redis = require('./redis').Redis
var Stream = require('stream').Stream

module.exports = function (url, exports) {
  exports = exports || {}

  url = parse(url || '')
  url.hostname = url.hostname
  url.port = url.port || 6379
  var prefix = url.path ? url.path.substring(1) : 'kv'

  var client = new Redis(url.port, url.hostname, url.auth)

  client.on('error', function (err) {
    console.log('Redis error: ' + err)
  })

  exports.put = function (key, opts) {
    var _key = prefix + ':' + key
    opts = opts || {flags: 'w'}
    var ended, processing = 0

    ws = new Stream
    ws.writable = true

    ws.write = function(data) {
      processing++
      var call = client.exec(['append', _key, data])
      call.on('error', this.emit.bind(this, 'error'))
      call.on('end', function() {
        processing--
        if (ended && !processing) {
          ws.emit('close')
        }
      })
    }
    ws.end = function(data) {
      if (data) ws.write(data)
      if (!processing) {
        ws.emit('close')
      }
      else {
        ended = true
      }
    }

    if(opts.flags !== 'a') {
      client.exec(['set', _key, '']).on('error', ws.emit.bind(ws, 'error'))
    }

    return ws
  }

  exports.get = function (key, opts) {
    var _key = prefix + ':' + key
    return client.exec(['get', _key])
  }

  exports.has = function (key, callback) {
    var _key = prefix + ':' + key
    client.exec(['exists', _key]).pipe(es.wait(function(err, result){
      callback(err, !!+result)
    }))
  }

  exports.del = function (key, callback) {
    var _key = prefix + ':' + key
    client.exec(['del', _key]).pipe(es.wait(function(err, result){
      callback(err, !!+result)
    }))
  }

  return exports
}