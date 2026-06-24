import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { useUser } from '../../hooks/useUser';
import { pacoteService, type PacoteEntregado as PacoteEntregadoType } from '../../services/pacoteService';
import CabinIcon from '@mui/icons-material/Cabin';


export const PacoteEntregado = () => {
    const { idSucursal } = useUser();
    const [ entregados, setEntregados ] = useState<PacoteEntregadoType[]>([]);
    const [ loading, setLoading ] = useState(false);

    const [ refreshing, setRefreshing ] = useState(false);

    // Notificaciones / Feedback
    const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'success'
    });

  
      // Carga de entregados
    const fetchEntregados = useCallback(async (sucursalId: number) => {
        setLoading(true);
        try {
            const data = await pacoteService.getPacotesEntregados(sucursalId);
            setEntregados(data || []);
        } catch (error) {
            console.error('Error fetching entregados:', error);
            showNotification('Error al cargar el historial de entregados', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

        // Recarga global
    const handleRefresh = useCallback(async () => {
        if (!idSucursal) return;
        setRefreshing(true);
        await Promise.all([
            fetchEntregados(idSucursal)
        ]);
        setRefreshing(false);
        showNotification('Listas actualizadas correctamente', 'info');
    }, [idSucursal, fetchEntregados]);

    // Ejecutar consultas iniciales
    useEffect(() => {
    if (idSucursal) {
        fetchEntregados(idSucursal);
    }
    }, [idSucursal, fetchEntregados]);

    // Mostrar snackbar helper
    const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
        setAlert({ open: true, message, severity });
    };

    const handleCloseAlert = () => {
        setAlert((prev) => ({ ...prev, open: false }));
    };

    // Formateadores visuales
    const formatCurrency = (val: number) => {
        if (val === undefined || val === null) return '$ 0.00';
        return `${Number(val).toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}`;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Retorna original si no es ISO válida
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        } catch {
        return dateStr;
        }
    };

    if (!idSucursal) {
        return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', p: 3 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography sx={{ mt: 3, color: 'text.secondary', fontWeight: 500 }}>
            Cargando configuración de sucursal del usuario...
            </Typography>
        </Box>
        );
    }

    return (
        <>
            <Box 
                sx={{ 
                    p: { xs: 2, md: 4 }, 
                    minHeight: '100vh', 
                    backgroundColor: '#f6f9fc',
                    background: 'radial-gradient(circle at 10% 20%, rgba(238, 246, 253, 0.5) 0%, rgba(246, 249, 252, 1) 90%)'
                }}
            >
            <Container maxWidth="xl">
                {/* Cabecera Principal */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        justifyContent: 'space-between', 
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        mb: 4,
                        mt: 2
                    }}
                >
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a365d', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <CabinIcon sx={{ fontSize: 35, color: '#1976d2' }} />
                            Pacotes Entregados
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                            Sucursal Activa ID: <Chip label={idSucursal} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                        <Tooltip title="Actualizar datos manualmente">
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                            startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                            sx={{
                                py: 1,
                                px: 2.5,
                                borderRadius: 2,
                                borderColor: 'rgba(25, 118, 210, 0.4)',
                                fontWeight: 600,
                                textTransform: 'none',
                                backgroundColor: 'white',
                                '&:hover': {
                                    backgroundColor: '#f0f7ff',
                                }
                            }}
                        >
                            Actualizar
                        </Button>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Grid de Tablas */}
                <Grid container spacing={4}>

                {/* TABLA INFERIOR: ENTREGADOS EN EL DÍA */}
                <Grid size={12}>
                    <Card 
                        elevation={2} 
                        sx={{ 
                            borderRadius: 4, 
                            border: '1px solid rgba(25, 118, 210, 0.08)',
                            overflow: 'hidden'
                        }}
                    >
                    <Box 
                        sx={{ 
                        p: 3, 
                        backgroundColor: '#ffffff', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                        }}
                    >
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a365d' }}>
                                ÚLTIMOS ENTREGADOS EN EL DÍA
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Historial en tiempo real de los despachos completados hoy.
                            </Typography>
                        </Box>
                        <Chip 
                            label={entregados.length} 
                            color="success" 
                            sx={{ fontWeight: 'bold', px: 1 }} 
                            size="medium"
                        />
                    </Box>

                    <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
                        {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress size={40} />
                            <Typography sx={{ ml: 2, color: 'text.secondary' }}>Cargando historial...</Typography>
                        </Box>
                        ) : entregados.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                            <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                No hay entregas registradas hoy
                            </Typography>
                            <Typography variant="body2">
                                Los paquetes despachados el día de hoy figurarán en esta sección.
                            </Typography>
                        </Box>
                        ) : (
                        <Table stickyHeader sx={{ minWidth: 650 }}>
                            <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="center">Nro</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Cliente</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Factura</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="center">Nro. PreVenta</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Fecha/Hora</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="right">Total</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Vendedor/a</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Entregado por</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Fecha Ent.</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {entregados.map((row) => (
                                <TableRow key={row.idPreVenta + '-entregado'} hover>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>{row.Nro}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{row.cliente || '-'}</TableCell>
                                <TableCell>{row.factura || '-'}</TableCell>
                                <TableCell align="center">
                                    <Chip 
                                    label={row.idPreVenta} 
                                    size="small" 
                                    sx={{ fontWeight: 600, borderRadius: '6px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }} 
                                    />
                                </TableCell>
                                <TableCell>{formatDate(row.fechaAlta)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    {formatCurrency(row.totalVenta)}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{row.vendedor || '-'}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                                    {row.entregaPor || 'Usuario'}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: '#1565c0', fontWeight: 500 }}>
                                    {formatDate(row.fechaEntrega || '')}
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        )}
                    </TableContainer>
                    </Card>
                </Grid>
                </Grid>
            </Container>

            {/* Retroalimentación Visual (Snackbar) */}
            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                onClose={handleCloseAlert} 
                severity={alert.severity} 
                variant="filled"
                sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', fontWeight: 500 }}
                >
                {alert.message}
                </Alert>
            </Snackbar>
            </Box>
        </>
    )
}