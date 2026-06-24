import api from "./api";
import type { FiltrosVentasResponse, VentaResumen, VentaDetalle } from "../types/Venta/Venta.type";

export interface ConsultaVentasParams {
  idUsuario: number;
  idGrupoCliente: number;
  idVendedor: number;
  idLaboratorio: number;
  desde: string; // ISO date-time string
  hasta: string; // ISO date-time string
}

export const ventaService = {
  getFiltros: async (): Promise<FiltrosVentasResponse> => {
    const response = await api.get<FiltrosVentasResponse>("/venta/filtros");
    return response.data;
  },

  consultaVentas: async (params: ConsultaVentasParams): Promise<VentaResumen[]> => {
    const response = await api.post<VentaResumen[]>("/venta/consulta", params);
    return response.data;
  },

  getDetalleVenta: async (desde: string, hasta: string, idSucursal: number): Promise<VentaDetalle[]> => {
    const response = await api.get<VentaDetalle[]>("/venta/detalle", {
      params: { desde, hasta, idSucursal }
    });
    return response.data;
  },

  checkAdmin: async (idUsuario: number): Promise<{ isAdmin: boolean }> => {
    const response = await api.get<{ isAdmin: boolean }>("/venta/check-admin", {
      params: { idUsuario }
    });
    return response.data;
  }
};
