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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { Search, Clear, PersonAdd, FilterList, ExpandMore, ArrowUpward, ArrowDownward, School } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { obtenerAsistenciasPorAlumno } from "../../services/asistenciasService";
import ModalCrearSocio from "../../Components/modals/ModalCrearSocio";
import ModalEditarSocio from "../../Components/modals/ModalEditarSocio";
import CintaChip from "../../Components/CintaChip";
import "./Socios.css";

/**
 * Página de gestión de alumnos del dojo.
 * Permite listar, filtrar, ordenar, crear, editar, activar/desactivar
 * y eliminar alumnos. Incluye filtros avanzados por estado, cinta,
 * clase, mensualidad y rango de edad, con paginación de 10 registros por página.
 *
 * @component
 * @returns {JSX.Element} Página completa de gestión de alumnos.
 */
export default function Socios() {
  const [socios, setSocios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [filtrados, setFiltrados] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [socioEditar, setSocioEditar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Tab activo (0 = Gestión, 1 = Examen)
  const [tabActivo, setTabActivo] = useState(0);

  // Filtros avanzados
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroCinta, setFiltroCinta] = useState("");
  const [filtroClase, setFiltroClase] = useState("");
  const [filtroMensualidad, setFiltroMensualidad] = useState("");
  const [filtroEdadMin, setFiltroEdadMin] = useState("");
  const [filtroEdadMax, setFiltroEdadMax] = useState("");

  // Datos para filtros
  const [cintas, setCintas] = useState([]);
  const [clases, setClases] = useState([]);
  const [conceptos, setConceptos] = useState([]);

  // Estados para ordenamiento
  const [ordenarPor, setOrdenarPor] = useState(null); // 'nombre', 'edad', 'cinta'
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  // Estados para sección Examen
  const [examenFechaInicio, setExamenFechaInicio] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [examenFechaFin, setExamenFechaFin] = useState(() => new Date().toISOString().split('T')[0]);
  const [examenResultados, setExamenResultados] = useState([]);
  const [examenCargando, setExamenCargando] = useState(false);
  const [examenEvaluado, setExamenEvaluado] = useState(false);
  const [examenFiltro, setExamenFiltro] = useState("");
  const [examenFiltroEstatus, setExamenFiltroEstatus] = useState("");
  const [examenPagina, setExamenPagina] = useState(1);
  const examenItemsPorPagina = 10;
  const PORCENTAJE_MINIMO = 70;

  const itemsPorPagina = 10;

  const cargarSocios = async () => {
    setCargando(true);
    setError(null);

    try {
      const res = await api.get("/alumnos");
      setSocios(res.data || []);
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al cargar los alumnos.";

      if (error.response) {
        mensajeError = "Error al cargar los alumnos del servidor.";
      } else if (error.request) {
        mensajeError = "No se pudo conectar con el servidor. Verifica tu conexión.";
      }

      setError(mensajeError);

      Swal.fire({
        icon: "error",
        title: "Error al cargar alumnos",
        text: mensajeError,
        confirmButtonColor: "#d32f2f",
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarDatosFiltros = async () => {
    try {
      const [resCintas, resClases, resConceptos] = await Promise.all([
        api.get("/cintas?activo=true"),
        api.get("/clases?activo=true"),
        api.get("/conceptos?activo=true&tipoConcepto=Mensualidad"),
      ]);

      setCintas(resCintas.data || []);
      setClases(resClases.data || []);
      setConceptos(resConceptos.data || []);
    } catch (error) {
      // Error al cargar datos de filtros
    }
  };

  useEffect(() => {
    cargarSocios();
    cargarDatosFiltros();
  }, []);

  useEffect(() => {
    let datosFiltrados = socios;

    // Filtro de texto
    if (filtro) {
      datosFiltrados = datosFiltrados.filter((s) =>
        [s.nombre, s.apellidoPaterno, s.apellidoMaterno, s.nombreTutor, s.emailTutor]
          .join(" ")
          .toLowerCase()
          .includes(filtro.toLowerCase())
      );
    }

    // Filtro de estado: el Select devuelve "true"/"false" como string, se convierte a booleano
    if (filtroEstado !== "") {
      datosFiltrados = datosFiltrados.filter(
        (s) => s.activo === (filtroEstado === "true")
      );
    }

    // Filtro de cinta
    if (filtroCinta) {
      datosFiltrados = datosFiltrados.filter(
        (s) => s.cintaActualId === parseInt(filtroCinta)
      );
    }

    // Filtro de clase
    if (filtroClase) {
      datosFiltrados = datosFiltrados.filter(
        (s) => s.claseId === parseInt(filtroClase)
      );
    }

    // Filtro de mensualidad
    if (filtroMensualidad) {
      datosFiltrados = datosFiltrados.filter(
        (s) => s.conceptoMensualidadId === parseInt(filtroMensualidad)
      );
    }

    // Filtro de edad mínima
    if (filtroEdadMin && filtroEdadMin !== "") {
      const edadMin = parseInt(filtroEdadMin);
      if (!isNaN(edadMin)) {
        datosFiltrados = datosFiltrados.filter(
          (s) => s.edad >= edadMin
        );
      }
    }

    // Filtro de edad máxima
    if (filtroEdadMax && filtroEdadMax !== "") {
      const edadMax = parseInt(filtroEdadMax);
      if (!isNaN(edadMax)) {
        datosFiltrados = datosFiltrados.filter(
          (s) => s.edad <= edadMax
        );
      }
    }

    setFiltrados(datosFiltrados);
    // Vuelve a la primera página al cambiar cualquier filtro para no mostrar una página vacía
    setPagina(1);
  }, [
    filtro,
    socios,
    filtroEstado,
    filtroCinta,
    filtroClase,
    filtroMensualidad,
    filtroEdadMin,
    filtroEdadMax,
  ]);

  // Función para manejar el ordenamiento
  const manejarOrdenamiento = (campo) => {
    if (ordenarPor === campo) {
      // Si ya está ordenando por este campo, invertir el orden
      setOrdenAscendente(!ordenAscendente);
    } else {
      // Si es un nuevo campo, establecerlo como ascendente
      setOrdenarPor(campo);
      setOrdenAscendente(true);
    }
  };

  // Aplicar ordenamiento a los datos filtrados
  const datosOrdenados = [...filtrados].sort((a, b) => {
    if (!ordenarPor) return 0;

    let comparacion = 0;

    switch (ordenarPor) {
      case 'nombre':
        const nombreA = a.nombreCompleto || `${a.nombre} ${a.apellidoPaterno} ${a.apellidoMaterno}`;
        const nombreB = b.nombreCompleto || `${b.nombre} ${b.apellidoPaterno} ${b.apellidoMaterno}`;
        // localeCompare maneja correctamente acentos y caracteres del español (ñ, á, etc.)
        comparacion = nombreA.localeCompare(nombreB);
        break;

      case 'edad':
        comparacion = a.edad - b.edad;
        break;

      default:
        comparacion = 0;
    }

    return ordenAscendente ? comparacion : -comparacion;
  });

  const indiceInicio = (pagina - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const datosPaginados = datosOrdenados.slice(indiceInicio, indiceFin);

  const cambiarEstado = async (slug, nuevoEstado) => {
    try {
      // El slug va tanto en la URL como en el body porque el backend lo requiere en ambos lugares
      await api.patch(`/alumnos/${slug}/estado`, {
        slug: slug,
        activo: nuevoEstado
      });

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `Alumno ${nuevoEstado ? "activado" : "desactivado"} exitosamente`,
        confirmButtonColor: "#d32f2f",
      });

      cargarSocios();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cambiar el estado del alumno",
        confirmButtonColor: "#d32f2f",
      });
    }
  };

  const eliminarPermanente = (socio) => {
    Swal.fire({
      title: "¿Eliminar alumno permanentemente?",
      html: `
        <p>¿Estás seguro de eliminar <strong>${socio.nombreCompleto}</strong> de forma permanente?</p>
        <p style="color: #d32f2f; font-weight: bold;">Esta acción NO se puede deshacer.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#666",
      confirmButtonText: "Sí, eliminar permanentemente",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/alumnos/${socio.slug}/permanente`);

          Swal.fire({
            icon: "success",
            title: "Alumno eliminado",
            text: "El alumno ha sido eliminado permanentemente del sistema",
            confirmButtonColor: "#d32f2f",
          });

          cargarSocios();
        } catch (error) {
          let mensajeError = "No se pudo eliminar el alumno";

          if (error.response?.status === 400) {
            mensajeError = error.response.data?.mensaje || "No se puede eliminar el alumno";
          }

          Swal.fire({
            icon: "error",
            title: "Error",
            text: mensajeError,
            confirmButtonColor: "#d32f2f",
          });
        }
      }
    });
  };

  const abrirModalEditar = (socio) => {
    setSocioEditar(socio);
    setModalEditarAbierto(true);
  };

  const limpiarTodosFiltros = () => {
    setFiltro("");
    setFiltroEstado("");
    setFiltroCinta("");
    setFiltroClase("");
    setFiltroMensualidad("");
    setFiltroEdadMin("");
    setFiltroEdadMax("");
  };

  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);

  /**
   * Evalúa la elegibilidad de todos los alumnos activos para examen de cambio de cinta.
   * Obtiene las asistencias de cada alumno y calcula el porcentaje de asistencia
   * dentro del rango de fechas seleccionado.
   */
  const evaluarElegibilidad = async () => {
    setExamenCargando(true);
    setExamenEvaluado(false);

    try {
      const alumnosActivos = socios.filter((s) => s.activo);

      if (alumnosActivos.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin alumnos activos",
          text: "No hay alumnos activos para evaluar.",
          confirmButtonColor: "#DC143C",
        });
        setExamenCargando(false);
        return;
      }

      const fechaInicio = new Date(examenFechaInicio + 'T00:00:00');
      const fechaFin = new Date(examenFechaFin + 'T23:59:59');

      if (fechaInicio > fechaFin) {
        Swal.fire({
          icon: "warning",
          title: "Fechas inválidas",
          text: "La fecha de inicio debe ser anterior a la fecha de fin.",
          confirmButtonColor: "#DC143C",
        });
        setExamenCargando(false);
        return;
      }

      const resultados = [];

      for (const alumno of alumnosActivos) {
        try {
          const asistencias = await obtenerAsistenciasPorAlumno(alumno.id);

          // Filtrar asistencias dentro del rango de fechas
          const asistenciasEnRango = asistencias.filter((a) => {
            const fechaAsistencia = new Date(a.fecha);
            return fechaAsistencia >= fechaInicio && fechaAsistencia <= fechaFin;
          });

          const totalRegistros = asistenciasEnRango.length;
          const totalPresente = asistenciasEnRango.filter((a) => a.presente).length;
          const porcentaje = totalRegistros > 0 ? (totalPresente / totalRegistros) * 100 : 0;

          resultados.push({
            id: alumno.id,
            nombreCompleto: alumno.nombreCompleto || `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`,
            cintaActualNombre: alumno.cintaActualNombre,
            claseNombre: alumno.claseNombre,
            totalRegistros,
            totalPresente,
            porcentaje: Math.round(porcentaje * 10) / 10,
            elegible: porcentaje >= PORCENTAJE_MINIMO,
          });
        } catch {
          resultados.push({
            id: alumno.id,
            nombreCompleto: alumno.nombreCompleto || `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`,
            cintaActualNombre: alumno.cintaActualNombre,
            claseNombre: alumno.claseNombre,
            totalRegistros: 0,
            totalPresente: 0,
            porcentaje: 0,
            elegible: false,
          });
        }
      }

      // Ordenar: no elegibles primero, luego por porcentaje ascendente
      resultados.sort((a, b) => {
        if (a.elegible !== b.elegible) return a.elegible ? 1 : -1;
        return a.porcentaje - b.porcentaje;
      });

      setExamenResultados(resultados);
      setExamenEvaluado(true);
      setExamenPagina(1);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al evaluar",
        text: "Ocurrió un error al evaluar la elegibilidad de los alumnos.",
        confirmButtonColor: "#d32f2f",
      });
    } finally {
      setExamenCargando(false);
    }
  };

  // Filtrar resultados del examen
  const examenResultadosFiltrados = examenResultados.filter((r) => {
    const coincideTexto = !examenFiltro || r.nombreCompleto.toLowerCase().includes(examenFiltro.toLowerCase());
    const coincideEstatus =
      examenFiltroEstatus === "" ||
      (examenFiltroEstatus === "elegible" && r.elegible) ||
      (examenFiltroEstatus === "no-elegible" && !r.elegible);
    return coincideTexto && coincideEstatus;
  });

  const examenTotalPaginas = Math.ceil(examenResultadosFiltrados.length / examenItemsPorPagina);
  const examenDatosPaginados = examenResultadosFiltrados.slice(
    (examenPagina - 1) * examenItemsPorPagina,
    examenPagina * examenItemsPorPagina
  );

  const totalElegibles = examenResultados.filter((r) => r.elegible).length;
  const totalNoElegibles = examenResultados.filter((r) => !r.elegible).length;

  // Componente para el botón de ordenamiento
  const BotonOrdenamiento = ({ campo, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {children}
      <IconButton
        size="small"
        onClick={() => manejarOrdenamiento(campo)}
        sx={{
          color: ordenarPor === campo ? '#DC143C' : 'rgba(255, 255, 255, 0.7)',
          padding: '4px',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#DC143C',
            backgroundColor: 'rgba(220, 20, 60, 0.1)',
          }
        }}
      >
        {ordenarPor === campo ? (
          ordenAscendente ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
        ) : (
          <ArrowUpward fontSize="small" sx={{ opacity: 0.5 }} />
        )}
      </IconButton>
    </Box>
  );

  return (
    <div className="socios-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <h1 className="page-title">Gestión de Alumnos</h1>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabActivo}
          onChange={(_, val) => setTabActivo(val)}
          sx={{
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg, #DC143C 0%, #B22222 100%)',
              height: '3px',
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              color: '#666',
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: '#DC143C',
              },
              '&:hover': {
                color: '#DC143C',
                backgroundColor: 'rgba(220, 20, 60, 0.04)',
              },
            },
          }}
        >
          <Tab label="Gestión" />
          <Tab label="Examen" icon={<School sx={{ fontSize: 20 }} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* ============ TAB GESTIÓN ============ */}
      {tabActivo === 0 && (
      <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
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
          Agregar Alumno
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Buscar por nombre, apellido o tutor..."
          variant="outlined"
          size="small"
          fullWidth
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
      </Box>

      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="filtros-content"
          id="filtros-header"
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList />
            <Typography>Filtros Avanzados</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 2,
            }}
          >
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstado}
                label="Estado"
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activos</MenuItem>
                <MenuItem value="false">Inactivos</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Cinta</InputLabel>
              <Select
                value={filtroCinta}
                label="Cinta"
                onChange={(e) => setFiltroCinta(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {cintas.map((cinta) => (
                  <MenuItem key={cinta.id} value={cinta.id}>
                    {cinta.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Clase/Horario</InputLabel>
              <Select
                value={filtroClase}
                label="Clase/Horario"
                onChange={(e) => setFiltroClase(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {clases.map((clase) => (
                  <MenuItem key={clase.id} value={clase.id}>
                    {clase.nombre} - {clase.dias}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Mensualidad</InputLabel>
              <Select
                value={filtroMensualidad}
                label="Mensualidad"
                onChange={(e) => setFiltroMensualidad(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {conceptos.map((concepto) => (
                  <MenuItem key={concepto.id} value={concepto.id}>
                    {concepto.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Edad Mínima"
              type="number"
              size="small"
              fullWidth
              value={filtroEdadMin}
              onChange={(e) => setFiltroEdadMin(e.target.value)}
              inputProps={{ min: 0, max: 100 }}
            />

            <TextField
              label="Edad Máxima"
              type="number"
              size="small"
              fullWidth
              value={filtroEdadMax}
              onChange={(e) => setFiltroEdadMax(e.target.value)}
              inputProps={{ min: 0, max: 100 }}
            />
          </Box>

          {(filtroEstado ||
            filtroCinta ||
            filtroClase ||
            filtroMensualidad ||
            filtroEdadMin ||
            filtroEdadMax) && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={limpiarTodosFiltros}
              >
                Limpiar Filtros
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

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
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    <BotonOrdenamiento campo="nombre">
                      Nombre Completo
                    </BotonOrdenamiento>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    <BotonOrdenamiento campo="edad">
                      Edad
                    </BotonOrdenamiento>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Cinta
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Clase
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Horario
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Tutor
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Teléfono Tutor
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    CURP
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Enfermedades
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Mensualidad
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Estado
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}
                    align="center"
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      No se encontraron alumnos
                    </TableCell>
                  </TableRow>
                ) : (
                  datosPaginados.map((alumno) => (
                    <TableRow
                      key={alumno.slug}
                      hover
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(220, 20, 60, 0.04)",
                          transform: "scale(1.001)",
                        }
                      }}
                    >
                      <TableCell>
                        {alumno.nombreCompleto || `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`}
                      </TableCell>
                      <TableCell>{alumno.edad} años</TableCell>
                      <TableCell>
                        <CintaChip nombreCinta={alumno.cintaActualNombre} />
                      </TableCell>
                      <TableCell>
                        {alumno.claseNombre || "Sin clase"}
                      </TableCell>
                      <TableCell>
                        {alumno.claseHorario || "-"}
                      </TableCell>
                      <TableCell>{alumno.nombreTutor}</TableCell>
                      <TableCell>{alumno.telefonoTutor || "N/A"}</TableCell>
                      <TableCell>{alumno.curp || "-"}</TableCell>
                      <TableCell>{alumno.enfermedades || "No"}</TableCell>
                      <TableCell>
                        {alumno.conceptoMensualidadNombre ? (
                          <Chip
                            label={alumno.conceptoMensualidadNombre}
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip label="Sin mensualidad" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alumno.activo ? "Activo" : "Inactivo"}
                          color={alumno.activo ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => abrirModalEditar(alumno)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outlined"
                            color={alumno.activo ? "error" : "success"}
                            size="small"
                            onClick={() =>
                              cambiarEstado(alumno.slug, !alumno.activo)
                            }
                          >
                            {alumno.activo ? "Desactivar" : "Activar"}
                          </Button>
                          {!alumno.activo && (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => eliminarPermanente(alumno)}
                              sx={{
                                background: "linear-gradient(135deg, #8B0000 0%, #5A0000 100%)",
                                "&:hover": {
                                  background: "linear-gradient(135deg, #B22222 0%, #8B0000 100%)",
                                },
                              }}
                            >
                              Eliminar
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

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

      <ModalCrearSocio
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        recargar={cargarSocios}
      />

      <ModalEditarSocio
        abierto={modalEditarAbierto}
        cerrar={() => setModalEditarAbierto(false)}
        recargar={cargarSocios}
        socio={socioEditar}
      />
      </>
      )}

      {/* ============ TAB EXAMEN ============ */}
      {tabActivo === 1 && (
        <Box className="examen-section">
          <Box className="examen-header">
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A1A', mb: 1 }}>
              Evaluación para Examen de Cambio de Cinta
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Selecciona el período a evaluar. Los alumnos con menos del {PORCENTAJE_MINIMO}% de asistencia
              <strong style={{ color: '#d32f2f' }}> no tendrán derecho a examen</strong>.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid rgba(220, 20, 60, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <TextField
                label="Fecha Inicio"
                type="date"
                size="small"
                value={examenFechaInicio}
                onChange={(e) => setExamenFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />
              <TextField
                label="Fecha Fin"
                type="date"
                size="small"
                value={examenFechaFin}
                onChange={(e) => setExamenFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 180 }}
              />
              <Button
                variant="contained"
                startIcon={examenCargando ? <CircularProgress size={18} color="inherit" /> : <School />}
                onClick={evaluarElegibilidad}
                disabled={examenCargando}
                sx={{
                  background: 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)',
                  boxShadow: '0 4px 12px rgba(220, 20, 60, 0.3)',
                  fontWeight: 700,
                  padding: '8px 24px',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%)',
                    boxShadow: '0 6px 20px rgba(220, 20, 60, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                  },
                }}
              >
                {examenCargando ? 'Evaluando...' : 'Evaluar Elegibilidad'}
              </Button>
            </Box>
          </Paper>

          {examenCargando && (
            <Box sx={{ width: '100%', mb: 3 }}>
              <LinearProgress
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(220, 20, 60, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #DC143C 0%, #B22222 100%)',
                    borderRadius: 3,
                  },
                }}
              />
              <Typography variant="body2" sx={{ color: '#999', mt: 1, textAlign: 'center' }}>
                Evaluando asistencias de los alumnos...
              </Typography>
            </Box>
          )}

          {examenEvaluado && !examenCargando && (
            <>
              {/* Resumen */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 3,
                  flexWrap: 'wrap',
                }}
              >
                <Paper
                  elevation={0}
                  className="examen-stat-card"
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    p: 2.5,
                    borderRadius: '16px',
                    border: '1px solid rgba(76, 175, 80, 0.2)',
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                    Elegibles para examen
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#4CAF50', mt: 0.5 }}>
                    {totalElegibles}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    ≥ {PORCENTAJE_MINIMO}% de asistencia
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  className="examen-stat-card"
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    p: 2.5,
                    borderRadius: '16px',
                    border: '1px solid rgba(211, 47, 47, 0.2)',
                    background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.05) 0%, rgba(211, 47, 47, 0.02) 100%)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                    No elegibles
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#d32f2f', mt: 0.5 }}>
                    {totalNoElegibles}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    &lt; {PORCENTAJE_MINIMO}% de asistencia
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  className="examen-stat-card"
                  sx={{
                    flex: 1,
                    minWidth: 200,
                    p: 2.5,
                    borderRadius: '16px',
                    border: '1px solid rgba(25, 118, 210, 0.2)',
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                    Total evaluados
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2', mt: 0.5 }}>
                    {examenResultados.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Alumnos activos
                  </Typography>
                </Paper>
              </Box>

              {/* Filtros de la tabla de examen */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Buscar alumno..."
                  variant="outlined"
                  size="small"
                  value={examenFiltro}
                  onChange={(e) => { setExamenFiltro(e.target.value); setExamenPagina(1); }}
                  sx={{ flex: 1, minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: examenFiltro && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setExamenFiltro("")} size="small">
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Estatus</InputLabel>
                  <Select
                    value={examenFiltroEstatus}
                    label="Estatus"
                    onChange={(e) => { setExamenFiltroEstatus(e.target.value); setExamenPagina(1); }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="elegible">Elegibles</MenuItem>
                    <MenuItem value="no-elegible">No elegibles</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Tabla de resultados */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(220, 20, 60, 0.1)',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{
                      background: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #DC143C 0%, #B22222 50%, #8B0000 100%)',
                      }
                    }}>
                      <TableCell sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                        Nombre Completo
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                        Cinta Actual
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                        Clase
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }} align="center">
                        Asistencias
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px', minWidth: 180 }}>
                        % Asistencia
                      </TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }} align="center">
                        Estatus
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examenDatosPaginados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#999' }}>
                          No se encontraron resultados
                        </TableCell>
                      </TableRow>
                    ) : (
                      examenDatosPaginados.map((resultado) => (
                        <TableRow
                          key={resultado.id}
                          hover
                          sx={{
                            transition: 'all 0.2s ease',
                            backgroundColor: resultado.elegible ? 'transparent' : 'rgba(211, 47, 47, 0.03)',
                            '&:hover': {
                              backgroundColor: resultado.elegible
                                ? 'rgba(76, 175, 80, 0.06)'
                                : 'rgba(211, 47, 47, 0.08)',
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>
                            {resultado.nombreCompleto}
                          </TableCell>
                          <TableCell>
                            <CintaChip nombreCinta={resultado.cintaActualNombre} />
                          </TableCell>
                          <TableCell>
                            {resultado.claseNombre || 'Sin clase'}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {resultado.totalPresente} / {resultado.totalRegistros}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={`${resultado.porcentaje}% — Mínimo requerido: ${PORCENTAJE_MINIMO}%`} arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(resultado.porcentaje, 100)}
                                    sx={{
                                      height: 10,
                                      borderRadius: 5,
                                      backgroundColor: 'rgba(0,0,0,0.08)',
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 5,
                                        background: resultado.porcentaje >= PORCENTAJE_MINIMO
                                          ? 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)'
                                          : resultado.porcentaje >= 50
                                            ? 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)'
                                            : 'linear-gradient(90deg, #d32f2f 0%, #ef5350 100%)',
                                        transition: 'width 1s ease-in-out',
                                      },
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    minWidth: 48,
                                    textAlign: 'right',
                                    color: resultado.porcentaje >= PORCENTAJE_MINIMO
                                      ? '#4CAF50'
                                      : resultado.porcentaje >= 50
                                        ? '#FF9800'
                                        : '#d32f2f',
                                  }}
                                >
                                  {resultado.porcentaje}%
                                </Typography>
                              </Box>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={resultado.elegible ? 'Elegible' : 'No elegible'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                ...(resultado.elegible
                                  ? {
                                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                                      color: 'white',
                                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                                    }
                                  : {
                                      background: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
                                      color: 'white',
                                      boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
                                    }),
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {examenTotalPaginas > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={examenTotalPaginas}
                    page={examenPagina}
                    onChange={(_, val) => setExamenPagina(val)}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderRadius: '10px',
                        transition: 'all 0.3s ease',
                      },
                      '& .MuiPaginationItem-root.Mui-selected': {
                        background: 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(220, 20, 60, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%)',
                        },
                      },
                      '& .MuiPaginationItem-root:hover': {
                        backgroundColor: 'rgba(220, 20, 60, 0.1)',
                      }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </div>
  );
}
