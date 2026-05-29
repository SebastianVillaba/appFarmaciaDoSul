import { Router } from 'express';
import authRoutes from './auth.routes';
import pacoteRoutes from './pacote.routes';
import consultaStockRoutes from './consultaStock.routes';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas de paquetes
router.use('/pacote', pacoteRoutes);

// Rutas de consulta de stock
router.use('/consultaStock', consultaStockRoutes)

export default router;