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
  Chip,
} from "@mui/material";
import {
  EventAvailable,
  CheckCircle,
  Cancel,
  TrendingUp,
  Download,
} from "@mui/icons-material";
import { generarReporteAsistencias } from "../../services/reportesService";
import Swal from "sweetalert2";

export default function ReporteAsistencias() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
  });

  const cargarReporte = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await generarReporteAsistencias(filtros);
      setReporte(data);
    } catch (err) {
      setError("Error al generar el reporte de asistencias");
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

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-MX");
  };

  const exportarCSV = () => {
    if (!reporte || !reporte.asistencias.length) return;

    const headers = ["ID", "Alumno", "Clase", "Fecha", "Presente"];
    const rows = reporte.asistencias.map(a => [
      a.id,
      a.alumnoNombre,
      a.claseNombre,
      formatearFecha(a.fecha),
      a.presente ? "Si" : "No",
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
    link.download = `reporte_asistencias_${new Date().toISOString().split("T")[0]}.csv`;
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
          <Grid item xs={12} sm={4}>
            <TextField
              label="Fecha Inicio"
              type="date"
              fullWidth
              value={filtros.fechaInicio}
              onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Fecha Fin"
              type="date"
              fullWidth
              value={filtros.fechaFin}
              onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={cargarReporte}
              sx={{ height: "56px" }}
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
                        Total Asistencias
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalAsistencias}</Typography>
                    </Box>
                    <EventAvailable color="primary" sx={{ fontSize: 40 }} />
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
                        Presentes
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalPresentes}</Typography>
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
                        Ausentes
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalAusentes}</Typography>
                    </Box>
                    <Cancel color="error" sx={{ fontSize: 40 }} />
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
                        % Asistencia
                      </Typography>
                      <Typography variant="h4">
                        {reporte.resumen.porcentajeAsistencia.toFixed(1)}%
                      </Typography>
                    </Box>
                    <TrendingUp color="info" sx={{ fontSize: 40 }} />
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
                    Asistencias Por Clase
                  </Typography>
                  {reporte.asistenciasPorClase.slice(0, 5).map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{item.clase}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.porcentajeAsistencia.toFixed(1)}%
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
                              width: `${item.porcentajeAsistencia}%`,
                              height: "100%",
                              bgcolor: "primary.main",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                        <Typography variant="caption">
                          {item.presentes}/{item.totalAsistencias}
                        </Typography>
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
                    Top 10 Alumnos
                  </Typography>
                  {reporte.topAlumnos.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: "60%" }}>
                          {index + 1}. {item.alumnoNombre}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.porcentajeAsistencia.toFixed(1)}%
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
                              width: `${item.porcentajeAsistencia}%`,
                              height: "100%",
                              bgcolor: "success.main",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                        <Typography variant="caption">
                          {item.presentes}/{item.totalAsistencias}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de Asistencias Por Día */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asistencias Por Día
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Presentes</TableCell>
                      <TableCell align="right">Ausentes</TableCell>
                      <TableCell align="right">% Asistencia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reporte.asistenciasPorDia.map((dia, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatearFecha(dia.fecha)}</TableCell>
                        <TableCell align="right">{dia.totalAsistencias}</TableCell>
                        <TableCell align="right">{dia.presentes}</TableCell>
                        <TableCell align="right">{dia.ausentes}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${dia.porcentajeAsistencia.toFixed(1)}%`}
                            color={dia.porcentajeAsistencia >= 80 ? "success" : dia.porcentajeAsistencia >= 60 ? "warning" : "error"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Tabla Detallada */}
          <TableContainer component={Paper} className="reporte-tabla">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Alumno</TableCell>
                  <TableCell>Clase</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Asistencia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reporte.asistencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography className="reporte-sin-datos">
                        No hay datos para mostrar
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reporte.asistencias.slice(0, 100).map((asistencia) => (
                    <TableRow key={asistencia.id}>
                      <TableCell>{asistencia.id}</TableCell>
                      <TableCell>{asistencia.alumnoNombre}</TableCell>
                      <TableCell>{asistencia.claseNombre}</TableCell>
                      <TableCell>{formatearFecha(asistencia.fecha)}</TableCell>
                      <TableCell>
                        <Chip
                          label={asistencia.presente ? "Presente" : "Ausente"}
                          color={asistencia.presente ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {reporte.asistencias.length > 100 && (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  Mostrando primeros 100 registros de {reporte.asistencias.length}
                </Typography>
              </Box>
            )}
          </TableContainer>
        </>
      )}
    </Box>
  );
}
