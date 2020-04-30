const router = require('express').Router()
const graph = require('../misc/graph')
const LRU = require('lru-cache')
const download = require('../misc/download')


// , options = { max: 500
//             , length: function (n, key) { return n * 2 + key.length }
//             , dispose: function (key, n) { n.close() }
//             , maxAge: 1000 * 60 * 60 }
// , cache = LRU(options)
let cache = new LRU(10) // sets just the max size to 10 items (actually size, but default size is 1)

// Import API Routes
router.get('/healthcheck', (req, res, next) => {
  res.json({
    status: 'ok',
    version: '___INSERT_VERSION_HERE___',
    buildNo: '___INSERT_BUILD_NUMBER_HERE___',
    commitMsg: '___INSERT_COMMITMSG_HERE___',
    identifier: 'Slumberblug'
  })
})


/* GET user by ID. */
router.get('/graph/:region', function (req, res, next) {
  console.log('API /graph/:region', req.params)
  let region = req.params.region
  console.log(`API: Region is ${region}`);

  // See if we can use the value in the cache.
  let cacheKey = region
  let value = cache.get(cacheKey) // "value"
  if (req.query.reload) {
    console.log('Reloading cache')
    value = null
  }
  if (value) {
    res.json(value)
    return
  }

  // Download all we need from AWS
  download.downloadEverything(region, false, err => {
    if (err) {
      console.log(`Error downloading region ${region}\n`, err, err.stack);
      res.sendStatus(500)
      return;
    }
    let index = graph.index()
    // console.log('Have index:', index)
    let obj = { }
    for (var key in index) {
      obj[key] = index[key]
    }

    console.log('Setting value in the cache')
    cache.set(cacheKey, obj)

    res.json(obj)
  });
})

module.exports = router
