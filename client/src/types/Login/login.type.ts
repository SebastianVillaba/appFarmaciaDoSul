export interface LoginCredentials {
  username: string;
  password: string;
}

export interface VendedorData {
  idUsuario: number;
  idVendedor: number;
  nombreVendedor: string;
  idSucursal: number;
  idPersonaJur: number;
  dsuc: string;
  dcaja: string;
  factura: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    idSucursal: number;
  };
  vendedor?: VendedorData;
  // Segundo factor: la contraseña fue correcta pero falta el código
  requires2FA?: boolean;
  requiresEnrollment?: boolean;
  tempToken?: string;
}

export interface TwoFactorSetupResponse {
  qrDataUrl: string;
  manualKey: string;
}

export interface EnableTwoFactorResponse extends LoginResponse {
  recoveryCodes: string[];
}