import React, { useState } from 'react';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import type { JSX } from 'react';
import { authService } from '../../services/authService';
import type { LoginResponse } from '../../types/Login/login.type';
import { getAuthErrorMessage } from './authError';

interface Props {
  tempToken: string;
  onSuccess: (response: LoginResponse) => void;
  onCancel: () => void;
}

export default function TwoFactorVerify({ tempToken, onSuccess, onCancel }: Props): JSX.Element {
  const [useRecovery, setUseRecovery] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = useRecovery
        ? await authService.recovery2FA(tempToken, code)
        : await authService.verify2FA(tempToken, code);
      onSuccess(response);
    } catch (error) {
      setError(getAuthErrorMessage(error, 'Código inválido'));
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (): void => {
    setUseRecovery(!useRecovery);
    setCode('');
    setError('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
        Verificación en 2 pasos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
        {useRecovery
          ? 'Ingrese uno de sus códigos de recuperación. Cada código se puede usar una sola vez.'
          : 'Ingrese el código de 6 dígitos que muestra su app autenticadora.'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {useRecovery ? (
          <TextField
            label="Código de recuperación"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.toUpperCase())}
            autoComplete="off"
            autoFocus
            required
            fullWidth
            placeholder="XXXX-XXXX"
            slotProps={{ htmlInput: { maxLength: 9 } }}
            disabled={loading}
          />
        ) : (
          <TextField
            label="Código"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ''))}
            autoComplete="one-time-code"
            autoFocus
            required
            fullWidth
            slotProps={{
              htmlInput: {
                maxLength: 6,
                inputMode: 'numeric',
                style: { letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.5rem' }
              }
            }}
            disabled={loading}
          />
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading || (useRecovery ? code.length < 8 : code.length !== 6)}
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link component="button" type="button" variant="body2" onClick={onCancel} disabled={loading}>
            Volver
          </Link>
          <Link component="button" type="button" variant="body2" onClick={toggleMode} disabled={loading}>
            {useRecovery ? 'Usar código de la app' : 'Usar código de recuperación'}
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}
