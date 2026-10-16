import { Router } from 'express';
import authRoutes from './auth.routes';
import pacoteRoutes from './pacote.routes';
import consultaStockRoutes from './consultaStock.routes';
import ventaRoutes from './venta.routes';
import adminRoutes from './admin.routes';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.use('/auth', authRoutes);

// A partir de aquí todas las rutas requieren sesión completa (contraseña + 2FA)
router.use(requireAuth);

// Rutas de paquetes
router.use('/pacote', pacoteRoutes);

// Rutas de consulta de stock
router.use('/consultaStock', consultaStockRoutes);

// Rutas de ventas (las de reporte exigen administrador dentro de venta.routes)
router.use('/venta', ventaRoutes);

// Rutas de administración
router.use('/admin', requireAdmin, adminRoutes);

export default router;
