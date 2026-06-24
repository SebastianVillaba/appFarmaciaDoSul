export interface GrupoCliente {
  idGrupoCliente: number;
  nombreGrupoCliente: string;
}

export interface Vendedor {
  idVendedor: number;
  nombreVendedor: string;
}

export interface Laboratorio {
  idLaboratorio: number;
  nombreLaboratorio: string;
}

export interface FiltrosVentasResponse {
  gruposClientes: GrupoCliente[];
  vendedores: Vendedor[];
  laboratorios: Laboratorio[];
}

export interface VentaResumen {
  sucursal: string;
  cantidad: number;
  efectivo: number;
  credito: number;
  tarjeta: number;
  debito: number;
  cheque: number;
  transferencia: number;
  delivery: number;
  total: number;
  costos: number;
  anulados: number;
  cobranzas: number;
  devoluciones: number;
  idSucursal: number;
}

export interface VentaDetalle {
  Nro: number;
  idVenta: number;
  factura: string;
  fecha: string;
  cliente: string;
  vendedor: string;
  nombreTipo: string;
  GS: number;
  real: number;
  dolar: number;
  Pix: number;
  usdt: number;
  totalCosto: number;
  total: number;
  porceMargen: number;
  tipo: number;
}
