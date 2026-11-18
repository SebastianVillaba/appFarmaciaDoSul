import React, { useState } from 'react';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import type { JSX } from 'react';
import { authService } from '../../services/authService';
import type { LoginResponse } from '../../types/Login/login.type';
import { getAuthErrorMessage } from './authError';

interface Props {
  tempToken: string;
  onSuccess: (response: LoginResponse) => void;
  /** Recibe el token de enrolamiento para mostrar un QR nuevo. */
  onRescan: (enrollToken: string) => void;
  onCancel: () => void;
}

// app: código de la app | recovery: entrar con código de recuperación | rescan: volver a escanear el QR
type Mode = 'app' | 'recovery' | 'rescan';

const DESCRIPCION: Record<Mode, string> = {
  app: 'Ingrese el código de 6 dígitos que muestra su app autenticadora.',
  recovery: 'Ingrese uno de sus códigos de recuperación. Cada código se puede usar una sola vez.',
  rescan:
    'Para volver a escanear el QR ingrese uno de sus códigos de recuperación. ' +
    'La configuración anterior dejará de funcionar y deberá borrarla de la app autenticadora.',
};

export default function TwoFactorVerify({ tempToken, onSuccess, onRescan, onCancel }: Props): JSX.Element {
  const [mode, setMode] = useState<Mode>('app');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'rescan') {
        const { tempToken: enrollToken } = await authService.rescan2FA(tempToken, code);
        onRescan(enrollToken);
      } else if (mode === 'recovery') {
        onSuccess(await authService.recovery2FA(tempToken, code));
      } else {
        onSuccess(await authService.verify2FA(tempToken, code));
      }
    } catch (error) {
      setError(getAuthErrorMessage(error, 'Código inválido'));
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (next: Mode): void => {
    setMode(next);
    setCode('');
    setError('');
  };

  const usaCodigoRecuperacion = mode !== 'app';

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
        {mode === 'rescan' ? 'Volver a escanear el QR' : 'Verificación en 2 pasos'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
        {DESCRIPCION[mode]}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {usaCodigoRecuperacion ? (
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
          disabled={loading || (usaCodigoRecuperacion ? code.length < 8 : code.length !== 6)}
        >
          {loading ? 'Verificando...' : mode === 'rescan' ? 'Generar nuevo QR' : 'Verificar'}
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Link component="button" type="button" variant="body2" onClick={onCancel} disabled={loading}>
            Volver
          </Link>
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={() => changeMode(mode === 'recovery' ? 'app' : 'recovery')}
            disabled={loading}
          >
            {mode === 'recovery' ? 'Usar código de la app' : 'Usar código de recuperación'}
          </Link>
        </Box>

        {mode !== 'rescan' ? (
          <Button variant="outlined" onClick={() => changeMode('rescan')} disabled={loading}>
            Volver a escanear el QR
          </Button>
        ) : (
          <Link component="button" type="button" variant="body2" onClick={() => changeMode('app')} disabled={loading}>
            Cancelar y usar el código de la app
          </Link>
        )}
      </Stack>
    </Box>
  );
}
