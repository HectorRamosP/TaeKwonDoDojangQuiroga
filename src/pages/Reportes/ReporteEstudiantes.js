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
  People,
  PersonAdd,
  PersonOff,
  Cake,
  Download,
} from "@mui/icons-material";
import { generarReporteEstudiantes } from "../../services/reportesService";
import Swal from "sweetalert2";

export default function ReporteEstudiantes() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarReporte = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await generarReporteEstudiantes();
      setReporte(data);
    } catch (err) {
      setError("Error al generar el reporte de estudiantes");
      Swal.fire("Error", "No se pudo generar el reporte", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-MX");
  };

  const exportarCSV = () => {
    if (!reporte || !reporte.estudiantes.length) return;

    const headers = ["ID", "Nombre", "Edad", "Cinta", "Clases", "Fecha Inscripcion", "Activo", "Telefono"];
    const rows = reporte.estudiantes.map(e => [
      e.id,
      `${e.nombre} ${e.apellidoPaterno} ${e.apellidoMaterno}`,
      e.edad,
      e.cinta || "Sin Cinta",
      e.clases.join("; "),
      formatearFecha(e.fechaInscripcion),
      e.activo ? "Si" : "No",
      e.telefonoTutor,
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
    link.download = `reporte_estudiantes_${new Date().toISOString().split("T")[0]}.csv`;
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
                        Total Estudiantes
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalEstudiantes}</Typography>
                    </Box>
                    <People color="primary" sx={{ fontSize: 40 }} />
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
                        Activos
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.estudiantesActivos}</Typography>
                    </Box>
                    <PersonAdd color="success" sx={{ fontSize: 40 }} />
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
                        Inactivos
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.estudiantesInactivos}</Typography>
                    </Box>
                    <PersonOff color="error" sx={{ fontSize: 40 }} />
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
                        Edad Promedio
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.edadPromedio}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reporte.resumen.edadMinima} - {reporte.resumen.edadMaxima} años
                      </Typography>
                    </Box>
                    <Cake color="info" sx={{ fontSize: 40 }} />
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
                    Por Cinta
                  </Typography>
                  {reporte.estudiantesPorCinta.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{item.cinta}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.cantidad} estudiantes
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

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Por Clase
                  </Typography>
                  {reporte.estudiantesPorClase.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{item.clase}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.cantidad} estudiantes
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

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Por Edad
                  </Typography>
                  {reporte.distribucionPorEdad.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2">{item.rangoEdad}</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {item.cantidad} estudiantes
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
                              bgcolor: "secondary.main",
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

          {/* Tabla de Estudiantes */}
          <TableContainer component={Paper} className="reporte-tabla">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre Completo</TableCell>
                  <TableCell>Edad</TableCell>
                  <TableCell>Cinta</TableCell>
                  <TableCell>Clases</TableCell>
                  <TableCell>Fecha Inscripción</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reporte.estudiantes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography className="reporte-sin-datos">
                        No hay datos para mostrar
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  reporte.estudiantes.map((estudiante) => (
                    <TableRow key={estudiante.id}>
                      <TableCell>{estudiante.id}</TableCell>
                      <TableCell>
                        {`${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`}
                      </TableCell>
                      <TableCell>{estudiante.edad} años</TableCell>
                      <TableCell>{estudiante.cinta || "Sin Cinta"}</TableCell>
                      <TableCell>
                        {estudiante.clases.map((clase, idx) => (
                          <Chip key={idx} label={clase} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell>{formatearFecha(estudiante.fechaInscripcion)}</TableCell>
                      <TableCell>
                        <Chip
                          label={estudiante.activo ? "Activo" : "Inactivo"}
                          color={estudiante.activo ? "success" : "error"}
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
