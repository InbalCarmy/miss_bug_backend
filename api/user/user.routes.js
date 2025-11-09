import express from 'express';
import { getUsers, getUser, removeUser, updateUser, addUser } from './user.controller.js';

const router = express.Router()


router.get('/', getUsers)
router.get('/:userId', getUser)
router.delete('/:userId', removeUser)
router.put('/:userId', updateUser)
router.post('/', addUser)

export const userRoutes = router