import api from './api';

export interface ProductoStock {
  idProducto: number;
  codigo: string;
  nombreProducto: string;
  presentacion: string;
  precio: number;
  stock: number;
}

export const consultaStockService = {
  buscarPorCodigo: async (termino: string, idSucursal: number): Promise<ProductoStock[]> => {
    const response = await api.get<ProductoStock[]>('/consultaStock/codigo', {
      params: { termino, idSucursal }
    });
    return response.data;
  },

  buscarPorCodigoBarra: async (termino: string, idSucursal: number): Promise<ProductoStock[]> => {
    const response = await api.get<ProductoStock[]>('/consultaStock/codigoBarra', {
      params: { termino, idSucursal }
    });
    return response.data;
  },

  buscarPorNombre: async (termino: string, idSucursal: number): Promise<ProductoStock[]> => {
    const response = await api.get<ProductoStock[]>('/consultaStock/nombre', {
      params: { termino, idSucursal }
    });
    return response.data;
  }
};
