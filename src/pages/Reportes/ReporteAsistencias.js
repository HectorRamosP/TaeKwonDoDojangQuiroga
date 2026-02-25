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

/**
 * Subcomponente del módulo de Reportes. Genera estadísticas de asistencia
 * filtradas por rango de fechas. Muestra porcentaje de asistencia por clase
 * y top de alumnos. Permite exportar a CSV.
 * @component
 * @returns {JSX.Element} Reporte de asistencias con tarjetas resumen, gráficos y tabla por día.
 */
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
              size="small"
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
              size="small"
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
                        Total Asistencias
                      </Typography>
                      <Typography variant="h4">{reporte.resumen.totalAsistencias}</Typography>
                    </Box>
                    <EventAvailable sx={{ fontSize: 40, color: "#DC143C" }} />
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
                              background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
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
                              background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
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
          <Card sx={{
            mb: 3,
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(220, 20, 60, 0.1)",
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asistencias Por Día
              </Typography>
              <TableContainer>
                <Table size="small">
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
                      <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Fecha</TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Total</TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Presentes</TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Ausentes</TableCell>
                      <TableCell align="right" sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>% Asistencia</TableCell>
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
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Clase</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Fecha</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Asistencia</TableCell>
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
                    <TableRow
                      key={asistencia.id}
                      hover
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(220, 20, 60, 0.04)",
                          transform: "scale(1.001)",
                        }
                      }}
                    >
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
