import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, setup2FA, enable2FA, verify2FA, recovery2FA } from '../controllers/auth.controller';
import { requireStage } from '../middlewares/auth.middleware';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intente nuevamente en unos minutos.' },
});

const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intente nuevamente en unos minutos.' },
});

//router.post('/register');
router.post('/login', authLimiter, login);

// Segundo factor
router.post('/2fa/setup', twoFactorLimiter, requireStage('enroll'), setup2FA);
router.post('/2fa/enable', twoFactorLimiter, requireStage('enroll'), enable2FA);
router.post('/2fa/verify', twoFactorLimiter, requireStage('mfa'), verify2FA);
router.post('/2fa/recovery', twoFactorLimiter, requireStage('mfa'), recovery2FA);

export default router;
