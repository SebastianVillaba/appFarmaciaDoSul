import { Router } from "express";
import { getFiltros, consultarVentas, getDetalleVenta, checkAdmin } from "../controllers/venta.controller";

const router = Router();

// Endpoint para cargar catálogos de filtros
router.get("/filtros", getFiltros);

// Endpoint para realizar la consulta consolidada de ventas por sucursal
router.post("/consulta", consultarVentas);

// Endpoint para realizar la consulta detallada por sucursal seleccionada
router.get("/detalle", getDetalleVenta);

// Endpoint para verificar si el usuario es administrador
router.get("/check-admin", checkAdmin);

export default router;
