import { Router } from 'express';
import { reset2FA } from '../controllers/auth.controller';

const router = Router();

// Resetear el 2FA de un usuario (pérdida de teléfono y de códigos de recuperación)
router.post('/usuarios/:id/reset-2fa', reset2FA);

export default router;
