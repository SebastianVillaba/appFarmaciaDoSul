import { Router } from "express";
import {
    consultaStockByCodigo,
    consultaStockByCodigoBarra,
    consultaStockByNombre
} from "../controllers/consultaStock.controller";

const router = Router();

router.get("/codigo", consultaStockByCodigo);
router.get("/codigoBarra", consultaStockByCodigoBarra);
router.get("/nombre", consultaStockByNombre);

export default router;
