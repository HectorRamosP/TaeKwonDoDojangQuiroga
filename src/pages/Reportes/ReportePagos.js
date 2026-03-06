/** @module pages/Reportes/ReportePagos */
import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  AttachMoney,
  TrendingUp,
  PendingActions,
  Cancel,
  CheckCircle,
  Download,
} from "@mui/icons-material";
import { generarReportePagos } from "../../services/reportesService";
import Swal from "sweetalert2";

/**
 * Subcomponente del módulo de Reportes. Genera y muestra estadísticas de pagos
 * con filtros por fecha, estado y método de pago. Permite exportar a CSV.
 * @component
 * @returns {JSX.Element} Reporte detallado de pagos con tarjetas resumen, gráficos y tabla.
 */
export default function ReportePagos() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    estado: "",
    metodoPago: "",
  });

  const cargarReporte = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await generarReportePagos(filtros);
      setReporte(data);
    } catch (err) {
      setError("Error al generar el reporte de pagos");
      Swal.fire("Error", "No se pudo generar el reporte", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const handleFiltroChange = (campo, valor) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(monto);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-MX");
  };

  const getEstadoChip = (estado) => {
    const colores = {
      Confirmado: "success",
      Pendiente: "warning",
      Rechazado: "error",
    };
    return <Chip label={estado} color={colores[estado] || "default"} size="small" />;
  };

  const exportarCSV = () => {
    if (!reporte || !reporte.pagos.length) return;

    const headers = ["ID", "Alumno", "Concepto", "Monto", "Fecha", "Metodo Pago", "Estado"];
    const rows = reporte.pagos.map(p => [
      p.id,
      p.alumnoNombre,
      p.conceptoNombre,
      p.monto,
      formatearFecha(p.fecha),
      p.metodoPago,
      p.estado,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    // UTF-8 BOM para que Excel reconozca correctamente los caracteres especiales
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_pagos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (cargando) {
    return (
      <Box className="reporte-loading">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Filtros */}
      <Box className="reporte-filtros">
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Fecha Inicio"
              type="date"
              fullWidth
              size="small"
              value={filtros.fechaInicio}
              onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Fecha Fin"
              type="date"
              fullWidth
              size="small"
              value={filtros.fechaFin}
              onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>Estado</InputLabel>
              <Select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange("estado", e.target.value)}
                label="Estado"
                displayEmpty
                notched
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Confirmado">Confirmado</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Rechazado">Rechazado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>Método</InputLabel>
              <Select
                value={filtros.metodoPago}
                onChange={(e) => handleFiltroChange("metodoPago", e.target.value)}
                label="Método"
                displayEmpty
                notched
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Efectivo">Efectivo</MenuItem>
                <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                <MenuItem value="Transferencia">Transferencia</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={cargarReporte}
              sx={{
                height: "40px",
                background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                boxShadow: "0 4px 12px rgba(220, 20, 60, 0.3)",
                fontWeight: 700,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%)",
                  boxShadow: "0 6px 20px rgba(220, 20, 60, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Generar Reporte
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Acciones */}
      <Box className="reporte-acciones">
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportarCSV}
          sx={{
            background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
            boxShadow: "0 4px 12px rgba(220, 20, 60, 0.3)",
            fontWeight: 700,
            padding: "10px 24px",
            borderRadius: "12px",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%)",
              boxShadow: "0 6px 20px rgba(220, 20, 60, 0.4)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Exportar a Excel
        </Button>
      </Box>

      {reporte && (
        <>
          {/* Tarjetas de Resumen */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className="reporte-stats-card">
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Total Pagos
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalPagos}</Typography>
                    </Box>
                    <AttachMoney sx={{ fontSize: 40, color: "#DC143C" }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="reporte-stats-card">
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Monto Total
                      </Typography>
                      <Typography variant="h5">
                        {formatearMoneda(reporte.resumen.montoTotal)}
                      </Typography>
                    </Box>
                    <TrendingUp color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="reporte-stats-card">
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Confirmado
                      </Typography>
                      <Typography variant="h5">
                        {formatearMoneda(reporte.resumen.montoConfirmado)}
                      </Typography>
                    </Box>
                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="reporte-stats-card">
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Pendiente
                      </Typography>
                      <Typography variant="h5">
                        {formatearMoneda(reporte.resumen.montoPendiente)}
                      </Typography>
                    </Box>
                    <PendingActions color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos de Distribución */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Por Método de Pago
                  </Typography>
                  {reporte.pagosPorMetodoPago.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{item.metodoPago}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatearMoneda(item.montoTotal)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            flex: 1,
                            height: 8,
                            bgcolor: "#e0e0e0",
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${item.porcentaje}%`,
                              height: "100%",
                              background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                        <Typography variant="caption">{item.porcentaje.toFixed(1)}%</Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Por Estado
                  </Typography>
                  {reporte.pagosPorEstado.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{item.estado}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatearMoneda(item.montoTotal)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            flex: 1,
                            height: 8,
                            bgcolor: "#e0e0e0",
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${item.porcentaje}%`,
                              height: "100%",
                              background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                        <Typography variant="caption">{item.porcentaje.toFixed(1)}%</Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Por Concepto (Top 5)
                  </Typography>
                  {reporte.pagosPorConcepto.slice(0, 5).map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: "60%" }}>
                          {item.concepto}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatearMoneda(item.montoTotal)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            flex: 1,
                            height: 8,
                            bgcolor: "#e0e0e0",
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${item.porcentaje}%`,
                              height: "100%",
                              background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                        <Typography variant="caption">{item.porcentaje.toFixed(1)}%</Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de Pagos */}
          <TableContainer
            component={Paper}
            className="reporte-tabla"
            elevation={0}
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(220, 20, 60, 0.1)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{
                  background: "linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, #DC143C 0%, #B22222 50%, #8B0000 100%)",
                  }
                }}>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>ID</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Alumno</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Concepto</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Monto</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Fecha</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Método</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reporte.pagos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography className="reporte-sin-datos">
                        No hay datos para mostrar
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reporte.pagos.map((pago) => (
                    <TableRow
                      key={pago.id}
                      hover
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(220, 20, 60, 0.04)",
                          transform: "scale(1.001)",
                        }
                      }}
                    >
                      <TableCell>{pago.id}</TableCell>
                      <TableCell>{pago.alumnoNombre}</TableCell>
                      <TableCell>{pago.conceptoNombre}</TableCell>
                      <TableCell align="right">{formatearMoneda(pago.monto)}</TableCell>
                      <TableCell>{formatearFecha(pago.fecha)}</TableCell>
                      <TableCell>{pago.metodoPago}</TableCell>
                      <TableCell>{getEstadoChip(pago.estado)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
