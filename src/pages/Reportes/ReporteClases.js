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
  LinearProgress,
} from "@mui/material";
import {
  Class,
  People,
  EventAvailable,
  CheckCircle,
  Download,
} from "@mui/icons-material";
import { generarReporteClases } from "../../services/reportesService";
import Swal from "sweetalert2";

export default function ReporteClases() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarReporte = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await generarReporteClases();
      setReporte(data);
    } catch (err) {
      setError("Error al generar el reporte de clases");
      Swal.fire("Error", "No se pudo generar el reporte", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const exportarCSV = () => {
    if (!reporte || !reporte.clases.length) return;

    const headers = ["ID", "Nombre", "Horario", "Dia", "Capacidad Maxima", "Alumnos Inscritos", "% Ocupacion", "Activa"];
    const rows = reporte.clases.map(c => [
      c.id,
      c.nombre,
      c.horario,
      c.diaSemana,
      c.capacidadMaxima,
      c.alumnosInscritos,
      c.porcentajeOcupacion.toFixed(1),
      c.activa ? "Si" : "No",
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
    link.download = `reporte_clases_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getColorOcupacion = (porcentaje) => {
    if (porcentaje >= 90) return "error";
    if (porcentaje >= 70) return "warning";
    return "success";
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
                        Total Clases
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalClases}</Typography>
                    </Box>
                    <Class color="primary" sx={{ fontSize: 40 }} />
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
                        Clases Activas
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.clasesActivas}</Typography>
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
                        Total Alumnos
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalAlumnosInscritos}</Typography>
                    </Box>
                    <People color="info" sx={{ fontSize: 40 }} />
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
                        % Ocupación Promedio
                      </Typography>
                      <Typography variant="h4">
                        {reporte.resumen.porcentajeOcupacionPromedio.toFixed(1)}%
                      </Typography>
                    </Box>
                    <EventAvailable color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos de Análisis */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Clases Por Ocupación
                  </Typography>
                  {reporte.clasesPorCapacidad.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{item.clase}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.alumnosInscritos}/{item.capacidadMaxima}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={item.porcentajeOcupacion}
                          color={getColorOcupacion(item.porcentajeOcupacion)}
                          sx={{ flex: 1, height: 8, borderRadius: 1 }}
                        />
                        <Typography variant="caption">
                          {item.porcentajeOcupacion.toFixed(1)}%
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
                    Clases Por Asistencia Promedio
                  </Typography>
                  {reporte.clasesPorAsistencia.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{item.clase}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.promedioAsistencia} alumnos
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
                              width: `${item.porcentajeAsistencia > 100 ? 100 : item.porcentajeAsistencia}%`,
                              height: "100%",
                              bgcolor: "success.main",
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                        <Typography variant="caption">
                          {item.porcentajeAsistencia.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de Clases */}
          <TableContainer component={Paper} className="reporte-tabla">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Horario</TableCell>
                  <TableCell>Día</TableCell>
                  <TableCell align="right">Capacidad</TableCell>
                  <TableCell align="right">Inscritos</TableCell>
                  <TableCell align="right">% Ocupación</TableCell>
                  <TableCell align="right">Promedio Asistencia</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reporte.clases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography className="reporte-sin-datos">
                        No hay datos para mostrar
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reporte.clases.map((clase) => (
                    <TableRow key={clase.id}>
                      <TableCell>{clase.id}</TableCell>
                      <TableCell>{clase.nombre}</TableCell>
                      <TableCell>{clase.horario}</TableCell>
                      <TableCell>{clase.diaSemana}</TableCell>
                      <TableCell align="right">{clase.capacidadMaxima}</TableCell>
                      <TableCell align="right">{clase.alumnosInscritos}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${clase.porcentajeOcupacion.toFixed(1)}%`}
                          color={getColorOcupacion(clase.porcentajeOcupacion)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{clase.promedioAsistencia}</TableCell>
                      <TableCell>
                        <Chip
                          label={clase.activa ? "Activa" : "Inactiva"}
                          color={clase.activa ? "success" : "default"}
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
