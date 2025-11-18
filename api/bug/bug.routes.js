import express from 'express';
import { getBugs, getBug, removeBug, updateBug, addBug } from './bug.controller.js';
import { log } from '../../middlewares/log.middleware.js';
import { requireAuth } from '../../middlewares/require-auth.middleware.js';

const router = express.Router()


router.get('/',log ,getBugs)
router.get('/:bugId',log ,getBug)
router.delete('/:bugId',log ,requireAuth, removeBug)
router.put('/:bugId',requireAuth, updateBug)
router.post('/',requireAuth, addBug)

export const bugRoutes = router