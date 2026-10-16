import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useUser } from '../../hooks/useUser';
import type { JSX } from 'react';
import type { EnableTwoFactorResponse, LoginResponse } from '../../types/Login/login.type';
import TwoFactorVerify from './TwoFactorVerify';
import TwoFactorSetup from './TwoFactorSetup';
import RecoveryCodes from './RecoveryCodes';
import { getAuthErrorMessage } from './authError';

type LoginStep = 'credentials' | 'verify' | 'enroll' | 'recoveryCodes';

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login } = useUser();
  const [usuario, setUsuario] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<LoginStep>('credentials');
  // El token temporal del 2FA vive solo en memoria, nunca en localStorage
  const [tempToken, setTempToken] = useState<string>('');
  // Sesión ya emitida que se completa cuando el usuario guarda sus códigos de recuperación
  const [pendingSession, setPendingSession] = useState<EnableTwoFactorResponse | null>(null);

  const completeLogin = (response: LoginResponse): void => {
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
        idUsuario: response.user.id,
        idSucursal: response.user.idSucursal
      });
    }

    // Redirigir al home
    navigate('/');
  };

  const backToCredentials = (): void => {
    setTempToken('');
    setPassword('');
    setError('');
    setStep('credentials');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({
        username: usuario,
        password: password
      });

      if (response.success === true && response.tempToken) {
        setTempToken(response.tempToken);
        setStep(response.requiresEnrollment ? 'enroll' : 'verify');
      } else {
        setError(response.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError(getAuthErrorMessage(error, 'Error al iniciar sesión'));
    } finally {
      setLoading(false);
    }
  };


  if (step === 'verify') {
    return <TwoFactorVerify tempToken={tempToken} onSuccess={completeLogin} onCancel={backToCredentials} />;
  }

  if (step === 'enroll') {
    return (
      <TwoFactorSetup
        tempToken={tempToken}
        onEnabled={(response) => {
          setTempToken('');
          setPendingSession(response);
          setStep('recoveryCodes');
        }}
        onCancel={backToCredentials}
      />
    );
  }

  if (step === 'recoveryCodes' && pendingSession) {
    return <RecoveryCodes codes={pendingSession.recoveryCodes} onContinue={() => completeLogin(pendingSession)} />;
  }

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


