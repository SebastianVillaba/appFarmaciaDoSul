import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ventaService } from "../services/ventaService";
import type { VentaDetalle } from "../types/Venta/Venta.type";

interface ModalDetalleVentaProps {
  open: boolean;
  handleClose: () => void;
  desde: string; // ISO date-time
  hasta: string; // ISO date-time
  idSucursal: number | null;
  sucursalNombre: string;
}

export const ModalDetalleVenta = ({
  open,
  handleClose,
  desde,
  hasta,
  idSucursal,
  sucursalNombre
}: ModalDetalleVentaProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState<VentaDetalle[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Formateadores locales
  const formatGs = (val: number) => {
    return Math.round(val).toLocaleString("es-PY");
  };

  const formatForeign = (val: number) => {
    return val.toLocaleString("es-PY", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("es-PY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    if (open && idSucursal !== null) {
      const fetchDetalle = async () => {
        setLoading(true);
        setError(null);
        try {
          // El SP espera fecha sin hora o fecha ISO (YYYY-MM-DD)
          // Cortamos la fecha para pasar solo la parte de fecha (YYYY-MM-DD)
          const desdeFechaSolo = desde.split("T")[0];
          const hastaFechaSolo = hasta.split("T")[0];

          const res = await ventaService.getDetalleVenta(desdeFechaSolo, hastaFechaSolo, idSucursal);
          setDetalle(res);
        } catch (err) {
          console.error("Error al obtener detalle de ventas:", err);
          setError("No se pudo cargar el detalle de ventas.");
        } finally {
          setLoading(false);
        }
      };

      fetchDetalle();
    }
  }, [open, idSucursal, desde, hasta]);

  // Calcular Totales
  const totalGS = detalle.reduce((sum, item) => sum + (item.GS || 0), 0);
  const totalReal = detalle.reduce((sum, item) => sum + (item.real || 0), 0);
  const totalDolar = detalle.reduce((sum, item) => sum + (item.dolar || 0), 0);
  const totalPix = detalle.reduce((sum, item) => sum + (item.Pix || 0), 0);
  const totalCosto = detalle.reduce((sum, item) => sum + (item.totalCosto || 0), 0);
  const totalVenta = detalle.reduce((sum, item) => sum + (item.total || 0), 0);

  // Calcular margen ponderado
  const totalMargen = totalVenta > 0 ? ((totalVenta - totalCosto) / totalVenta) * 100 : 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth="xl"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : 3,
            backgroundColor: "#f8fafc",
            backgroundImage: "none",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1e293b",
          color: "#ffffff",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.025em" }}>
            Detalle de Ventas de Sucursal
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
            Visualización detallada de transacciones
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#cbd5e1", "&:hover": { color: "#ffffff" } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Info Cards / Metadata */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            mt: 1,
            p: 2,
            backgroundColor: "#ffffff",
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <Box sx={{ flex: "1 1 200px" }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 600, textTransform: "uppercase" }}>
              Sucursal
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#0f172a" }}>
              {sucursalNombre}
            </Typography>
          </Box>
          <Box sx={{ flex: "1 1 150px" }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 600, textTransform: "uppercase" }}>
              Desde
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#334155" }}>
              {formatDateString(desde)}
            </Typography>
          </Box>
          <Box sx={{ flex: "1 1 150px" }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 600, textTransform: "uppercase" }}>
              Hasta
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "#334155" }}>
              {formatDateString(hasta)}
            </Typography>
          </Box>
        </Box>

        {/* Loading and Error States */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
            <CircularProgress color="success" size={50} />
            <Typography variant="body2" color="text.secondary">
              Cargando detalle de ventas...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 4, textAlign: "center", backgroundColor: "#fef2f2", borderRadius: 2, border: "1px solid #fee2e2" }}>
            <Typography color="error" sx={{ fontWeight: 600 }}>
              {error}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Table Container */}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                maxHeight: "55vh",
                overflowY: "auto",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {[
                      "Nro.",
                      "Id Venta",
                      "Factura",
                      "Fecha",
                      "Cliente",
                      "Vendedor",
                      "Tipo Venta",
                      "Guaraníes (GS)",
                      "Reales",
                      "Dólar",
                      "PIX",
                      "Total Costo",
                      "Total",
                      "% Margen"
                    ].map((head, idx) => (
                      <TableCell
                        key={idx}
                        align={idx >= 7 ? "right" : "left"}
                        sx={{
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          fontWeight: 700,
                          py: 1.5,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          borderBottom: "2px solid #cbd5e1"
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalle.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} align="center" sx={{ py: 6, color: "text.secondary" }}>
                        No se encontraron detalles de ventas para los filtros seleccionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detalle.map((row) => (
                      <TableRow
                        key={row.idVenta || row.Nro}
                        hover
                        sx={{
                          "&:nth-of-type(even)": { backgroundColor: "#f8fafc" },
                          "& td": { fontSize: "0.8rem", py: 1 }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: "#64748b" }}>{row.Nro}</TableCell>
                        <TableCell>{row.idVenta}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontFamily: "monospace" }}>{row.factura}</TableCell>
                        <TableCell>{formatDateString(row.fecha)}</TableCell>
                        <TableCell sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.cliente}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.vendedor}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: "4px",
                              fontWeight: 700,
                              backgroundColor: row.tipo === 1 ? "#dbeafe" : "#fef3c7",
                              color: row.tipo === 1 ? "#1e40af" : "#92400e"
                            }}
                          >
                            {row.nombreTipo}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatGs(row.GS)}</TableCell>
                        <TableCell align="right">{formatForeign(row.real)}</TableCell>
                        <TableCell align="right">{formatForeign(row.dolar)}</TableCell>
                        <TableCell align="right">{formatForeign(row.Pix)}</TableCell>
                        <TableCell align="right" sx={{ color: "#dc2626" }}>{formatGs(row.totalCosto)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#16a34a" }}>{formatGs(row.total)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            color: row.porceMargen >= 30 ? "#16a34a" : row.porceMargen >= 15 ? "#d97706" : "#dc2626"
                          }}
                        >
                          {formatForeign(row.porceMargen)}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals Section */}
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1.5, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
              Resumen de Totales
            </Typography>

            <Grid container spacing={2}>
              {/* Guaranies */}
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.7 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#e6fcf5",
                    border: "1px solid #c3fae8",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#0ca678", fontWeight: 700, display: "block" }}>
                    GUARANÍES
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#099268", mt: 0.5 }}>
                    {formatGs(totalGS)}
                  </Typography>
                </Box>
              </Grid>

              {/* Real */}
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.7 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#e7f5ff",
                    border: "1px solid #d0ebff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#228be6", fontWeight: 700, display: "block" }}>
                    REAL
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#1c7ed6", mt: 0.5 }}>
                    {formatForeign(totalReal)}
                  </Typography>
                </Box>
              </Grid>

              {/* Dolar */}
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.7 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#fff0f6",
                    border: "1px solid #ffdeeb",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#e64980", fontWeight: 700, display: "block" }}>
                    DÓLAR
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#c2255c", mt: 0.5 }}>
                    {formatForeign(totalDolar)}
                  </Typography>
                </Box>
              </Grid>

              {/* PIX */}
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.7 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#fff4e6",
                    border: "1px solid #ffe8cc",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#fd7e14", fontWeight: 700, display: "block" }}>
                    PIX
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#e8590c", mt: 0.5 }}>
                    {formatForeign(totalPix)}
                  </Typography>
                </Box>
              </Grid>

              {/* Costo */}
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.7 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#fff5f5",
                    border: "1px solid #ffe3e3",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#fa5252", fontWeight: 700, display: "block" }}>
                    COSTO TOTAL
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#c92a2a", mt: 0.5 }}>
                    {formatGs(totalCosto)}
                  </Typography>
                </Box>
              </Grid>

              {/* Total */}
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.8 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#e3fafc",
                    border: "1px solid #c5f6fa",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#15aabf", fontWeight: 700, display: "block" }}>
                    VENTA TOTAL
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#0c8599", mt: 0.5 }}>
                    {formatGs(totalVenta)}
                  </Typography>
                </Box>
              </Grid>

              {/* Margen */}
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 1.7 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: "#fef9c3",
                    border: "1px solid #fef08a",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#a16207", fontWeight: 700, display: "block" }}>
                    % MARGEN
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#854d0e", mt: 0.5 }}>
                    {formatForeign(totalMargen)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
