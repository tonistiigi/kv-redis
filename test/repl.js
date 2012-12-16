var Redis = require('../redis').Redis
var es = require('event-stream')

var client = new Redis

process.stdin.resume()
process.stdin.on('data', function(data) {
  var s = data.toString()
  s = s.substr(0, s.length - 1)
  if (s.length) {
    var stream = client.exec(s.split(' '))
    stream.pipe(es.writeArray(function(err, array) {
      console.log(arguments)
    }))
    stream.on('error', function(err) {
      console.log(err)
    })
  }
})

