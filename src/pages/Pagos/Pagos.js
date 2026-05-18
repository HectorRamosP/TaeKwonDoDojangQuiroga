/** @module pages/Pagos */
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
  Pagination,
  CircularProgress,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,          // Integrado para el Modal de Pago Rápido
  DialogTitle,     // Integrado para el Modal de Pago Rápido
  DialogContent,   // Integrado para el Modal de Pago Rápido
  DialogActions,   // Integrado para el Modal de Pago Rápido
  List,            // Integrado para listar alumnos encontrados
  ListItem,        // Integrado para listar alumnos encontrados
  ListItemText,    // Integrado para listar alumnos encontrados
} from "@mui/material";
import { Search, Clear, PaymentRounded, AttachMoney, TrendingUp, CalendarToday, FlashOn } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
// Agregamos 'registrarPago' que ya venía en tu service original
import { obtenerPagos, eliminarPago, obtenerEstadisticasPagos, registrarPago } from "../../services/pagosService";
import api from "../../services/api"; // Importamos la API configurada para buscar alumnos/socios
import ModalPago from "../../Components/modals/ModalPago";
import "./Pagos.css";

/**
 * Página de Gestión de Pagos. Muestra estadísticas de ingresos y una tabla
 * de todos los pagos, con filtros por texto, fecha y estado.
 * @component
 * @returns {JSX.Element} Dashboard de pagos con tarjetas de resumen y tabla filtrable.
 */
