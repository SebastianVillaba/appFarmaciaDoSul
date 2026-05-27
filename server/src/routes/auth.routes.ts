import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

//router.post('/register');
router.post('/login', login);

export default router;
