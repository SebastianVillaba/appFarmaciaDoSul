import api from './api.ts';
import type {
  LoginCredentials,
  LoginResponse,
  TwoFactorSetupResponse,
  EnableTwoFactorResponse,
} from '../types/Login/login.type';

const withTempToken = (tempToken: string) => ({ headers: { Authorization: `Bearer ${tempToken}` } });

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // 2FA: generar QR para enrolar la app autenticadora
  setup2FA: async (tempToken: string): Promise<TwoFactorSetupResponse> => {
    const response = await api.post<TwoFactorSetupResponse>('/auth/2fa/setup', {}, withTempToken(tempToken));
    return response.data;
  },

  // 2FA: confirmar el primer código y activar
  enable2FA: async (tempToken: string, code: string): Promise<EnableTwoFactorResponse> => {
    const response = await api.post<EnableTwoFactorResponse>('/auth/2fa/enable', { code }, withTempToken(tempToken));
    return response.data;
  },

  // 2FA: verificar el código en cada inicio de sesión
  verify2FA: async (tempToken: string, code: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/2fa/verify', { code }, withTempToken(tempToken));
    return response.data;
  },

  // 2FA: ingresar con un código de recuperación
  recovery2FA: async (tempToken: string, recoveryCode: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/2fa/recovery', { recoveryCode }, withTempToken(tempToken));
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
};
