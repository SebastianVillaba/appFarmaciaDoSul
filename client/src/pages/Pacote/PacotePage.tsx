import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Zoom
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { useUser } from '../../hooks/useUser';
import { pacoteService, type PacotePendiente } from '../../services/pacoteService';
import { ModalDetPacote } from '../../components/ModalDetPacote';
import type { DetallePacote } from '../../types/Pacote/pacote.type';

export default function PacotePage() {
  const { idSucursal, idUsuario } = useUser();

  // Estados de datos
  const [pendientes, setPendientes] = useState<PacotePendiente[]>([]);
  
  // Estados para el detalle de paquete
  const [openDetalle, setOpenDetalle] = useState(false);
  const [detalleData, setDetalleData] = useState<DetallePacote[]>([]);
  const [, setLoadingDetalle] = useState(false);
  
  // Estados de carga
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [loadingEntregados] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Registro seleccionado
  const [selectedPacote, setSelectedPacote] = useState<PacotePendiente | null>(null);

  // Notificaciones / Feedback
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carga de pendientes
  const fetchPendientes = useCallback(async (sucursalId: number) => {
    setLoadingPendientes(true);
    try {
      const data = await pacoteService.getPacotesPendientes(sucursalId);
      console.log(data);
      setPendientes(data || []);
    } catch (error) {
      console.error('Error fetching pendientes:', error);
      showNotification('Error al cargar la lista de paquetes pendientes', 'error');
    } finally {
      setLoadingPendientes(false);
    }
  }, []);

  // Recarga global
  const handleRefresh = useCallback(async () => {
    if (!idSucursal) return;
    setRefreshing(true);
    setSelectedPacote(null); // Limpiar selección actual
    await Promise.all([
      fetchPendientes(idSucursal),
    ]);
    setRefreshing(false);
    showNotification('Listas actualizadas correctamente', 'info');
  }, [idSucursal, fetchPendientes]);

  // Ejecutar consultas iniciales
  useEffect(() => {
    if (idSucursal) {
      fetchPendientes(idSucursal);
    }
  }, [idSucursal, fetchPendientes]);

  // Mostrar snackbar helper
  const showNotification = (message: string, severity: 'success' | 'error' | 'info') => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const handleVerDetalle = async (idPreVenta: number) => {
    setLoadingDetalle(true);
    try {
      const data = await pacoteService.getDetallePacote(idPreVenta);
      setDetalleData(data || []);
      setOpenDetalle(true);
    } catch (error) {
      console.error('Error fetching details:', error);
      showNotification('Error al obtener el detalle del paquete', 'error');
    } finally {
      setLoadingDetalle(false);
    }
  };

  // Acción para entregar el paquete seleccionado
  const handleEntregarPacote = async () => {
    if (!selectedPacote || !idSucursal || !idUsuario) {
      showNotification('Operación inválida: Verifique su sesión e intente nuevamente', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await pacoteService.guardarEntregaPacote({
        idSucursal: idSucursal,
        idPreVenta: selectedPacote.idPreVenta,
        idUsuario: idUsuario
      });

      showNotification(`¡Entrega exitosa! Paquete Nro. PreVenta ${selectedPacote.idPreVenta} entregado.`, 'success');
      setSelectedPacote(null);

      // Recarga automática de ambas tablas
      await Promise.all([
        fetchPendientes(idSucursal),
      ]);
    } catch (error) {
      console.error('Error guardando entrega:', error);
      showNotification('Error al procesar la entrega en el servidor', 'error');
    } finally {
      setSubmitting(false);
    }
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
              <LocalShippingIcon sx={{ fontSize: 35, color: '#1976d2' }} />
              Gestión de Entregas (Pacotes)
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
                disabled={loadingPendientes || loadingEntregados || refreshing}
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

            <Button
              variant="contained"
              color="success"
              onClick={handleEntregarPacote}
              disabled={!selectedPacote || submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
              sx={{
                py: 1,
                px: 3,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: selectedPacote ? '0 4px 12px 0 rgba(46, 125, 50, 0.3)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px 0 rgba(46, 125, 50, 0.4)',
                }
              }}
            >
              Entregar Pacote
            </Button>
          </Box>
        </Box>

        {/* Sección de Selección Activa (Banner Informativo) */}
        <Zoom in={!!selectedPacote}>
          <Box sx={{ mb: 3 }}>
            {selectedPacote && (
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                action={
                  <Button 
                    color="primary" 
                    size="small" 
                    variant="contained"
                    onClick={handleEntregarPacote}
                    disabled={submitting}
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Confirmar Entrega
                  </Button>
                }
                sx={{ 
                  borderRadius: 3, 
                  boxShadow: '0 2px 10px rgba(25, 118, 210, 0.1)',
                  fontWeight: 500,
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f1f8ff 100%)',
                  border: '1px solid rgba(25, 118, 210, 0.15)'
                }}
              >
                Paquete seleccionado: PreVenta Nro. <strong>{selectedPacote.idPreVenta}</strong> para el cliente <strong>{selectedPacote.cliente || 'No especificado'}</strong> por un total de <strong>{formatCurrency(selectedPacote.totalVenta)}</strong>.
              </Alert>
            )}
          </Box>
        </Zoom>

        {/* Grid de Tablas */}
        <Grid container spacing={4}>
          {/* TABLA SUPERIOR: PENDIENTES */}
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
                    PAQUETES PENDIENTES DE ENTREGA
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Seleccione un paquete haciendo clic sobre la fila para habilitar la entrega.
                  </Typography>
                </Box>
                <Chip 
                  label={pendientes.length} 
                  color="warning" 
                  sx={{ fontWeight: 'bold', px: 1 }} 
                  size="medium"
                />
              </Box>

              <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
                {loadingPendientes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ ml: 2, color: 'text.secondary' }}>Cargando pendientes...</Typography>
                  </Box>
                ) : pendientes.length === 0 ? (
                  <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                    <LocalShippingIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      No hay paquetes pendientes de entrega
                    </Typography>
                    <Typography variant="body2">
                      Todas las pre-ventas han sido entregadas correctamente.
                    </Typography>
                  </Box>
                ) : (
                  <Table stickyHeader sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} width="60">Sel.</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="center">Nro</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Cliente</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Factura</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="center">Nro. PreVenta</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Fecha/Hora</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="right">Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Vendedor/a</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendientes.map((row) => {
                        const isSelected = selectedPacote?.idPreVenta === row.idPreVenta;
                        return (
                          <TableRow
                            key={row.idPreVenta}
                            hover
                            onClick={() => setSelectedPacote(isSelected ? null : row)}
                            sx={{
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.06)' : 'inherit',
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: isSelected 
                                  ? 'rgba(25, 118, 210, 0.09) !important' 
                                  : 'rgba(0, 0, 0, 0.02) !important'
                              }
                            }}
                          >
                            <TableCell>
                              <IconButton size="small" color={isSelected ? 'primary' : 'default'}>
                                {isSelected ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                              </IconButton>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>{row.Nro}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{row.cliente || '-'}</TableCell>
                            <TableCell>{row.factura || '-'}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={row.idPreVenta} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ fontWeight: 600, borderRadius: '6px' }} 
                              />
                            </TableCell>
                            <TableCell>{formatDate(row.fechaAlta)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                              {formatCurrency(row.totalVenta)}
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.vendedor || '-'}</TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerDetalle(row.idPreVenta);
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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

      {/* Modal de Detalle de Paquete */}
      <ModalDetPacote 
        open={openDetalle} 
        handleCloseModal={() => setOpenDetalle(false)} 
        detalle={detalleData} 
      />
    </Box>
  );
}
