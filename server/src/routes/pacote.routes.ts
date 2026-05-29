import { Router } from "express";
import {
  consultaEntregaPacotePendiente,
  consultaEntregadosPacote,
  guardarEntregaPacote,
  consultaDetallePacote
} from "../controllers/pacote.controller";

const router = Router();

router.post("/pendiente", consultaEntregaPacotePendiente);
router.post("/entregados", consultaEntregadosPacote);
router.post("/guardar", guardarEntregaPacote);
router.get("/detalle", consultaDetallePacote);

export default router;
