import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

type CampoBusqueda = "codigo" | "codigoBarra" | "nombre";

// Los nombres de columna son fijos; el término y el depósito siempre van como parámetros
const FILTROS: Record<CampoBusqueda, string> = {
    codigo: "p.codigo = @termino",
    codigoBarra: "p.codigoBarra = @termino",
    nombre: "p.nombreProducto like @termino + '%'",
};

const consultarStock = async (idSucursal: number, campo: CampoBusqueda, termino: string) => {
    const idDeposito = await executeRequest({
        query: `select idDeposito from deposito where idSucursal = @idSucursal`,
        isStoredProcedure: false,
        inputs: [{ name: "idSucursal", type: sql.Int(), value: idSucursal }]
    }).then(res => res.recordset[0]?.idDeposito);

    if (idDeposito === undefined) return [];

    const result = await executeRequest({
        query: `select p.idProducto,rtrim(p.codigo) as codigo,rtrim(p.nombreProducto) as nombreProducto,rtrim(p.presentacion) as presentacion,precio,SUM(s.cantidad) as stock from producto p inner join stock s
                on p.idProducto=s.idProducto
                where ${FILTROS[campo]} and s.idDeposito = @idDeposito
                group by p.idProducto,p.codigo,p.nombreProducto,presentacion,precio`,
        isStoredProcedure: false,
        inputs: [
            // código y código de barras se comparan como número, igual que antes
            campo === "nombre"
                ? { name: "termino", type: sql.VarChar(100), value: termino }
                : { name: "termino", type: sql.BigInt(), value: Number(termino) },
            { name: "idDeposito", type: sql.Int(), value: idDeposito }
        ]
    });
    return result.recordset;
};

const handler = (campo: CampoBusqueda) => async (req: Request, res: Response): Promise<void> => {
    const termino = String(req.query.termino ?? "").trim();
    const { idSucursal } = req.user!;

    const valido = campo === "nombre" ? termino.length > 0 : /^\d{1,18}$/.test(termino);
    if (!valido) {
        res.status(400).json({ message: "Debe introducir un criterio de busqueda valido! Revise..." });
        return;
    };

    try {
        res.json(await consultarStock(idSucursal, campo, termino));
    } catch (error) {
        console.error(`Error en consultaStock (${campo}):`, error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const consultaStockByCodigo = handler("codigo");
export const consultaStockByCodigoBarra = handler("codigoBarra");
export const consultaStockByNombre = handler("nombre");
