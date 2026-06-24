import { Router } from 'express';
import authRoutes from './auth.routes';
import pacoteRoutes from './pacote.routes';
import consultaStockRoutes from './consultaStock.routes';
import ventaRoutes from './venta.routes';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas de paquetes
router.use('/pacote', pacoteRoutes);

// Rutas de consulta de stock
router.use('/consultaStock', consultaStockRoutes);

// Rutas de ventas
router.use('/venta', ventaRoutes);

export default router;