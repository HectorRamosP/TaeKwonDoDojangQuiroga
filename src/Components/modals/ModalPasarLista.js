import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  CircularProgress,
  Alert,
  Box,
  Typography,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CheckCircle, CalendarToday, Delete } from "@mui/icons-material";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { registrarAsistenciasMasivas, obtenerAsistencias, eliminarAsistenciasPorClaseYFecha } from "../../services/asistenciasService";
import ModernModal from "./ModernModal";

export default function ModalPasarLista({ abierto, cerrar, clase }) {
  const [alumnos, setAlumnos] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [historialFechas, setHistorialFechas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (abierto && clase) {
      cargarAlumnos();
      cargarHistorialFechas();
    }
  }, [abierto, clase]);

  useEffect(() => {
    if (abierto && clase && alumnos.length > 0) {
      cargarAsistenciasPorFecha();
    }
  }, [fecha, alumnos]);

  const cargarHistorialFechas = async () => {
    try {
      const response = await obtenerAsistencias({ claseId: clase.id });
      const asistencias = response.data || response || [];

      // Mapeo de días en español a números de día de la semana (0 = Domingo, 1 = Lunes, etc.)
      const diasSemana = {
        'domingo': 0,
        'lunes': 1,
        'martes': 2,
        'miércoles': 3,
        'miercoles': 3, // Sin acento
        'jueves': 4,
        'viernes': 5,
        'sábado': 6,
        'sabado': 6 // Sin acento
      };

      // Obtener los días de la semana de esta clase
      const diasClase = clase.dias
        .toLowerCase()
        .split(',')
        .map(d => d.trim())
        .map(d => diasSemana[d])
        .filter(d => d !== undefined);

      // Extraer fechas únicas y filtrar solo las que coincidan con los días de la clase
      const fechasUnicas = [...new Set(asistencias.map(a => a.fecha.split('T')[0]))]
        .filter(fechaStr => {
          const fecha = new Date(fechaStr + 'T00:00:00');
          const diaSemana = fecha.getDay();
          return diasClase.includes(diaSemana);
        });

      fechasUnicas.sort((a, b) => new Date(b) - new Date(a));
      setHistorialFechas(fechasUnicas.slice(0, 10)); // Solo las últimas 10
    } catch (error) {
      // Si no hay asistencias, no es un error crítico
      setHistorialFechas([]);
    }
  };

  const cargarAlumnos = async () => {
    setCargando(true);
    setError(null);

    try {
      const resAlumnos = await api.get(`/alumnos?claseId=${clase.id}&activo=true`);
      setAlumnos(resAlumnos.data || []);
    } catch (error) {
      setError("No se pudieron cargar los alumnos de esta clase");
    } finally {
      setCargando(false);
    }
  };

  const cargarAsistenciasPorFecha = async () => {
    try {
      const resAsistencias = await obtenerAsistencias({
        claseId: clase.id,
        fecha: fecha
      });
      const asistencias = resAsistencias.data || resAsistencias || [];

      const asistenciasMap = {};
      asistencias.forEach(asist => {
        asistenciasMap[asist.alumnoId] = asist.presente;
      });
      setAsistencias(asistenciasMap);
    } catch (error) {
      // Si no hay asistencias para esta fecha, inicializar vacío
      setAsistencias({});
    }
  };

  const handleToggleAsistencia = (alumnoId) => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: !prev[alumnoId]
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);

    try {
      const asistenciasArray = alumnos.map(alumno => ({
        alumnoId: alumno.id,
        presente: asistencias[alumno.id] || false
      }));

      const payload = {
        claseId: clase.id,
        fecha: fecha + "T00:00:00", // Formato ISO completo
        asistencias: asistenciasArray
      };

      await registrarAsistenciasMasivas(payload);

      // Recargar historial de fechas
      await cargarHistorialFechas();

      // Mostrar mensaje de éxito con z-index alto para aparecer sobre el modal
      Swal.fire({
        icon: "success",
        title: "Asistencias guardadas",
        text: `Se registraron las asistencias exitosamente para el ${formatearFecha(fecha)}`,
        confirmButtonColor: "#DC143C",
        timer: 3000,
        showConfirmButton: true,
        customClass: {
          container: 'swal-on-top'
        }
      });
    } catch (error) {
      let mensajeError = "No se pudieron guardar las asistencias";

      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.response?.data?.errors) {
        mensajeError = error.response.data.errors.join(", ");
      } else if (error.message) {
        mensajeError = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: mensajeError,
        confirmButtonColor: "#d32f2f",
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleClose = () => {
    if (!guardando) {
      cerrar();
      setTimeout(() => {
        setAlumnos([]);
        setAsistencias({});
        setHistorialFechas([]);
        setError(null);
        setFecha(new Date().toISOString().split('T')[0]);
      }, 300);
    }
  };

  const handleSeleccionarFecha = (fechaHistorial) => {
    setFecha(fechaHistorial);
  };

  const contarPresentes = () => {
    return Object.values(asistencias).filter(presente => presente).length;
  };

  const contarAusentes = () => {
    return alumnos.length - contarPresentes();
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEliminarFecha = async (fechaAEliminar) => {
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      html: `¿Estás seguro de que deseas eliminar el registro de asistencia del <strong>${formatearFecha(fechaAEliminar)}</strong>?<br><br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC143C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal-on-top'
      }
    });

    if (result.isConfirmed) {
      try {
        console.log('Eliminando fecha:', fechaAEliminar);
        console.log('ClaseId:', clase.id);
        await eliminarAsistenciasPorClaseYFecha(clase.id, fechaAEliminar);

        // Recargar el historial
        await cargarHistorialFechas();

        // Si la fecha eliminada era la que estaba seleccionada, cambiar a hoy
        if (fechaAEliminar === fecha) {
          setFecha(new Date().toISOString().split('T')[0]);
          setAsistencias({});
        }

        Swal.fire({
          icon: 'success',
          title: 'Registro eliminado',
          text: 'El registro de asistencia ha sido eliminado exitosamente',
          confirmButtonColor: '#DC143C',
          timer: 3000,
          showConfirmButton: true,
          customClass: {
            container: 'swal-on-top'
          }
        });
      } catch (error) {
        console.error('Error completo:', error);
        console.error('Response:', error.response);
        let mensajeError = 'No se pudo eliminar el registro de asistencia';

        if (error.response?.data?.message) {
          mensajeError = error.response.data.message;
        } else if (error.response?.data?.errors) {
          mensajeError = error.response.data.errors.join(', ');
        } else if (error.message) {
          mensajeError = error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: mensajeError,
          confirmButtonColor: '#d32f2f',
        });
      }
    }
  };

  return (
    <>
      <ModernModal
        open={abierto}
        onClose={handleClose}
        title={`Pasar Lista: ${clase?.nombre || ''}`}
        icon={<CheckCircle />}
        maxWidth="xl"
        actions={
          <>
            <Button
              onClick={handleClose}
              className="modal-button-secondary"
              disabled={guardando}
            >
              Cancelar
            </Button>
            {alumnos.length > 0 && (
              <Button
                onClick={handleGuardar}
                className="modal-button-primary"
                disabled={guardando || cargando}
                startIcon={guardando && <CircularProgress size={20} />}
              >
                {guardando ? "Guardando..." : "Guardar Asistencias"}
              </Button>
            )}
          </>
        }
      >
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Panel izquierdo - Historial */}
          <Box
            sx={{
              width: "280px",
              borderRight: "2px solid rgba(220, 20, 60, 0.1)",
              pr: 3
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CalendarToday sx={{ color: "#DC143C", fontSize: 20 }} />
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}
              >
                Historial de Lista
              </Typography>
            </Box>
            {historialFechas.length === 0 ? (
              <Alert
                severity="info"
                sx={{
                  fontSize: "0.85rem",
                  borderRadius: "12px",
                  backgroundColor: "#E3F2FD",
                  color: "#1976D2"
                }}
              >
                No hay registros previos
              </Alert>
            ) : (
              <List dense sx={{ maxHeight: 450, overflow: "auto" }}>
                {historialFechas.map((fechaHistorial) => (
                  <ListItem
                    key={fechaHistorial}
                    button
                    selected={fechaHistorial === fecha}
                    onClick={() => handleSeleccionarFecha(fechaHistorial)}
                    sx={{
                      borderRadius: "12px",
                      mb: 1,
                      backgroundColor: fechaHistorial === fecha
                        ? "linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)"
                        : "transparent",
                      border: fechaHistorial === fecha ? "2px solid #DC143C" : "2px solid transparent",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: fechaHistorial === fecha
                          ? "rgba(220, 20, 60, 0.15)"
                          : "rgba(220, 20, 60, 0.05)",
                        transform: "translateX(4px)"
                      }
                    }}
                    secondaryAction={
                      <Tooltip title="Eliminar registro" arrow>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarFecha(fechaHistorial);
                          }}
                          sx={{
                            color: "#DC143C",
                            "&:hover": {
                              backgroundColor: "rgba(220, 20, 60, 0.1)",
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={formatearFecha(fechaHistorial)}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        fontWeight: fechaHistorial === fecha ? 600 : 400,
                        color: fechaHistorial === fecha ? "#DC143C" : "#495057"
                      }}
                    />
                    {fechaHistorial === fecha && (
                      <Chip
                        label="Actual"
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                          color: "white",
                          mr: 1
                        }}
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Panel derecho - Lista actual */}
          <Box sx={{ flex: 1 }}>
            {clase && (
              <Box
                sx={{
                  mb: 3,
                  p: 3,
                  background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
                  borderRadius: "16px",
                  border: "2px solid rgba(220, 20, 60, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
                }}
              >
                <Typography variant="body2" sx={{ mb: 1, color: "#495057" }}>
                  <strong>Horario:</strong> {clase.dias} de {clase.horaInicio} a {clase.horaFin}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: "#495057" }}>
                  <strong>Tipo:</strong> {clase.tipoClase}
                </Typography>
                <TextField
                  label="Fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  disabled={guardando}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px"
                    }
                  }}
                />
              </Box>
            )}

            {!cargando && alumnos.length > 0 && (
              <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "center" }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
                    borderRadius: "16px",
                    minWidth: 120,
                    boxShadow: "0 4px 12px rgba(56, 142, 60, 0.2)",
                    border: "2px solid #81C784"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#388E3C", fontWeight: 600 }}>
                    Presentes
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#2E7D32", fontWeight: 800, mt: 0.5 }}>
                    {contarPresentes()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
                    borderRadius: "16px",
                    minWidth: 120,
                    boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)",
                    border: "2px solid #EF9A9A"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#D32F2F", fontWeight: 600 }}>
                    Ausentes
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#C62828", fontWeight: 800, mt: 0.5 }}>
                    {contarAusentes()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                    borderRadius: "16px",
                    minWidth: 120,
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                    border: "2px solid #90CAF9"
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#1976D2", fontWeight: 600 }}>
                    Total
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#1565C0", fontWeight: 800, mt: 0.5 }}>
                    {alumnos.length}
                  </Typography>
                </Box>
              </Box>
            )}

            {cargando ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress sx={{ color: "#DC143C" }} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>
            ) : alumnos.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: "12px" }}>
                No hay alumnos inscritos en esta clase
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: "2px solid rgba(220, 20, 60, 0.1)",
                  overflow: "hidden"
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)"
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: 700,
                          width: "100px",
                          fontSize: "0.9rem",
                          letterSpacing: "0.5px"
                        }}
                      >
                        Presente
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          letterSpacing: "0.5px"
                        }}
                      >
                        Nombre
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          letterSpacing: "0.5px"
                        }}
                      >
                        Edad
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alumnos.map((alumno) => {
                      const presente = asistencias[alumno.id] || false;
                      return (
                        <TableRow
                          key={alumno.id}
                          hover
                          sx={{
                            backgroundColor: presente
                              ? "rgba(56, 142, 60, 0.08)"
                              : asistencias[alumno.id] === false
                                ? "rgba(211, 47, 47, 0.08)"
                                : "inherit",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: presente
                                ? "rgba(56, 142, 60, 0.15)"
                                : asistencias[alumno.id] === false
                                  ? "rgba(211, 47, 47, 0.15)"
                                  : "rgba(220, 20, 60, 0.05)"
                            }
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={presente}
                              onChange={() => handleToggleAsistencia(alumno.id)}
                              disabled={guardando}
                              sx={{
                                color: "#DC143C",
                                "&.Mui-checked": {
                                  color: "#388E3C"
                                },
                                "&:hover": {
                                  backgroundColor: "rgba(220, 20, 60, 0.1)"
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, color: "#333" }}>
                            {alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                          </TableCell>
                          <TableCell sx={{ color: "#666" }}>
                            {alumno.edad} años
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      </ModernModal>
    </>
  );
}
