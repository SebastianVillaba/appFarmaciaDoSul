import axios from 'axios';

export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'La sesión de ingreso expiró. Vuelva a ingresar usuario y contraseña.';
    }
    return error.response?.data?.message || fallback;
  }
  return 'Error inesperado al iniciar sesión';
};
