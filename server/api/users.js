import { Router } from 'express'

const router = Router()

// Mock Users
const users = [
  { name: 'Alexandre', stuff: 'Chicken shit' },
  { name: 'Pooya', stuff: 'Likes frisbee' },
  { name: 'Sébastien', stuff: 'Sleeps a lot' },
  { name: 'Phil', stuff: 'Likes VueJS' },
]

/* GET users listing. */
router.get('/users', function (req, res, next) {
  console.log('API /users');
  res.json(users)
})

/* GET user by ID. */
router.get('/users/:id', function (req, res, next) {
  const id = parseInt(req.params.id)
  if (id >= 0 && id < users.length) {
    res.json(users[id])
  } else {
    res.sendStatus(404)
  }
})

export default router
