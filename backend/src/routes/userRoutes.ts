import express from 'express';
import { register, login, refreshToken } from '../controllers/userController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

export default router; 