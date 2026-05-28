import { Router } from "express";
import {
  consultaEntregaPacotePendiente,
  consultaEntregadosPacote,
  guardarEntregaPacote
} from "../controllers/pacote.controller";

const router = Router();

router.post("/pendiente", consultaEntregaPacotePendiente);
router.post("/entregados", consultaEntregadosPacote);
router.post("/guardar", guardarEntregaPacote);

export default router;
