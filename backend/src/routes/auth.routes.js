import express from 'express';
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);

router.get('/check', protectedRoute, checkAuth);

router.put('/update-profile', protectedRoute, updateProfile);
router.put('/profile', protectedRoute, updateProfile);

// router.get('/profile', profile);

router.get('/forgot-password', (req, res) => {
    res.send('Forgot Password route');
} );

export default router;