import { Router } from 'express'

import users from './users'
import graph from './graph'

const router = Router()

// Add USERS Routes
router.use(users)
router.use(graph)

export default router
