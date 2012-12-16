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

    var ws = es.through(function (data) {
      client.exec(['append', _key, data]).on('error', this.emit.bind(this, 'error'))
    })

    if(opts.flags !== 'a') {
      client.exec(['set', _key, '']).on('error', ws.emit.bind(ws, 'error'))
    }

    //remove readable api.
    ws.readable = false
    delete ws.pause
    delete ws.resume

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