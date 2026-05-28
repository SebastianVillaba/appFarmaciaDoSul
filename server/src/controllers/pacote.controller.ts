import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

export const consultaEntregaPacotePendiente = async (req: Request, res: Response):Promise<void> => {
    const { idSucursal } = req.body;

    if (!idSucursal) {
        res.status(400).json({ message: "idSucursal es obligatorio" });
        return;
    }

    try {
        const result = await executeRequest({
            query: "sp_consultaEntregaPactePendiente",
            isStoredProcedure: true,
            inputs: [
                {
                    name: "idSucursal",
                    type: sql.Int(),
                    value: idSucursal
                }
            ]
        });

        res.json(result.recordset);
    } catch (error) {
        console.error("Error en consultaEntregaPacotePendiente:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
}

export const consultaEntregadosPacote = async (req: Request, res: Response): Promise<void> => {
    const { idSucursal } = req.body;

    if (!idSucursal) {
        res.status(400).json({ message: "idSucursal es obligatorio" });
        return;
    }

    try {
        const result = await executeRequest({
            query: "sp_consultaEntregadosPacote",
            isStoredProcedure: true,
            inputs: [
                {
                    name: "idSucursal",
                    type: sql.Int(),
                    value: idSucursal
                }
            ]
        });

        res.json(result.recordset);
    } catch (error) {
        console.error("Error en consultaEntregadosPacote:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
}

export const guardarEntregaPacote = async (req: Request, res: Response): Promise<void> => {
    const { idSucursal, idPreVenta, idUsuario } = req.body;

    if (!idSucursal || !idPreVenta || !idUsuario) {
        res.status(400).json({ message: "idSucursal, idPreVenta e idUsuario son obligatorios" });
        return;
    }

    try {
        const result = await executeRequest({
            query: "sp_guardarEntregaPacote",
            isStoredProcedure: true,
            inputs: [
                {
                    name: "idSucursal",
                    type: sql.Int(),
                    value: idSucursal
                },
                {
                    name: "idPreVenta",
                    type: sql.Int(),
                    value: idPreVenta
                },
                {
                    name: "idUsuario",
                    type: sql.Int(),
                    value: idUsuario
                }
            ]
        });

        res.json(result.recordset);
    } catch (error) {
        console.error("Error en guardarEntregaPacote:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
}

