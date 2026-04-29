/** @module pages/PerfilAlumno */
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Pagination,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Percent,
  EventAvailable,
  EmojiEvents,
  Person,
  FilterAlt,
  Clear,
  HistoryEdu,
  Payment,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { obtenerPerfilAlumno } from "../../services/alumnosService";
import { justificarFalta } from "../../services/asistenciasService";
import CintaChip from "../../Components/CintaChip";
import "./PerfilAlumno.css";

/**
 * Página de perfil detallado de un alumno. Muestra información personal,
 * resumen de asistencias con filtros por período, y progresión de cintas
 * en una línea de tiempo visual.
 *
 * @component
 * @returns {JSX.Element} Página completa del perfil del alumno.
 */
export default function PerfilAlumno() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de período
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroActivo, setFiltroActivo] = useState(false);

  // Paginación de asistencias
  const [paginaAsistencias, setPaginaAsistencias] = useState(1);
  const asistenciasPorPagina = 10;

  // Paginación de pagos
  const [paginaPagos, setPaginaPagos] = useState(1);
  const pagosPorPagina = 10;

  const cargarPerfil = async (inicio, fin) => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerPerfilAlumno(slug, inicio || undefined, fin || undefined);
      setPerfil(data);
    } catch (err) {
      let mensaje = "Ocurrió un error al cargar el perfil del alumno.";
      if (err.response) {
        if (err.response.status === 404) {
          mensaje = "Alumno no encontrado.";
        } else if (err.response.data?.mensaje) {
          mensaje = err.response.data.mensaje;
        } else {
          mensaje = `Error del servidor (${err.response.status}).`;
        }
      } else if (err.request) {
        mensaje = "No se pudo conectar con el servidor.";
      }
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const aplicarFiltro = () => {
    if (fechaInicio && fechaFin) {
      setFiltroActivo(true);
      setPaginaAsistencias(1);
      cargarPerfil(fechaInicio, fechaFin);
    }
  };

  const limpiarFiltro = () => {
    setFechaInicio("");
    setFechaFin("");
    setFiltroActivo(false);
    setPaginaAsistencias(1);
    cargarPerfil();
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const obtenerIniciales = (nombre) => {
    if (!nombre) return "?";
    const partes = nombre.split(" ");
    return partes.length >= 2
      ? `${partes[0][0]}${partes[1][0]}`
      : nombre[0];
  };

  const handleJustificar = async (asistenciaId, estadoActual) => {
    const nuevoEstado = !estadoActual;
    const accion = nuevoEstado ? "justificar" : "quitar la justificación de";

    const resultado = await Swal.fire({
      title: `¿${nuevoEstado ? "Justificar" : "Quitar justificación de"} esta falta?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DC143C",
      cancelButtonColor: "#757575",
      confirmButtonText: nuevoEstado ? "Sí, justificar" : "Sí, quitar",
      cancelButtonText: "Cancelar",
    });

    if (!resultado.isConfirmed) return;

    try {
      await justificarFalta(asistenciaId, nuevoEstado);
      // Recargar perfil para actualizar los contadores
      if (filtroActivo) {
        cargarPerfil(fechaInicio, fechaFin);
      } else {
        cargarPerfil();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.mensaje || `No se pudo ${accion} la falta`,
        confirmButtonColor: "#DC143C",
      });
    }
  };

  if (cargando) {
    return (
      <div className="perfil-container">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: "#DC143C" }} size={48} />
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div className="perfil-container">
        <button className="perfil-back-btn" onClick={() => navigate(-1)}>
          <ArrowBack fontSize="small" /> Regresar
        </button>
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error}
        </Alert>
      </div>
    );
  }

  if (!perfil) return null;

  const { alumno } = perfil;

  // Paginación de asistencias
  const totalPaginasAsistencias = Math.ceil((perfil.asistencias?.length || 0) / asistenciasPorPagina);
  const asistenciasPaginadas = (perfil.asistencias || []).slice(
    (paginaAsistencias - 1) * asistenciasPorPagina,
    paginaAsistencias * asistenciasPorPagina
  );

  // Paginación de pagos
  const totalPaginasPagos = Math.ceil((perfil.historialPagos?.length || 0) / pagosPorPagina);
  const pagosPaginados = (perfil.historialPagos || []).slice(
    (paginaPagos - 1) * pagosPorPagina,
    paginaPagos * pagosPorPagina
  );

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(monto);
  };

  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmado': return 'success';
      case 'pendiente': return 'warning';
      case 'rechazado': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="perfil-container">
      {/* Botón regresar */}
      <button className="perfil-back-btn" onClick={() => navigate(-1)}>
        <ArrowBack fontSize="small" /> Regresar
      </button>

      {/* Encabezado del perfil */}
      <div className="perfil-header">
        <div className="perfil-header-content">
          <div className="perfil-avatar">
            {obtenerIniciales(alumno.nombreCompleto)}
          </div>
          <div className="perfil-info-principal">
            <h1 className="perfil-nombre">{alumno.nombreCompleto}</h1>
            <p className="perfil-subtitle">
              Inscrito desde {formatearFecha(alumno.fechaInscripcion)} • {alumno.edad} años
            </p>
            <div className="perfil-badges">
              <Chip
                label={alumno.activo ? "Activo" : "Inactivo"}
                color={alumno.activo ? "success" : "error"}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <CintaChip nombreCinta={alumno.cintaActualNombre} />
              {alumno.claseNombre && (
                <Chip
                  label={`${alumno.claseNombre} • ${alumno.claseHorario || ""}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    borderColor: "rgba(255,255,255,0.2)",
                    fontWeight: 600,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de datos personales */}
      <div className="perfil-datos-grid">
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">Nombre completo</div>
          <div className="perfil-dato-valor">{alumno.nombreCompleto}</div>
        </div>
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">CURP</div>
          <div className="perfil-dato-valor">{alumno.curp || "No registrado"}</div>
        </div>
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">Sexo</div>
          <div className="perfil-dato-valor">{alumno.sexo || "No especificado"}</div>
        </div>
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">Dirección</div>
          <div className="perfil-dato-valor">{alumno.direccion || "No registrada"}</div>
        </div>
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">Enfermedades</div>
          <div className="perfil-dato-valor">{alumno.enfermedades}</div>
        </div>
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">Tutor</div>
          <div className="perfil-dato-valor">{alumno.nombreTutor}</div>
        </div>
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">Teléfono del Tutor</div>
          <div className="perfil-dato-valor">{alumno.telefonoTutor}</div>
        </div>
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">Email del Tutor</div>
          <div className="perfil-dato-valor">{alumno.emailTutor}</div>
        </div>
        <div className="perfil-dato-card">
          <div className="perfil-dato-label">Mensualidad</div>
          <div className="perfil-dato-valor">
            {alumno.conceptoMensualidadNombre
              ? `${alumno.conceptoMensualidadNombre} ($${alumno.conceptoMensualidadMonto})`
              : "Sin mensualidad"}
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN: HISTORIAL DE ASISTENCIAS ===== */}
      <div className="perfil-seccion">
        <div className="perfil-seccion-titulo">
          <EventAvailable /> Historial de Asistencias
        </div>

        {/* Tarjetas de resumen */}
        <div className="perfil-resumen-grid">
          <div className="perfil-resumen-card presencias">
            <div className="perfil-resumen-icon">
              <CheckCircle fontSize="inherit" />
            </div>
            <div className="perfil-resumen-valor">{perfil.totalPresencias}</div>
            <div className="perfil-resumen-label">Presencias</div>
          </div>
          <div className="perfil-resumen-card faltas">
            <div className="perfil-resumen-icon">
              <Cancel fontSize="inherit" />
            </div>
            <div className="perfil-resumen-valor">{perfil.totalFaltas}</div>
            <div className="perfil-resumen-label">Faltas</div>
          </div>
          <div className="perfil-resumen-card porcentaje">
            <div className="perfil-resumen-icon">
              <Percent fontSize="inherit" />
            </div>
            <div className="perfil-resumen-valor">{perfil.porcentajeAsistencia}%</div>
            <div className="perfil-resumen-label">Asistencia</div>
          </div>
          <div className="perfil-resumen-card justificadas">
            <div className="perfil-resumen-icon">
              <HistoryEdu fontSize="inherit" />
            </div>
            <div className="perfil-resumen-valor">{perfil.totalJustificadas}</div>
            <div className="perfil-resumen-label">Justificadas</div>
          </div>
        </div>

        {/* Filtro por período */}
        <div className="perfil-filtro-periodo">
          <TextField
            label="Fecha inicio"
            type="date"
            size="small"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Fecha fin"
            type="date"
            size="small"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <Button
            variant="contained"
            startIcon={<FilterAlt />}
            onClick={aplicarFiltro}
            disabled={!fechaInicio || !fechaFin}
            sx={{
              background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
              fontWeight: 700,
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%)",
              },
              "&:disabled": {
                background: "#ccc",
              },
            }}
          >
            Filtrar
          </Button>
          {filtroActivo && (
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={limpiarFiltro}
              sx={{
                borderRadius: "10px",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Limpiar
            </Button>
          )}
        </div>

        {/* Tabla de asistencias */}
        {(perfil.asistencias || []).length === 0 ? (
          <div className="perfil-empty-state">
            <EventAvailable />
            <p>No hay registros de asistencia
              {filtroActivo ? " en el período seleccionado" : ""}</p>
          </div>
        ) : (
          <>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(220, 20, 60, 0.1)",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
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
                      },
                    }}
                  >
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Fecha
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Clase
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Estado
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Justificada
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {asistenciasPaginadas.map((asistencia) => (
                    <TableRow
                      key={asistencia.id}
                      hover
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(220, 20, 60, 0.04)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {formatearFecha(asistencia.fecha)}
                      </TableCell>
                      <TableCell>{asistencia.claseNombre}</TableCell>
                      <TableCell>
                        <Chip
                          label={asistencia.presente ? "Presente" : "Falta"}
                          color={asistencia.presente ? "success" : "error"}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {!asistencia.presente ? (
                          <Chip
                            label={asistencia.justificada ? "Justificada ✓" : "Sin justificar"}
                            color={asistencia.justificada ? "warning" : "default"}
                            size="small"
                            variant={asistencia.justificada ? "filled" : "outlined"}
                            onClick={() => handleJustificar(asistencia.id, asistencia.justificada)}
                            sx={{
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                              },
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPaginasAsistencias > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={totalPaginasAsistencias}
                  page={paginaAsistencias}
                  onChange={(_, val) => setPaginaAsistencias(val)}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 600,
                      borderRadius: "10px",
                      transition: "all 0.3s ease",
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                      background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(220, 20, 60, 0.3)",
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </div>

      {/* ===== SECCIÓN: PROGRESIÓN DE CINTAS ===== */}
      <div className="perfil-seccion">
        <div className="perfil-seccion-titulo">
          <EmojiEvents /> Progresión de Cintas
        </div>

        {(perfil.historialCintas || []).length === 0 ? (
          <div className="perfil-empty-state">
            <EmojiEvents />
            <p>No hay historial de cintas registrado</p>
            {alumno.cintaActualNombre && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
                  Cinta actual:
                </Typography>
                <CintaChip nombreCinta={alumno.cintaActualNombre} />
              </Box>
            )}
          </div>
        ) : (
          <div className="perfil-timeline">
            {perfil.historialCintas.map((item, index) => (
              <div
                className="perfil-timeline-item"
                key={item.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="perfil-timeline-dot"
                  style={{ backgroundColor: item.cintaColorHex || "#DC143C" }}
                />
                <div className="perfil-timeline-content">
                  <div className="perfil-timeline-cinta">
                    <CintaChip nombreCinta={item.cintaNombre} />
                  </div>
                  <div className="perfil-timeline-fecha">
                    {formatearFecha(item.fechaObtencion)}
                  </div>
                  {item.observaciones && (
                    <div className="perfil-timeline-obs">
                      {item.observaciones}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ===== SECCIÓN: HISTORIAL DE PAGOS ===== */}
      <div className="perfil-seccion">
        <div className="perfil-seccion-titulo">
          <Payment /> Historial de Pagos
        </div>

        {(perfil.historialPagos || []).length === 0 ? (
          <div className="perfil-empty-state">
            <Payment />
            <p>No hay pagos registrados para este alumno</p>
          </div>
        ) : (
          <>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(220, 20, 60, 0.1)",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
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
                      },
                    }}
                  >
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Fecha
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Concepto
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Monto
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Método
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.9rem" }}>
                      Estado
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagosPaginados.map((pago) => (
                    <TableRow
                      key={pago.id}
                      hover
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(220, 20, 60, 0.04)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {formatearFecha(pago.fecha)}
                      </TableCell>
                      <TableCell>{pago.conceptoNombre}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#1A1A1A" }}>
                        {formatearMoneda(pago.monto)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pago.metodoPago}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pago.estado}
                          color={obtenerColorEstado(pago.estado)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPaginasPagos > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={totalPaginasPagos}
                  page={paginaPagos}
                  onChange={(_, val) => setPaginaPagos(val)}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 600,
                      borderRadius: "10px",
                      transition: "all 0.3s ease",
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                      background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(220, 20, 60, 0.3)",
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  );
}
