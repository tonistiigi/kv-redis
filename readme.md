# kv-redis

Redis endpoint for [dominictarr/kv](https://github.com/dominictarr/kv).

### Usage

```
var rediskv = require('kv/kv')(require('kv-redis'))

var kv = rediskv()
var kv = rediskv('redis://password@localhost:6379/prefix')
```
