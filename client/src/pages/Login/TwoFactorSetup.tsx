import React, { useState } from 'react';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import type { JSX } from 'react';
import { authService } from '../../services/authService';
import type { EnableTwoFactorResponse, TwoFactorSetupResponse } from '../../types/Login/login.type';
import { getAuthErrorMessage } from './authError';

interface Props {
  tempToken: string;
  onEnabled: (response: EnableTwoFactorResponse) => void;
  onCancel: () => void;
}

export default function TwoFactorSetup({ tempToken, onEnabled, onCancel }: Props): JSX.Element {
  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleShowQr = async (): Promise<void> => {
    setError('');
    setLoading(true);
    try {
      setSetup(await authService.setup2FA(tempToken));
    } catch (error) {
      setError(getAuthErrorMessage(error, 'No se pudo generar el código QR'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      onEnabled(await authService.enable2FA(tempToken, code));
    } catch (error) {
      setError(getAuthErrorMessage(error, 'Código inválido'));
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
        Configurar verificación en 2 pasos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!setup ? (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Por seguridad, su cuenta requiere un segundo paso al iniciar sesión.
            Instale en su teléfono <b>Google Authenticator</b> o <b>Microsoft Authenticator</b> y luego continúe.
          </Typography>
          <Button variant="contained" size="large" onClick={handleShowQr} disabled={loading}>
            {loading ? 'Generando...' : 'Mostrar código QR'}
          </Button>
          <Link component="button" type="button" variant="body2" onClick={onCancel} disabled={loading}>
            Volver
          </Link>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            1. Escanee este código con la app autenticadora.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img src={setup.qrDataUrl} alt="Código QR para la app autenticadora" width={200} height={200} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Si no puede escanearlo, ingrese esta clave manualmente:
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}
          >
            {setup.manualKey}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            2. Ingrese el código de 6 dígitos que muestra la app.
          </Typography>
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
          <Button type="submit" variant="contained" size="large" disabled={loading || code.length !== 6}>
            {loading ? 'Verificando...' : 'Activar'}
          </Button>
          <Link component="button" type="button" variant="body2" onClick={onCancel} disabled={loading}>
            Volver
          </Link>
        </Stack>
      )}
    </Box>
  );
}
