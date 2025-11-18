import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
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
  Chip,
} from "@mui/material";
import {
  Category,
  TrendingUp,
  AttachMoney,
  Inventory,
  Download,
} from "@mui/icons-material";
import { generarReporteConceptos } from "../../services/reportesService";
import Swal from "sweetalert2";

export default function ReporteConceptos() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarReporte = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await generarReporteConceptos();
      setReporte(data);
    } catch (err) {
      setError("Error al generar el reporte de conceptos");
      Swal.fire("Error", "No se pudo generar el reporte", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(monto);
  };

  const exportarCSV = () => {
    if (!reporte || !reporte.conceptos.length) return;

    const headers = ["ID", "Nombre", "Costo", "Tipo", "Veces Vendido", "Ingreso Total", "Activo"];
    const rows = reporte.conceptos.map(c => [
      c.id,
      c.nombre,
      c.costo,
      c.tipo,
      c.vecesVendido,
      c.ingresoTotal,
      c.activo ? "Si" : "No",
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
    link.download = `reporte_conceptos_${new Date().toISOString().split("T")[0]}.csv`;
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
      {/* Acciones */}
      <Box className="reporte-acciones">
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportarCSV}
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
                        Total Conceptos
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalConceptos}</Typography>
                    </Box>
                    <Category color="primary" sx={{ fontSize: 40 }} />
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
                        Total Ventas
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalVentas}</Typography>
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
                        Ingreso Total
                      </Typography>
                      <Typography variant="h5">
                        {formatearMoneda(reporte.resumen.ingresoTotal)}
                      </Typography>
                    </Box>
                    <AttachMoney color="success" sx={{ fontSize: 40 }} />
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
                        Costo Promedio
                      </Typography>
                      <Typography variant="h5">
                        {formatearMoneda(reporte.resumen.costoPromedio)}
                      </Typography>
                    </Box>
                    <Inventory color="info" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos de Distribución */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Conceptos Más Vendidos
                  </Typography>
                  {reporte.conceptosMasVendidos.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: "60%" }}>
                          {index + 1}. {item.concepto}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.cantidadVentas} ventas
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
                              bgcolor: "primary.main",
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

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Conceptos Por Ingreso
                  </Typography>
                  {reporte.conceptosPorIngreso.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: "50%" }}>
                          {index + 1}. {item.concepto}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatearMoneda(item.ingresoTotal)}
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
                              bgcolor: "success.main",
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

          {/* Tabla de Conceptos */}
          <TableContainer component={Paper} className="reporte-tabla">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Costo</TableCell>
                  <TableCell align="right">Veces Vendido</TableCell>
                  <TableCell align="right">Ingreso Total</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reporte.conceptos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography className="reporte-sin-datos">
                        No hay datos para mostrar
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reporte.conceptos.map((concepto) => (
                    <TableRow key={concepto.id}>
                      <TableCell>{concepto.id}</TableCell>
                      <TableCell>{concepto.nombre}</TableCell>
                      <TableCell>{concepto.tipo}</TableCell>
                      <TableCell align="right">{formatearMoneda(concepto.costo)}</TableCell>
                      <TableCell align="right">{concepto.vecesVendido}</TableCell>
                      <TableCell align="right">{formatearMoneda(concepto.ingresoTotal)}</TableCell>
                      <TableCell>
                        <Chip
                          label={concepto.activo ? "Activo" : "Inactivo"}
                          color={concepto.activo ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
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
