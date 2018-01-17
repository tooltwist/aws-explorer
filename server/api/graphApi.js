import { Router } from 'express'
import graph from '../misc/graph'
// import types from '../misc/types'
import LRU from 'lru-cache'
import download from '../misc/download'


// , options = { max: 500
//             , length: function (n, key) { return n * 2 + key.length }
//             , dispose: function (key, n) { n.close() }
//             , maxAge: 1000 * 60 * 60 }
// , cache = LRU(options)
let cache = LRU(10) // sets just the max size to 10 items (actually size, but default size is 1)

const router = Router()

// // Mock Users
// const users = [
//   { name: 'Alexandre', stuff: 'Chicken shit' },
//   { name: 'Pooya', stuff: 'Likes frisbee' },
//   { name: 'Sébastien', stuff: 'Sleeps a lot' },
//   { name: 'Phil', stuff: 'Likes VueJS' },
// ]
//
// /* GET users listing. */
// router.get('/graph', function (req, res, next) {
//   console.log('API /graph')
//   res.json(users)
// })

/* GET user by ID. */
router.get('/graph/:region', function (req, res, next) {
  console.log('API /graph/:region')
  // const id = parseInt(req.params.id)
  // const id = 0
  // if (id >= 0 && id < users.length) {
  //   res.json(users[id])
  // } else {
  //   res.sendStatus(404)
  // }

  // See if we already have what we need.

  console.log(`Region is ${req.params.region}`);

  let value = cache.get("key") // "value"
  if (value) {
    // console.log('Have value in cache:\n', value)
    // console.log('RETURNING CACHED VALUE');
    res.json(value)
    return
  }


  download.downloadEverything('ap-southeast-1', false, err => {
    if (err) {
      console.log('Error downloading region', err, err.stack);
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
    cache.set("key", obj)

    // let node = index['Load Balancer::ttcf-dcprd-alb-ch4dcprd']
    // console.log('\n\nlode on server:', node);

    res.json(obj)
  });
})

export default router
