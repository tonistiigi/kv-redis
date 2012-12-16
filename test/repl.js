var urlparse = require('url').parse
var Redis = require('../redis').Redis
var es = require('event-stream')

var url = urlparse(require('optimist').argv.url || '')

var client = new Redis(url.port, url.hostname, url.auth)

client.on('error', function(e) {
  console.error(e)
})

process.stdin.resume()
process.stdin.on('data', function(data) {
  var s = data.toString()
  s = s.substr(0, s.length - 1)
  if (s.length) {
    var stream = client.exec(s.split(/\s+/))
    stream.pipe(es.writeArray(function(err, array) {
      console.log(arguments)
    }))
    stream.on('error', function(err) {
      console.log(err)
    })
  }
})