export default function Pagos() {
  // --- ESTADOS ORIGINALES DEL EQUIPO ---
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagina, setPagina] = useState(1);
  const [filtrados, setFiltrados] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);

  // --- NUEVOS ESTADOS PARA HISTORIA DE USUARIO (PAGO RÁPIDO) ---
  const [modalRapidoAbierto, setModalRapidoAbierto] = useState(false);
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [alumnosEncontrados, setAlumnosEncontrados] = useState([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [montoRapido, setMontoRapido] = useState("");
  const [metodoPagoRapido, setMetodoPagoRapido] = useState("Efectivo");
  const [guardandoPagoRapido, setGuardandoPagoRapido] = useState(false);

  const itemsPorPagina = 10;

  // --- FUNCIONES ORIGINALES DEL EQUIPO ---
  const cargarEstadisticas = async () => {
    try {
      const data = await obtenerEstadisticasPagos();
      setEstadisticas(data);
    } catch (error) {
      // Error al cargar estadísticas
    }
  };

  const cargarPagos = async () => {
    setCargando(true);
    setError(null);

    try {
      const filtros = {};
      if (estadoFiltro) filtros.estado = estadoFiltro;

      const data = await obtenerPagos(filtros);
      setPagos(data || []);
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al cargar los pagos.";

      if (error.response) {
        mensajeError = "Error al cargar los pagos del servidor.";
      } else if (error.request) {
        mensajeError = "No se pudo conectar con el servidor. Verifica tu conexión.";
      }

      setError(mensajeError);

      Swal.fire({
        icon: "error",
        title: "Error al cargar pagos",
        text: mensajeError,
        confirmButtonColor: "#d32f2f",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, [estadoFiltro]);

  useEffect(() => {
    cargarEstadisticas();
  }, [pagos]);

  useEffect(() => {
    let datosFiltrados = pagos.filter((p) =>
      [p.alumnoNombre, p.conceptoNombre, p.metodoPago, p.referencia]
        .join(" ")
        .toLowerCase()
        .includes(filtro.toLowerCase())
    );

    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      datosFiltrados = datosFiltrados.filter((p) => {
        const fechaPago = new Date(p.fecha);
        return fechaPago >= inicio;
      });
    }

    if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      datosFiltrados = datosFiltrados.filter((p) => {
        const fechaPago = new Date(p.fecha);
        return fechaPago <= fin;
      });
    }

    setFiltrados(datosFiltrados);
    setPagina(1);
  }, [filtro, pagos, fechaInicio, fechaFin]);

  const indiceInicio = (pagina - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const datosPaginados = filtrados.slice(indiceInicio, indiceFin);

  const handleEliminarPago = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#757575",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await eliminarPago(id);

        Swal.fire({
          icon: "success",
          title: "Pago eliminado",
          text: "El pago se ha eliminado exitosamente",
          confirmButtonColor: "#d32f2f",
        });

        cargarPagos();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el pago",
          confirmButtonColor: "#d32f2f",
        });
      }
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(monto);
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "Confirmado":
        return "success";
      case "Pendiente":
        return "warning";
      case "Rechazado":
        return "error";
      default:
        return "default";
    }
  };

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);


  // --- NUEVAS FUNCIONES DE CONTROL PARA EL PAGO RÁPIDO ---
  const handleBuscarAlumnoRapido = async (e) => {
    if (e) e.preventDefault();
    if (!busquedaAlumno.trim()) return;

    setCargandoAlumnos(true);
    try {
      // Endpoint dinámico sincronizado con las rutas del backend de C# y React Router
      const response = await api.get(`/socios?nombre=${busquedaAlumno}`);
      if (Array.isArray(response.data)) {
        setAlumnosEncontrados(response.data);
      } else if (response.data && Array.isArray(response.data.elementos)) {
        setAlumnosEncontrados(response.data.elementos);
      } else {
        setAlumnosEncontrados([]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo buscar al alumno en el servidor.",
        confirmButtonColor: "#d32f2f",
      });
    } finally {
      setCargandoAlumnos(false);
    }
  };

  const handleConfirmarPagoRapido = async (e) => {
    e.preventDefault();
    if (!montoRapido || montoRapido <= 0) {
      Swal.fire({ icon: "warning", title: "Monto requerido", text: "Por favor ingresa una cantidad válida." });
      return;
    }

    setGuardandoPagoRapido(true);
    try {
      // Payload exacto requerido por el Backend (CrearPagoDto)
      const payload = {
        alumnoId: alumnoSeleccionado.id,
        conceptoId: 1, // ID asignado en BD para 'Mensualidad'
        monto: Number(montoRapido),
        metodoPago: metodoPagoRapido, // 'Efectivo', 'Tarjeta', 'Transferencia'
        referencia: "",
        notas: "Cobro rápido diario de Mensualidad"
      };

      await registrarPago(payload);

      Swal.fire({
        icon: "success",
        title: "Cobro Exitoso",
        text: `Se registró la mensualidad de ${alumnoSeleccionado.nombre} correctamente.`,
        confirmButtonColor: "#2e7d32",
      });

      // Limpiar estados y actualizar listas globales
      setModalRapidoAbierto(false);
      setBusquedaAlumno("");
      setAlumnosEncontrados([]);
      setAlumnoSeleccionado(null);
      setMontoRapido("");
      setMetodoPagoRapido("Efectivo");
      
      cargarPagos(); // Recargar tabla original
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error al procesar",
        text: "No se pudo registrar el pago. Inténtalo de nuevo.",
        confirmButtonColor: "#d32f2f",
      });
    } finally {
      setGuardandoPagoRapido(false);
    }
  };

  return (
    <div className="pagos-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <h1 className="page-title">Gestión de Pagos</h1>
        
        {/* GRUPO DE ACCIONES: BOTÓN ORIGINAL + BOTÓN NUEVO DE PAGO RÁPIDO */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<FlashOn />}
            onClick={() => setModalRapidoAbierto(true)}
            sx={{
              background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                boxShadow: "0 6px 20px rgba(46, 125, 50, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Pago Rápido
          </Button>

          <Button
            variant="contained"
            startIcon={<PaymentRounded />}
            onClick={() => setModalAbierto(true)}
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
            Registrar Pago
          </Button>
        </Box>
      </Box>

      {/* --- DASHBOARD DE ESTADÍSTICAS ORIGINAL --- */}
      {estadisticas && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: "#e3f2fd" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AttachMoney sx={{ color: "#1976d2" }} />
                  <Typography variant="h6" component="div">
                    Total Ingresos
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1, color: "#1976d2" }}>
                  {formatearMonto(estadisticas.totalMonto)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: "#e8f5e9" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TrendingUp sx={{ color: "#388e3c" }} />
                  <Typography variant="h6" component="div">
                    Confirmados
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ mt: 1, color: "#388e3c" }}>
                  {estadisticas.pagosConfirmados}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: "#fff3e0" }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  Pendientes
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, color: "#f57c00" }}>
                  {estadisticas.pagosPendientes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ backgroundColor: "#ffebee" }}>
              <CardContent>
                <Typography variant="h6" component="div">
                  Rechazados
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, color: "#d32f2f" }}>
                  {estadisticas.pagosRechazados}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* --- FILTROS ORIGINALES --- */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          placeholder="Buscar por alumno, concepto o referencia..."
          variant="outlined"
          size="small"
          sx={{ flex: 1, minWidth: "250px" }}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: filtro && (
              <InputAdornment position="end">
                <IconButton onClick={() => setFiltro("")} edge="end">
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Fecha Inicio"
          type="date"
          size="small"
          sx={{ minWidth: 160 }}
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: fechaInicio && (
              <InputAdornment position="end">
                <IconButton onClick={() => setFechaInicio("")} edge="end" size="small">
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Fecha Fin"
          type="date"
          size="small"
          sx={{ minWidth: 160 }}
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarToday fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: fechaFin && (
              <InputAdornment position="end">
                <IconButton onClick={() => setFechaFin("")} edge="end" size="small">
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={estadoFiltro}
            label="Estado"
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Confirmado">Confirmado</MenuItem>
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="Rechazado">Rechazado</MenuItem>
          </Select>
        </FormControl>

        {(filtro || fechaInicio || fechaFin || estadoFiltro) && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setFiltro("");
              setFechaInicio("");
              setFechaFin("");
              setEstadoFiltro("");
            }}
            startIcon={<Clear />}
            sx={{
              borderColor: "#d32f2f",
              color: "#d32f2f",
              "&:hover": {
                borderColor: "#b71c1c",
                backgroundColor: "rgba(211, 47, 47, 0.04)",
              },
            }}
          >
            Limpiar Filtros
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cargando ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* --- TABLA PRINCIPAL DE PAGOS ORIGINAL --- */}
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
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Fecha</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Alumno</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Concepto</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Monto</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Método</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Estado</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Referencia</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>Notas</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No se encontraron pagos
                    </TableCell>
                  </TableRow>
                ) : (
                  datosPaginados.map((pago) => (
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
                      <TableCell>{formatearFecha(pago.fecha)}</TableCell>
                      <TableCell>{pago.alumnoNombre}</TableCell>
                      <TableCell>
                        {pago.conceptoNombre}
                        {pago.tipoConcepto && (
                          <Chip label={pago.tipoConcepto} size="small" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {formatearMonto(pago.monto)}
                      </TableCell>
                      <TableCell>{pago.metodoPago}</TableCell>
                      <TableCell>
                        <Chip label={pago.estado} color={obtenerColorEstado(pago.estado)} size="small" />
                      </TableCell>
                      <TableCell>{pago.referencia || "N/A"}</TableCell>
                      <TableCell>{pago.notas || "N/A"}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleEliminarPago(pago.id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* --- PAGINACIÓN ORIGINAL --- */}
          {totalPaginas > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPaginas}
                page={pagina}
                onChange={(e, val) => setPagina(val)}
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 600,
                    fontSize: "1rem",
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(220, 20, 60, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%)",
                    },
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "rgba(220, 20, 60, 0.1)",
                  }
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* --- MODAL ORIGINAL DEL EQUIPO --- */}
      <ModalPago
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        recargar={cargarPagos}
      />

      {/* ======================================================================= */}
      {/* NUEVO MODAL COMPLETO DE PAGO RÁPIDO DIARIO (INTEGRADO CON MATERIAL-UI)  */}
      {/* ======================================================================= */}
      <Dialog 
        open={modalRapidoAbierto} 
        onClose={() => {
          if (!guardandoPagoRapido) {
            setModalRapidoAbierto(false);
            setAlumnoSeleccionado(null);
            setAlumnosEncontrados([]);
            setBusquedaAlumno("");
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: "16px", p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1, color: "#1b5e20" }}>
          <FlashOn color="success" /> Módulo de Pago Rápido (Mensualidad)
        </DialogTitle>
        
        <DialogContent dividers>
          {!alumnoSeleccionado ? (
            // PASO 1: BUSCADOR DE ALUMNOS Y BOTÓN DE ACCESO DIRECTO
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Ingresa el nombre del alumno/socio para aplicar el cobro rápido diario de su mensualidad.
              </Typography>
              <Box component="form" onSubmit={handleBuscarAlumnoRapido} sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  placeholder="Escribe el nombre del alumno a cobrar..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={busquedaAlumno}
                  onChange={(e) => setBusquedaAlumno(e.target.value)}
                  autoFocus
                />
                <Button variant="contained" color="success" type="submit" disabled={cargandoAlumnos} sx={{ bgcolor: "#2e7d32" }}>
                  {cargandoAlumnos ? <CircularProgress size={24} color="inherit" /> : "Buscar"}
                </Button>
              </Box>

              {alumnosEncontrados.length > 0 && (
                <List sx={{ maxHeight: "250px", overflow: "auto", border: "1px solid #e0e0e0", borderRadius: "8px", bgcolor: "#fafafa" }}>
                  {alumnosEncontrados.map((alumno) => (
                    <ListItem 
                      key={alumno.id}
                      secondaryAction={
                        /* BOTÓN VERDE DE ACCESO DIRECTO EXIGIDO */
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small"
                          onClick={() => {
                            setAlumnoSeleccionado(alumno);
                            setMontoRapido("");
                            setMetodoPagoRapido("Efectivo");
                          }}
                          sx={{ 
                            borderRadius: "20px", 
                            textTransform: "none", 
                            fontWeight: "bold",
                            bgcolor: "#2e7d32",
                            "&:hover": { bgcolor: "#1b5e20" }
                          }}
                        >
                          <FlashOn fontSize="small" sx={{ mr: 0.5 }} /> Cobrar Mensualidad
                        </Button>
                      }
                    >
                      <ListItemText 
                        primary={`${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno || ""}`} 
                        secondary={`ID Socio: ${alumno.id}`}
                        primaryTypographyProps={{ fontWeight: "bold" }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              {busquedaAlumno && alumnosEncontrados.length === 0 && !cargandoAlumnos && (
                <Typography variant="body2" color="error" align="center" sx={{ mt: 2, fw: "bold" }}>
                  No se encontraron registros de alumnos con ese nombre.
                </Typography>
              )}
            </Box>
          ) : (
            // PASO 2: FORMULARIO CON CAMPOS PRECARGADOS, BLOQUEADOS Y MONTO EDITABLE
            <Box component="form" onSubmit={handleConfirmarPagoRapido} sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
              
              {/* Campo Alumno: Precargado y Bloqueado */}
              <TextField
                label="Alumno Seleccionado"
                variant="outlined"
                fullWidth
                disabled
                value={`${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellidoPaterno} ${alumnoSeleccionado.apellidoMaterno || ""}`}
                InputProps={{ readOnly: true }}
              />
              
              {/* Campo Concepto: Precargado y Bloqueado */}
              <TextField
                label="Concepto de Pago"
                variant="outlined"
                fullWidth
                disabled
                value="Mensualidad"
                InputProps={{ readOnly: true }}
              />

              {/* Campo Monto: Completamente Editable */}
              <TextField
                label="Monto a Recibir ($)"
                variant="outlined"
                type="number"
                fullWidth
                required
                autoFocus
                value={montoRapido}
                onChange={(e) => setMontoRapido(e.target.value)}
                inputProps={{ min: "1", step: "0.01" }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />

              {/* Selector de Método de Pago rápido */}
              <FormControl fullWidth size="small">
                <InputLabel>Método de Recepción</InputLabel>
                <Select
                  value={metodoPagoRapido}
                  label="Método de Recepción"
                  onChange={(e) => setMetodoPagoRapido(e.target.value)}
                >
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Tarjeta">Tarjeta Bancaria</MenuItem>
                  <MenuItem value="Transferencia">Transferencia Electrónica</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => setAlumnoSeleccionado(null)}
                  disabled={guardandoPagoRapido}
                >
                  Cambiar Alumno
                </Button>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  type="submit"
                  disabled={guardandoPagoRapido}
                  sx={{ fontWeight: "bold", bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
                >
                  {guardandoPagoRapido ? "Procesando..." : "Registrar Cobro"}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setModalRapidoAbierto(false);
              setAlumnoSeleccionado(null);
              setAlumnosEncontrados([]);
              setBusquedaAlumno("");
            }} 
            color="inherit"
            disabled={guardandoPagoRapido}
          >
            Cerrar Ventana
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}