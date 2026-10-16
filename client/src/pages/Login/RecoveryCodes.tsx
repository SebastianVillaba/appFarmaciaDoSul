import { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import type { JSX } from 'react';

interface Props {
  codes: string[];
  onContinue: () => void;
}

export default function RecoveryCodes({ codes, onContinue }: Props): JSX.Element {
  const [saved, setSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const text = codes.join('\n');

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = (): void => {
    const blob = new Blob([`Farmacia Do Sul - Códigos de recuperación\n\n${text}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codigos-recuperacion-farmaciadosul.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center' }} gutterBottom>
        Códigos de recuperación
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        Guárdelos en un lugar seguro. Le permiten ingresar si pierde su teléfono.
        Cada código sirve una sola vez y <b>no se volverán a mostrar</b>.
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          fontFamily: 'monospace',
          fontSize: '1.1rem',
          textAlign: 'center',
          bgcolor: 'grey.100',
          p: 2,
          borderRadius: 1,
          mb: 2
        }}
      >
        {codes.map((c) => <span key={c}>{c}</span>)}
      </Box>

      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" fullWidth onClick={handleCopy}>
            {copied ? 'Copiados' : 'Copiar'}
          </Button>
          <Button variant="outlined" fullWidth onClick={handleDownload}>
            Descargar .txt
          </Button>
        </Stack>
        <FormControlLabel
          control={<Checkbox checked={saved} onChange={(e) => setSaved(e.target.checked)} />}
          label="Ya guardé mis códigos de recuperación"
        />
        <Button variant="contained" size="large" disabled={!saved} onClick={onContinue}>
          Continuar
        </Button>
      </Stack>
    </Box>
  );
}
