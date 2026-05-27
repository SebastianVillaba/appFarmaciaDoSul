import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useUser } from '../../hooks/useUser';
import axios from 'axios';
import type { JSX } from 'react';

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login } = useUser();
  const [usuario, setUsuario] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({
        username: usuario,
        password: password
      });

      console.log('Login response:', response);

      if (response.success === true) {
        // Guardar token si existe
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }

        // Guardar información del usuario en localStorage
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Guardar datos del vendedor en Redux (estado global)
        if (response.user) {
          login({
            idUsuario: response.vendedor.idUsuario
          });
        }

        // Redirigir al home
        navigate('/');
      } else {
        setError(response.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error during login:', error);

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error al iniciar sesión');
      } else {
        setError('Error inesperado al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
        Iniciar sesión
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="Usuario"
          type="text"
          value={usuario}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsuario(e.target.value)}
          autoComplete="username"
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 10 } }}
          disabled={loading}
        />

        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 10 } }}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </Stack>
    </Box>
  );
}


