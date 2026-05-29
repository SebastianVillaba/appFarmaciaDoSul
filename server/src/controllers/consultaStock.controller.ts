import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

export const consultaStockByCodigo = async (req: Request, res: Response):Promise<void> => {

    const termino = Number(req.query.termino as string);
    const idSucursal = Number(req.query.idSucursal as string);

    console.log(termino, idSucursal);
    

    if (isNaN(termino)) {
        res.status(400).json({ message: "Debe introducir un criterio de busqueda valido! Revise..." });
        return;
    };

    try {
        console.log("Llegue a antes de idDeposito");
        const idDeposito = await executeRequest({
            query: `
            select idDeposito from deposito where idSucursal=${idSucursal}
            `,
            isStoredProcedure:false
        }).then(res=>res.recordset[0].idDeposito);
        const result = await executeRequest({
            query: `select p.idProducto,p.codigo,p.nombreProducto,presentacion,precio,SUM(s.cantidad) as stock from producto p inner join stock s
                    on p.idProducto=s.idProducto
                    where p.codigo=${termino} and s.idDeposito=${idDeposito}
                    group by p.idProducto,p.codigo,p.nombreProducto,presentacion,precio`,
            isStoredProcedure: false
        });

        res.json(result.recordset);
    } catch (error) {
        console.error("Error en consultaStockByCodigo:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
}

export const consultaStockByCodigoBarra = async (req: Request, res: Response):Promise<void> => {

    const termino = Number(req.query.termino as string);
    const idSucursal = Number(req.query.idSucursal as string);

    //console.log(termino, idSucursal);

    if (isNaN(termino)) {
        res.status(400).json({ message: "Debe introducir un criterio de busqueda valido! Revise..." });
        return;
    };

    try {

        // Obtenermos le idDeposito desde el idSucursal
        const idDeposito = await executeRequest({
            query: `
            select idDeposito from deposito where idSucursal=${idSucursal}
            `,
            isStoredProcedure:false
        }).then(res=>res.recordset[0].idDeposito);

        const result = await executeRequest({
            query: `select p.idProducto,p.codigo,p.nombreProducto,presentacion,precio,SUM(s.cantidad) as stock from producto p inner join stock s
                    on p.idProducto=s.idProducto
                    where p.codigoBarra=${termino} and s.idDeposito=${idDeposito}
                    group by p.idProducto,p.codigo,p.nombreProducto,presentacion,precio`,
            isStoredProcedure: false
        });

        res.json(result.recordset);
    } catch (error) {
        console.error("Error en consultaStockByCodigoBarra:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
}

export const consultaStockByNombre = async (req: Request, res: Response):Promise<void> => {

    const termino = req.query.termino as string;
    const idSucursal = Number(req.query.idSucursal as string);

    //console.log(termino, idSucursal);

    if (!termino || termino.length === 0) {
        res.status(400).json({ message: "Debe introducir un criterio de busqueda valido! Revise..." });
        return;
    };

    try {
        const idDeposito = await executeRequest({
            query: `
            select idDeposito from deposito where idSucursal=${idSucursal}
            `,
            isStoredProcedure:false
        }).then(res=>res.recordset[0].idDeposito);
        const result = await executeRequest({
            query: `select p.idProducto,rtrim(p.codigo) as codigo,rtrim(p.nombreProducto) as nombreProducto,rtrim(p.presentacion) as presentacion,precio,SUM(s.cantidad) as stock from producto p inner join stock s
                    on p.idProducto=s.idProducto
                    where p.nombreProducto like '${termino}%' and s.idDeposito=${idDeposito}
                    group by p.idProducto,p.codigo,p.nombreProducto,presentacion,precio`,
            isStoredProcedure: false
        });

        res.json(result.recordset);
    } catch (error) {
        console.error("Error en consultaStockByCodigo:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
}