import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

export const consultaEntregaPacotePendiente = async (req: Request, res: Response):Promise<void> => {
    const { idSucursal } = req.user!;

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
    const { idSucursal } = req.user!;

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
    const { idSucursal, idUsuario } = req.user!;
    const { idPreVenta } = req.body;

    if (!idPreVenta) {
        res.status(400).json({ message: "idPreVenta es obligatorio" });
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
                    name: "idUsuarioAlta",
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

// En la sucursal 11 no se usa preventa: el "idPreVenta" que devuelve
// funEntregaPacotePendiente_tabla es en realidad el idVenta (igual que en sp_guardarEntregaPacote)
const queryDetalleVenta = `
    select
    dv.idDetVenta as idDetPreVenta,
    CASE
        WHEN p.presentacion<>'' THEN p.nombreProducto + ' ' + '(' + p.presentacion + ')'
        ELSE p.nombreProducto
    END AS nombreProducto,
    dv.cantidad, dv.precioDescuento as precio, dv.subtotal
    from detVenta dv inner join producto p
    on dv.idProducto=p.idProducto
    where dv.idVenta=@idPreVenta`;

export const consultaDetallePacote = async (req: Request, res: Response): Promise<void> => {
    const { idSucursal } = req.user!;
    const { idPreVenta } = req.query;

    if (!idPreVenta) {
        res.status(400).json({ message: "Debe seleccionar algúna preventa! Revise..." });
        return;
    }

    try {
        const result = await executeRequest({
            query: idSucursal === 11 ? queryDetalleVenta : `select * from [funVerDetPreventa](@idPreVenta)`,
            isStoredProcedure: false,
            inputs: [
                {
                    name: "idPreVenta",
                    type: sql.Int(),
                    value: idPreVenta
                }
            ]
        });

        res.json(result.recordset);
    } catch (error) {
        console.error("Error en consultaDetallePacote:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
}