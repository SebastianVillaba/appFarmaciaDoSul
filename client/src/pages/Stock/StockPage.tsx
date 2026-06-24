import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
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
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import { useUser } from '../../hooks/useUser';
import { consultaStockService, type ProductoStock } from '../../services/consultaStockService';

export default function StockPage() {
  const { idSucursal } = useUser();

  // Estados de búsqueda y datos
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState<ProductoStock[]>([]);
  
  // Estado de carga
  const [loading, setLoading] = useState(false);

  // Registro del último término buscado para evitar llamadas duplicadas
  const lastSearchedTerm = useRef<string>('');

  // Notificaciones / Feedback
  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Mostrar snackbar helper
  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setAlertConfig({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

  // Función principal de búsqueda
  const performSearch = useCallback(async (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) {
      setProductos([]);
      lastSearchedTerm.current = '';
      return;
    }

    if (cleanTerm === lastSearchedTerm.current) {
      return; // Evita buscar lo mismo de forma consecutiva
    }

    if (!idSucursal) {
      showNotification('No se ha detectado una sucursal activa. Intente recargar la página.', 'error');
      return;
    }

    setLoading(true);
    try {
      lastSearchedTerm.current = cleanTerm;
      let data: ProductoStock[] = [];
      let searchType = '';

      // Reglas de decisión de endpoint
      if (/^\d{6}$/.test(cleanTerm)) {
        searchType = 'Código';
        data = await consultaStockService.buscarPorCodigo(cleanTerm, idSucursal);
      } else if (/^\d+$/.test(cleanTerm)) {
        searchType = 'Código de Barras';
        data = await consultaStockService.buscarPorCodigoBarra(cleanTerm, idSucursal);
      } else {
        searchType = 'Nombre';
        data = await consultaStockService.buscarPorNombre(cleanTerm, idSucursal);
      }

      setProductos(data || []);
      
      if (data.length > 0) {
        showNotification(`Búsqueda por ${searchType} exitosa. Se encontraron ${data.length} productos.`, 'success');
      } else {
        showNotification(`No se encontraron productos para la búsqueda por ${searchType}.`, 'info');
      }
    } catch (error: any) {
      console.error('Error al consultar stock:', error);
      const errorMsg = error.response?.data?.message || 'Error al conectar con el servidor para consultar stock';
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [idSucursal]);

  // Búsqueda en tiempo real con Debounce de 500ms
  useEffect(() => {
    const cleanTerm = searchTerm.trim();
    if (!cleanTerm) {
      setProductos([]);
      lastSearchedTerm.current = '';
      return;
    }

    const timer = setTimeout(() => {
      performSearch(cleanTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, performSearch]);

  const handleSearchClick = () => {
    performSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      performSearch(searchTerm);
    }
  };

  // Formateador de moneda en Guaraníes (PYG)
  const formatCurrency = (val: number) => {
    if (val === undefined || val === null) return '₲ 0';
    return `${Number(val).toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}`;
  };

  // Pantalla de carga inicial si idSucursal no está disponible
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
              <InventoryIcon sx={{ fontSize: 35, color: '#1976d2' }} />
              Consulta de Stock
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
              Sucursal Activa ID: <Chip label={idSucursal} size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
            </Typography>
          </Box>
        </Box>

        {/* Sección Superior: Filtro y Búsqueda */}
        <Card 
          elevation={2} 
          sx={{ 
            p: 3, 
            borderRadius: 4, 
            border: '1px solid rgba(25, 118, 210, 0.08)',
            mb: 4,
            backgroundColor: '#ffffff'
          }}
        >
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 9 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Busque por Código (6 dígitos), Código de Barras o Nombre de Producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: 'rgba(25, 118, 210, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSearchClick}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px 0 rgba(25, 118, 210, 0.15)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px 0 rgba(25, 118, 210, 0.25)',
                  }
                }}
              >
                Buscar Producto
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Sección Inferior: Tabla de Resultados */}
        <Grid container spacing={4}>
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
                    PRODUCTOS ENCONTRADOS
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Listado de productos con stock disponible y precio actual en la sucursal activa.
                  </Typography>
                </Box>
                <Chip 
                  label={productos.length} 
                  color="primary" 
                  sx={{ fontWeight: 'bold', px: 1 }} 
                  size="medium"
                />
              </Box>

              <TableContainer sx={{ maxHeight: 500 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ ml: 2, color: 'text.secondary' }}>Consultando stock...</Typography>
                  </Box>
                ) : searchTerm.trim() === '' ? (
                  <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                    <InventoryIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5, opacity: 0.6 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Realice una búsqueda para ver el stock
                    </Typography>
                    <Typography variant="body2">
                      Ingrese un código, código de barras o descripción del producto para comenzar.
                    </Typography>
                  </Box>
                ) : productos.length === 0 ? (
                  <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                    <SearchOffIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5, opacity: 0.6 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      No se encontraron resultados
                    </Typography>
                    <Typography variant="body2">
                      No se hallaron coincidencias para "{searchTerm}" en esta sucursal.
                    </Typography>
                  </Box>
                ) : (
                  <Table stickyHeader sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} width="120">Código</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Producto</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>Presentación</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="right" width="160">Precio</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }} align="center" width="140">Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productos.map((row) => (
                        <TableRow 
                          key={row.idProducto} 
                          hover
                          sx={{ transition: 'background-color 0.2s' }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            {row.codigo}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, color: '#1a365d' }}>
                            {row.nombreProducto}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>
                            {row.presentacion || '-'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                            {formatCurrency(row.precio)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={row.stock} 
                              color={row.stock > 10 ? 'success' : row.stock > 0 ? 'warning' : 'error'}
                              variant={row.stock > 0 ? 'filled' : 'outlined'}
                              sx={{ 
                                fontWeight: 'bold', 
                                minWidth: 65,
                                borderRadius: '6px',
                                textTransform: 'none',
                                boxShadow: row.stock > 0 ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                              }} 
                            />
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

      {/* Snackbar de Feedback / Notificaciones */}
      <Snackbar
        open={alertConfig.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertConfig.severity} 
          variant="filled"
          sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', fontWeight: 500 }}
        >
          {alertConfig.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
