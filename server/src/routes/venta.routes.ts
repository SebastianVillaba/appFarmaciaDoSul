import { Router } from "express";
import { getFiltros, consultarVentas, getDetalleVenta, checkAdmin } from "../controllers/venta.controller";
import { requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Endpoint para verificar si el usuario es administrador
router.get("/check-admin", checkAdmin);

// Endpoint para cargar catálogos de filtros
router.get("/filtros", requireAdmin, getFiltros);

// Endpoint para realizar la consulta consolidada de ventas por sucursal
router.post("/consulta", requireAdmin, consultarVentas);

// Endpoint para realizar la consulta detallada por sucursal seleccionada
router.get("/detalle", requireAdmin, getDetalleVenta);

export default router;
