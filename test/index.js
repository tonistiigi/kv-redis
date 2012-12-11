var assert = require('assert')

var kv = require('kv/kv')(require('../'))()

var p = kv.put('hello/there') //check that we can handle funny characters
var r = Math.random()

p.write({hello: r})
p.end()

setTimeout(function() {
  var g = kv.get('hello/there')
  g.on('data', function (data) {
    assert.equal(data.hello, r)
    process.exit(0)
  })
})
