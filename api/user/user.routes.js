import express from 'express';
import { requireAuth, requireAdmin } from '../../middlewares/require-auth.middleware.js'

import { getUsers, getUser, removeUser, updateUser } from './user.controller.js';

const router = express.Router()


router.get('/', getUsers)
router.get('/:userId', getUser)
router.delete('/:userId', requireAuth, removeUser)
router.put('/:userId', requireAuth, requireAdmin, updateUser)

export const userRoutes = router