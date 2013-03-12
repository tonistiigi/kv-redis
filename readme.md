[![Build Status](https://secure.travis-ci.org/tonistiigi/kv-redis.png)](http://travis-ci.org/tonistiigi/kv-redis)

# kv-redis

Redis endpoint for [dominictarr/kv](https://github.com/dominictarr/kv).

### Usage

`kv-redis` is included with `kv`.

```
var kv = require('kv/redis')('redis://password@localhost:6379/prefix')
```

If you want to use it directly, for example for running tests:

```
var rediskv = require('kv/kv')(require('kv-redis'))

var kv = rediskv()
var kv = rediskv('redis://password@localhost:6379/prefix')
```
