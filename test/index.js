var assert = require('assert')
var es = require('event-stream')

var kv = require('kv/kv')(require('../'))()
var tests = {}
var hello = 'hello/there' //check that we can handle funny characters

var r = Math.random()
tests.putRandom = function(done) {
  var p = kv.put(hello)
  p.write({hello: r})
  p.end()
  p.on('close', done)
}

tests.getRandom = function(done) {
  var g = kv.get(hello)
  g.on('data', function (data) {
    assert.equal(data.hello, r)
    done()
  })
}

tests.has = function(done) {
  kv.has(hello, function(err, result) {
    assert(!err && result)
    done()
  })
}

tests.del = function(done) {
  kv.del(hello, function(err, result) {
    assert(!err && result)
    done()
  })
}

tests.hasfailure = function(done) {
  kv.has(hello, function(err, result) {
    assert(!err && !result)
    done()
  })
}

tests.multichunkput = function(done) {
  var p = kv.put(hello)
  p.write('foo')
  p.write('bar')
  p.write('baz')
  p.end()
  p.on('close', function() {
    kv.get(hello).pipe(es.wait(function(err, result) {
      assert(!err)
      assert.equal(result, 'foobarbaz')
      done()
    }))
  })
}

var buffer = new Buffer(1e5) // big enough for multi chunks.
for (var i = 0; i < 1e5; i++) buffer[i] = Math.floor(Math.random() * 255)
var kv2 = require('kv')()

tests.putBigBinary = function(done) {
  var p = kv2.put['raw'](hello)
  p.write(buffer)
  p.end()

  p.once('close', function() {
    kv2.get['raw'](hello).pipe(kv.put['raw'](hello))
      .once('close', done)
  })
}

tests.getBigBinary = function(done) {
  kv.get['raw'](hello).pipe(es.writeArray(function(err, chunks) {
    assert(!err)
    var buffer2 = Buffer.concat(chunks)
    assert.equal(buffer2.length, buffer.length)
    for (var i = 0; i < 1e5; i++) {
      if (buffer[i] != buffer2[i]) assert.fail()
    }
    kv.del(hello)
    done()
  }))
}

function runTests(keys) {
  if (!keys.length) process.exit(0)
  var key = keys.shift()
  tests[key](function(){
    console.log(key)
    runTests(keys)
  })
}
runTests(Object.keys(tests))
