import { Router } from 'express'

import users from './users'
import graphApi from './graphApi'

const router = Router()

// Add USERS Routes
router.use(users)
router.use(graphApi)

export default router
