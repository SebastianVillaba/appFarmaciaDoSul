import { Router } from 'express';
import authRoutes from './auth.routes';
import pacoteRoutes from './pacote.routes';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas de paquetes
router.use('/pacote', pacoteRoutes);

export default router;