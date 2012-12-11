var parse = require('url').parse
var es = require('event-stream')
var redis = require('redis')
var Stream = require('stream').Stream

module.exports = function (url, exports) {
  exports = exports || {}
  
  url = parse(url)
  url.port = url.port || 6379
  var prefix = url.path ? url.path.substring(1) : 'kv'
  
  var client = redis.createClient(url.port, url.hostname)
  if (url.auth) {
    client.auth(url.auth)
  }
  
  client.on('error', function (err) {
    console.log('Redis error: ' + err)
  })
  var noop = function() {}
  
  exports.put = function (key, opts) {
    var _key = prefix + ':' + key
    opts = opts || {flags: 'w'}
    if(opts.flags !== 'a') {
      client.set(_key, '', noop)
    }
    
    var ws = es.through(function (data) {
      client.append(_key,  data + '\n', noop)
    })

    //remove readable api.
    ws.readable = false
    delete ws.pause
    delete ws.resume

    return ws
  }
  
  exports.get = function (key, opts) {
    var _key = prefix + ':' + key
    var ws = new Stream
    client.get(_key, function(err, reply) {
      if (reply) {
        var array = reply.split(/(\n)/)
        if(!array[array.length - 1])
          array.pop() //expecting an empty '' at the end.
        array.forEach(function(d) {
          ws.emit('data', d)
        })
      }
      ws.emit('end')
    })
    return ws
  }
  
  exports.has = function (key, callback) {
    var _key = prefix + ':' + key
    client.exists(_key, callback)
  }
  
  exports.del = function (key, callback) {
    var _key = prefix + ':' + key
    client.del(_key, callback)
  }
  
  return exports
}