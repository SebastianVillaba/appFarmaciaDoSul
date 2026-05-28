import api from './api';

export interface PacotePendiente {
  idPreVenta: number;
  Cliente: string;
  Factura: string;
  Fecha: string;
  Total: number;
  Vendedor: string;
  [key: string]: any; // Allow additional database columns if returned
}

export interface PacoteEntregado extends PacotePendiente {
  EntregadoPor?: string;
  FechaEntrega?: string;
}

export const pacoteService = {
  getPacotesPendientes: async (idSucursal: number): Promise<PacotePendiente[]> => {
    const response = await api.post<PacotePendiente[]>('/pacote/pendiente', { idSucursal });
    return response.data;
  },

  getPacotesEntregados: async (idSucursal: number): Promise<PacoteEntregado[]> => {
    const response = await api.post<PacoteEntregado[]>('/pacote/entregados', { idSucursal });
    return response.data;
  },

  guardarEntregaPacote: async (payload: {
    idSucursal: number;
    idPreVenta: number;
    idUsuario: number;
  }): Promise<any> => {
    const response = await api.post('/pacote/guardar', payload);
    return response.data;
  }
};
