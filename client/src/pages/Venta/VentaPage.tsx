import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Autocomplete,
  Tooltip,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useUser } from "../../hooks/useUser";
import { ventaService } from "../../services/ventaService";
import { ModalDetalleVenta } from "../../components/ModalDetalleVenta";
import type {
  GrupoCliente,
  Vendedor,
  Laboratorio,
  VentaResumen
} from "../../types/Venta/Venta.type";

export default function VentaPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { idUsuario } = useUser();

  // Estado de autorización
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Estados de Filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [gruposClientes, setGruposClientes] = useState<GrupoCliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);

  const [selectedGrupo, setSelectedGrupo] = useState<GrupoCliente | null>(null);
  const [selectedVendedor, setSelectedVendedor] = useState<Vendedor | null>(null);
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<Laboratorio | null>(null);

  const [allGrupos, setAllGrupos] = useState(true);
  const [allVendedores, setAllVendedores] = useState(true);
  const [allLaboratorios, setAllLaboratorios] = useState(true);

  // Estados de carga e información
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [ventas, setVentas] = useState<VentaResumen[]>([]);
  const [mensajeAlerta, setMensajeAlerta] = useState<string | null>(null);
  const [tipoAlerta, setTipoAlerta] = useState<"warning" | "error" | "success">("warning");

  // Estado del Modal de Detalle
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | null>(null);
  const [selectedSucursalNombre, setSelectedSucursalNombre] = useState("");

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (idUsuario) {
      ventaService.checkAdmin(idUsuario)
        .then((res) => {
          setIsAdmin(res.isAdmin);
        })
        .catch((err) => {
          console.error("Error al verificar administrador:", err);
          setIsAdmin(false);
        });
    } else {
      setIsAdmin(false);
    }
  }, [idUsuario]);

  // Cargar datos por defecto al iniciar
  useEffect(() => {
    // Definir fechas por defecto: desde hace 10 días hasta hoy
    const now = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(now.getDate() - 10);

    // Formatear a datetime-local (YYYY-MM-DDTHH:MM)
    const formatDateTimeLocal = (date: Date) => {
      const pad = (n: number) => (n < 10 ? "0" + n : n);
      return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        "T" +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes())
      );
    };

    setDesde(formatDateTimeLocal(tenDaysAgo));
    setHasta(formatDateTimeLocal(now));

    // Cargar filtros del backend
    const loadFiltrosData = async () => {
      try {
        const data = await ventaService.getFiltros();
        setGruposClientes(data.gruposClientes);
        setVendedores(data.vendedores);
        setLaboratorios(data.laboratorios);
      } catch (err) {
        console.error("Error al cargar filtros:", err);
        setMensajeAlerta("No se pudieron cargar los catálogos del servidor.");
        setTipoAlerta("error");
      } finally {
        setLoadingFiltros(false);
      }
    };

    loadFiltrosData();
  }, []);

  // Formateador de números (Guaraníes)
  const formatGs = (val: number) => {
    return Math.round(val || 0).toLocaleString("es-PY");
  };

  // Manejo de la consulta de ventas
  const handleConsultar = async () => {
    if (!idUsuario) {
      setMensajeAlerta("Sesión de usuario no válida.");
      setTipoAlerta("error");
      return;
    }

    setLoadingConsulta(true);
    setMensajeAlerta(null);
    setVentas([]);

    try {
      const data = await ventaService.consultaVentas({
        idUsuario,
        idGrupoCliente: allGrupos ? 0 : (selectedGrupo?.idGrupoCliente || 0),
        idVendedor: allVendedores ? 0 : (selectedVendedor?.idVendedor || 0),
        idLaboratorio: allLaboratorios ? 0 : (selectedLaboratorio?.idLaboratorio || 0),
        desde: new Date(desde).toISOString(),
        hasta: new Date(hasta).toISOString()
      });

      if (data.length === 0) {
        setMensajeAlerta("No existen datos para esta consulta...!");
        setTipoAlerta("warning");
      } else {
        setVentas(data);
      }
    } catch (err) {
      console.error("Error al consultar ventas:", err);
      setMensajeAlerta("Error al consultar las ventas en el servidor.");
      setTipoAlerta("error");
    } finally {
      setLoadingConsulta(false);
    }
  };

  // Manejar el clic en una sucursal para ver su detalle
  const handleVerDetalle = (idSuc: number, nombreSuc: string) => {
    setSelectedSucursalId(idSuc);
    setSelectedSucursalNombre(nombreSuc);
    setModalOpen(true);
  };

  // Sumas de Totales para el Pie de Página
  const totalCantidad = ventas.reduce((sum, v) => sum + (v.cantidad || 0), 0);
  const totalEfectivo = ventas.reduce((sum, v) => sum + (v.efectivo || 0), 0);
  const totalCredito = ventas.reduce((sum, v) => sum + (v.credito || 0), 0);
  const totalTarjeta = ventas.reduce((sum, v) => sum + (v.tarjeta || 0), 0);
  const totalDebito = ventas.reduce((sum, v) => sum + (v.debito || 0), 0);
  const totalCheque = ventas.reduce((sum, v) => sum + (v.cheque || 0), 0);
  const totalTransferencia = ventas.reduce((sum, v) => sum + (v.transferencia || 0), 0);
  const totalDelivery = ventas.reduce((sum, v) => sum + (v.delivery || 0), 0);
  const totalGeneral = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalCostos = ventas.reduce((sum, v) => sum + (v.costos || 0), 0);
  const totalAnulados = ventas.reduce((sum, v) => sum + (v.anulados || 0), 0);
  const totalCobranzas = ventas.reduce((sum, v) => sum + (v.cobranzas || 0), 0);
  const totalDevoluciones = ventas.reduce((sum, v) => sum + (v.devoluciones || 0), 0);

  if (isAdmin === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f1f5f9" }}>
        <CircularProgress color="success" size={50} />
      </Box>
    );
  }

  if (isAdmin === false) {
    return (
      <Box sx={{ p: 4, minHeight: "100vh", backgroundColor: "#f1f5f9", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Card sx={{ maxWidth: 500, p: 3, textAlign: "center", borderRadius: 3, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
          <CardContent>
            <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 800 }}>
              Acceso Denegado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              Lo sentimos, no dispones de los permisos necesarios para acceder al Reporte de Ventas. Este módulo está restringido exclusivamente para administradores.
            </Typography>
            <Button variant="contained" color="success" href="/" sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}>
              Ir al Inicio
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", backgroundColor: "#f1f5f9", pt: 8 }}>
      {/* Page Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <AssessmentIcon sx={{ fontSize: 32, color: "#1e3a8a" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", letterSpacing: "-0.025em" }}>
            Reporte de Ventas por Sucursal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consolidado general de ventas y desgloses de formas de pago
          </Typography>
        </Box>
      </Box>

      {/* Alert message */}
      {mensajeAlerta && (
        <Alert severity={tipoAlerta} onClose={() => setMensajeAlerta(null)} sx={{ mb: 3, borderRadius: 2, fontWeight: 500 }}>
          {mensajeAlerta}
        </Alert>
      )}

      {/* Header Filters Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          background: "linear-gradient(135deg, #1e293b 0%, #2a4365 100%)", // Gradiente de azul pizarra premium
          color: "#ffffff",
          boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.15), 0 4px 6px -4px rgba(15, 23, 42, 0.15)",
          mb: 4,
          overflow: "hidden"
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          {loadingFiltros ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4, gap: 2 }}>
              <CircularProgress color="inherit" size={24} />
              <Typography variant="body2">Cargando filtros de base de datos...</Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5} sx={{ alignItems: "center" }}>
              {/* Fechas */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Desde"
                  type="datetime-local"
                  fullWidth
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={{
                    "& .MuiInputBase-input": { color: "#ffffff" },
                    "& .MuiInputLabel-root": { color: "#cbd5e1" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                      "&:hover fieldset": { borderColor: "#ffffff" },
                      "&.Mui-focused fieldset": { borderColor: "#60a5fa" }
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Hasta"
                  type="datetime-local"
                  fullWidth
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={{
                    "& .MuiInputBase-input": { color: "#ffffff" },
                    "& .MuiInputLabel-root": { color: "#cbd5e1" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "rgba(255,255,255,0.4)" },
                      "&:hover fieldset": { borderColor: "#ffffff" },
                      "&.Mui-focused fieldset": { borderColor: "#60a5fa" }
                    }
                  }}
                />
              </Grid>

              {/* Grupo Cliente */}
              <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                <Autocomplete
                  disabled={allGrupos}
                  options={gruposClientes}
                  getOptionLabel={(option) => option.nombreGrupoCliente}
                  value={selectedGrupo}
                  onChange={(_, val) => setSelectedGrupo(val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Grupo Cliente"
                      placeholder="Seleccionar..."
                      sx={{
                        "& .MuiInputBase-input": { color: "#ffffff" },
                        "& .MuiInputLabel-root": { color: allGrupos ? "rgba(255,255,255,0.4)" : "#cbd5e1" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: allGrupos ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)" },
                          "&:hover fieldset": { borderColor: "#ffffff" },
                          "&.Mui-focused fieldset": { borderColor: "#60a5fa" }
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allGrupos}
                      onChange={(e) => {
                        setAllGrupos(e.target.checked);
                        if (e.target.checked) setSelectedGrupo(null);
                      }}
                      sx={{ color: "#ffffff", "&.Mui-checked": { color: "#ffffff" } }}
                    />
                  }
                  label="Todos los grupos"
                  sx={{ color: "#ffffff", "& .MuiFormControlLabel-label": { fontSize: "0.85rem", fontWeight: 600 } }}
                />
              </Grid>

              {/* Vendedor */}
              <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                <Autocomplete
                  disabled={allVendedores}
                  options={vendedores}
                  getOptionLabel={(option) => option.nombreVendedor}
                  value={selectedVendedor}
                  onChange={(_, val) => setSelectedVendedor(val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Vendedor/a"
                      placeholder="Buscar vendedor..."
                      sx={{
                        "& .MuiInputBase-input": { color: "#ffffff" },
                        "& .MuiInputLabel-root": { color: allVendedores ? "rgba(255,255,255,0.4)" : "#cbd5e1" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: allVendedores ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)" },
                          "&:hover fieldset": { borderColor: "#ffffff" },
                          "&.Mui-focused fieldset": { borderColor: "#60a5fa" }
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allVendedores}
                      onChange={(e) => {
                        setAllVendedores(e.target.checked);
                        if (e.target.checked) setSelectedVendedor(null);
                      }}
                      sx={{ color: "#ffffff", "&.Mui-checked": { color: "#ffffff" } }}
                    />
                  }
                  label="Todos los vendedores"
                  sx={{ color: "#ffffff", "& .MuiFormControlLabel-label": { fontSize: "0.85rem", fontWeight: 600 } }}
                />
              </Grid>

              {/* Laboratorio */}
              <Grid size={{ xs: 12, sm: 8, md: 4 }}>
                <Autocomplete
                  disabled={allLaboratorios}
                  options={laboratorios}
                  getOptionLabel={(option) => option.nombreLaboratorio}
                  value={selectedLaboratorio}
                  onChange={(_, val) => setSelectedLaboratorio(val)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Laboratorio"
                      placeholder="Buscar laboratorio..."
                      sx={{
                        "& .MuiInputBase-input": { color: "#ffffff" },
                        "& .MuiInputLabel-root": { color: allLaboratorios ? "rgba(255,255,255,0.4)" : "#cbd5e1" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#60a5fa" },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: allLaboratorios ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)" },
                          "&:hover fieldset": { borderColor: "#ffffff" },
                          "&.Mui-focused fieldset": { borderColor: "#60a5fa" }
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allLaboratorios}
                      onChange={(e) => {
                        setAllLaboratorios(e.target.checked);
                        if (e.target.checked) setSelectedLaboratorio(null);
                      }}
                      sx={{ color: "#ffffff", "&.Mui-checked": { color: "#ffffff" } }}
                    />
                  }
                  label="Todos los laboratorios"
                  sx={{ color: "#ffffff", "& .MuiFormControlLabel-label": { fontSize: "0.85rem", fontWeight: 600 } }}
                />
              </Grid>

              {/* Botón Consultar */}
              <Grid size={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  variant="contained"
                  disabled={loadingConsulta}
                  onClick={handleConsultar}
                  startIcon={loadingConsulta ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    backgroundColor: "#ffffff",
                    color: "#2a4365",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      color: "#1e3a8a",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.15)"
                    }
                  }}
                >
                  {loadingConsulta ? "Consultando..." : "Consultar"}
                </Button>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Main Results Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          overflowX: "auto",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          mb: 4
        }}
      >
        <Table sx={{ minWidth: 1800, "& .MuiTableCell-root": { whiteSpace: "nowrap" } }} size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              {[
                "Sucursal",
                "Cant.",
                "Efectivo",
                "Crédito",
                "Tarjeta",
                "Débito",
                "Cheque",
                "Transf.",
                "Delivery",
                "TOTAL",
                "Costos",
                "Anulados",
                "Cobranzas",
                "Devoluciones",
                "Acción"
              ].map((head, idx) => (
                <TableCell
                  key={idx}
                  align={idx > 0 && idx < 14 ? "right" : idx === 14 ? "center" : "left"}
                  sx={{
                    backgroundColor: "#0f172a", // Dark navy header
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    py: 2,
                    borderBottom: "none"
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingConsulta ? (
              <TableRow>
                <TableCell colSpan={15} align="center" sx={{ py: 10 }}>
                  <CircularProgress color="success" size={40} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                    Generando y cargando reporte...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : ventas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} align="center" sx={{ py: 8, color: "text.secondary" }}>
                  Ingresa los filtros y presiona "Consultar" para ver los resultados.
                </TableCell>
              </TableRow>
            ) : (
              ventas.map((row) => (
                <TableRow
                  key={row.idSucursal}
                  hover
                  onDoubleClick={() => handleVerDetalle(row.idSucursal, row.sucursal)}
                  sx={{
                    cursor: "pointer",
                    "&:nth-of-type(even)": { backgroundColor: "#f8fafc" },
                    "& td": { py: 1.5 }
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>{row.sucursal}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{row.cantidad}</TableCell>
                  <TableCell align="right">{formatGs(row.efectivo)}</TableCell>
                  <TableCell align="right">{formatGs(row.credito)}</TableCell>
                  <TableCell align="right">{formatGs(row.tarjeta)}</TableCell>
                  <TableCell align="right">{formatGs(row.debito)}</TableCell>
                  <TableCell align="right">{formatGs(row.cheque)}</TableCell>
                  <TableCell align="right">{formatGs(row.transferencia)}</TableCell>
                  <TableCell align="right">{formatGs(row.delivery)}</TableCell>
                  {/* Total Venta */}
                  <TableCell align="right" sx={{ fontWeight: 800, backgroundColor: "#fef9c3", color: "#854d0e" }}>
                    {formatGs(row.total)}
                  </TableCell>
                  <TableCell align="right">{formatGs(row.costos)}</TableCell>
                  {/* Anulados */}
                  <TableCell align="right" sx={{ backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>
                    {formatGs(row.anulados)}
                  </TableCell>
                  {/* Cobranzas */}
                  <TableCell align="right" sx={{ backgroundColor: "#dcfce7", color: "#166534", fontWeight: 600 }}>
                    {formatGs(row.cobranzas)}
                  </TableCell>
                  {/* Devoluciones */}
                  <TableCell align="right" sx={{ backgroundColor: "#f3e8ff", color: "#6b21a8", fontWeight: 600 }}>
                    {formatGs(row.devoluciones)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle de ventas">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar doble ejecución
                          handleVerDetalle(row.idSucursal, row.sucursal);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          {/* Footer Totales */}
          {ventas.length > 0 && !loadingConsulta && (
            <TableHead>
              <TableRow sx={{ "& td": { py: 2, fontWeight: 800, fontSize: "0.8rem", borderBottom: "none" } }}>
                <TableCell sx={{ backgroundColor: "#e2e8f0", color: "#1e293b" }}>Totales:</TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {totalCantidad}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {formatGs(totalEfectivo)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {formatGs(totalCredito)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {formatGs(totalTarjeta)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {formatGs(totalDebito)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {formatGs(totalCheque)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {formatGs(totalTransferencia)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {formatGs(totalDelivery)}
                </TableCell>
                {/* Total de Totales */}
                <TableCell align="right" sx={{ backgroundColor: "#fef08a", color: "#713f12" }}>
                  {formatGs(totalGeneral)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#cbd5e1", color: "#0f172a" }}>
                  {formatGs(totalCostos)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#fca5a5", color: "#7f1d1d" }}>
                  {formatGs(totalAnulados)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#86efac", color: "#064e3b" }}>
                  {formatGs(totalCobranzas)}
                </TableCell>
                <TableCell align="right" sx={{ backgroundColor: "#d8b4fe", color: "#581c87" }}>
                  {formatGs(totalDevoluciones)}
                </TableCell>
                <TableCell sx={{ backgroundColor: "#cbd5e1" }} />
              </TableRow>
            </TableHead>
          )}
        </Table>
      </TableContainer>

      {/* Floating Instructions Banner */}
      {ventas.length > 0 && (
        <Typography variant="caption" sx={{ color: "#64748b", display: "block", textAlign: "center", mt: -2, mb: 4 }}>
          💡 Tip: Haz doble clic sobre una fila de la sucursal o haz clic en el ícono del ojo para ver el desglose en el modal emergente.
        </Typography>
      )}

      {/* Modal Detalle */}
      <ModalDetalleVenta
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        desde={desde}
        hasta={hasta}
        idSucursal={selectedSucursalId}
        sucursalNombre={selectedSucursalNombre}
      />
    </Box>
  );
}
