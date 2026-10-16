import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

/**
 * Obtener todos los filtros para el encabezado de ventas:
 * - Grupo Cliente
 * - Vendedor
 * - Laboratorio
 */
export const getFiltros = async (req: Request, res: Response): Promise<void> => {
  try {
    const [gcResult, vendResult, labResult] = await Promise.all([
      executeRequest({
        query: `SELECT idGrupoCliente, rtrim(nombreGrupoCliente) as nombreGrupoCliente 
                FROM grupoCliente 
                WHERE activo = 1 
                ORDER BY nombreGrupoCliente`,
        isStoredProcedure: false
      }),
      executeRequest({
        query: `SELECT idVendedor, rtrim(nombre) as nombreVendedor 
                FROM v_vendedor 
                WHERE activo = 1 
                ORDER BY nombre`,
        isStoredProcedure: false
      }),
      executeRequest({
        query: `SELECT idLaboratorio, rtrim(nombreFantasia) as nombreLaboratorio 
                FROM v_laboratorio 
                WHERE activo = 1 
                ORDER BY nombreFantasia`,
        isStoredProcedure: false
      })
    ]);

    res.json({
      gruposClientes: gcResult.recordset,
      vendedores: vendResult.recordset,
      laboratorios: labResult.recordset
    });
  } catch (error) {
    console.error("Error en getFiltros:", error);
    res.status(500).json({ message: "Error al obtener filtros desde el servidor" });
  }
};

/**
 * Verificar si el usuario actual es administrador
 */
export const checkAdmin = async (req: Request, res: Response): Promise<void> => {
  res.json({ isAdmin: !!req.user?.administrador });
};

/**
 * Cargar y consultar ventas de sucursales.
 * Llama a sp_cargarTmpVentaInfo y luego sp_consultaTmpVentaInfo.
 */
export const consultarVentas = async (req: Request, res: Response): Promise<void> => {
  const { idUsuario } = req.user!;
  const { idGrupoCliente, idVendedor, idLaboratorio, desde, hasta } = req.body;

  try {
    const formattedDesde = new Date(desde);
    const formattedHasta = new Date(hasta);

    if (isNaN(formattedDesde.getTime()) || isNaN(formattedHasta.getTime())) {
      res.status(400).json({ message: "Las fechas provistas no son válidas" });
      return;
    }

    // 1. Cargar las ventas en la tabla temporal para el usuario (idConfig = idUsuario)
    await executeRequest({
      query: "sp_cargarTmpVentaInfo",
      isStoredProcedure: true,
      inputs: [
        { name: "idConfig", type: sql.Int(), value: Number(idUsuario) },
        { name: "idGrupoCliente", type: sql.Int(), value: Number(idGrupoCliente ?? 0) },
        { name: "idVendedor", type: sql.Int(), value: Number(idVendedor ?? 0) },
        { name: "idLaboratorio", type: sql.Int(), value: Number(idLaboratorio ?? 0) },
        { name: "desde", type: sql.DateTime(), value: formattedDesde },
        { name: "hasta", type: sql.DateTime(), value: formattedHasta }
      ]
    });

    // 2. Consultar las ventas cargadas en la tabla temporal
    const result = await executeRequest({
      query: "sp_consultaTmpVentaInfo",
      isStoredProcedure: true,
      inputs: [
        { name: "idConfig", type: sql.Int(), value: Number(idUsuario) }
      ]
    });

    res.json(result.recordset);
  } catch (error) {
    console.error("Error en consultarVentas:", error);
    res.status(500).json({ message: "Error interno al procesar el reporte de ventas" });
  }
};

/**
 * Obtener el detalle de ventas para una sucursal en un rango de fechas.
 * Llama a sp_consultaDetalleVentaSucursal_tabla.
 */
export const getDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  const { desde, hasta, idSucursal } = req.query;

  if (!desde || !hasta || !idSucursal) {
    res.status(400).json({ message: "desde, hasta e idSucursal son campos requeridos" });
    return;
  }

  try {
    const formattedDesde = new Date(desde as string);
    const formattedHasta = new Date(hasta as string);

    if (isNaN(formattedDesde.getTime()) || isNaN(formattedHasta.getTime())) {
      res.status(400).json({ message: "Las fechas provistas no son válidas" });
      return;
    }

    const result = await executeRequest({
      query: "sp_consultaDetalleVentaSucursal_tabla",
      isStoredProcedure: true,
      inputs: [
        { name: "desde", type: sql.Date(), value: formattedDesde },
        { name: "hasta", type: sql.Date(), value: formattedHasta },
        { name: "idSucursal", type: sql.Int(), value: Number(idSucursal) }
      ]
    });

    res.json(result.recordset);
  } catch (error) {
    console.error("Error en getDetalleVenta:", error);
    res.status(500).json({ message: "Error interno al obtener detalle de ventas" });
  }
};
