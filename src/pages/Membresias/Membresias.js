/** @module pages/Membresias */
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
  InputAdornment,
  IconButton,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Divider,
  Tooltip,
} from "@mui/material";
import { Search, Clear, Add, Category } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import ModalMembresia from "../../Components/modals/ModalMembresia";
import ModalTipoConcepto from "../../Components/modals/ModalTipoConcepto";
import "./Membresias.css";

// ─────────────────────────────────────────────────────────────
// Sub-página: Conceptos (Membresías)
// ─────────────────────────────────────────────────────────────

/**
 * Sección de la tabla de conceptos de cobro con filtros y paginación.
 * @component
 */
function SeccionConceptos() {
  const [membresias, setMembresias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtrados, setFiltrados] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [membresiaEditar, setMembresiaEditar] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [pagina, setPagina] = useState(1);
  const itemsPorPagina = 10;

  const cargarMembresias = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await api.get("/conceptos");
      setMembresias(res.data || []);
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al cargar las membresías.";
      if (error.response) {
        mensajeError = "Error al cargar las membresías del servidor.";
      } else if (error.request) {
        mensajeError = "No se pudo conectar con el servidor. Verifica tu conexión.";
      }
      setError(mensajeError);
      Swal.fire({
        icon: "error",
        title: "Error al cargar membresías",
        text: mensajeError,
        confirmButtonColor: "#d32f2f",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMembresias();
  }, []);

  useEffect(() => {
    let datosFiltrados = membresias;
    if (filtro) {
      datosFiltrados = datosFiltrados.filter(
        (m) =>
          m.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
          (m.descripcion &&
            m.descripcion.toLowerCase().includes(filtro.toLowerCase()))
      );
    }
    if (tipoFiltro !== "Todos") {
      datosFiltrados = datosFiltrados.filter(
        (m) => m.tipoConcepto === tipoFiltro
      );
    }
    if (estadoFiltro !== "Todos") {
      datosFiltrados = datosFiltrados.filter((m) =>
        estadoFiltro === "Activos" ? m.activo : !m.activo
      );
    }
    setFiltrados(datosFiltrados);
    setPagina(1);
  }, [filtro, membresias, tipoFiltro, estadoFiltro]);

  const tiposUnicos = ["Todos", ...new Set(membresias.map((m) => m.tipoConcepto))];
  const indiceInicio = (pagina - 1) * itemsPorPagina;
  const datosPaginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina);
  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);

  const abrirModalEditar = (membresia) => {
    setMembresiaEditar(membresia);
    setModalEditarAbierto(true);
  };

  const confirmarEliminar = (membresia) => {
    Swal.fire({
      title: "¿Eliminar concepto?",
      text: `¿Estás seguro de eliminar "${membresia.nombre}"? Esta acción solo desactivará el concepto.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#666",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/conceptos/${membresia.slug}`);
          Swal.fire({
            icon: "success",
            title: "Concepto eliminado",
            text: "El concepto se ha desactivado exitosamente",
            confirmButtonColor: "#d32f2f",
          });
          cargarMembresias();
        } catch (error) {
          let mensajeError = "No se pudo eliminar el concepto";
          if (error.response?.status === 404) mensajeError = "Concepto no encontrado";
          else if (error.response?.status === 400)
            mensajeError = error.response.data?.mensaje || "No se puede eliminar el concepto";
          Swal.fire({ icon: "error", title: "Error", text: mensajeError, confirmButtonColor: "#d32f2f" });
        }
      }
    });
  };

  return (
    <>
      {/* Barra de filtros */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
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
          Nuevo Concepto
        </Button>
      </Box>

      <Paper elevation={2} sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              placeholder="Buscar concepto por nombre o descripción..."
              variant="outlined"
              size="small"
              fullWidth
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><Search /></InputAdornment>
                ),
                endAdornment: filtro && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setFiltro("")} edge="end" size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFiltro}
                label="Estado"
                onChange={(e) => setEstadoFiltro(e.target.value)}
              >
                <MenuItem value="Todos">Todos</MenuItem>
                <MenuItem value="Activos">Activos</MenuItem>
                <MenuItem value="Inactivos">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Chip
              label={`${filtrados.length} concepto${filtrados.length !== 1 ? "s" : ""}`}
              color="primary"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs por tipo */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tipoFiltro}
          onChange={(_, v) => setTipoFiltro(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .Mui-selected": { color: "#d32f2f !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#d32f2f" },
          }}
        >
          {tiposUnicos.map((tipo) => (
            <Tab key={tipo} label={tipo} value={tipo} />
          ))}
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
                <TableRow
                  sx={{
                    background: "linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)",
                    "& th": {
                      color: "white",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      letterSpacing: "0.5px",
                    },
                  }}
                >
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No se encontraron conceptos
                    </TableCell>
                  </TableRow>
                ) : (
                  datosPaginados.map((membresia) => (
                    <TableRow
                      key={membresia.slug}
                      hover
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(220, 20, 60, 0.04)",
                          transform: "scale(1.001)",
                        },
                      }}
                    >
                      <TableCell>{membresia.nombre}</TableCell>
                      <TableCell>
                        <Chip label={membresia.tipoConcepto} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>${membresia.precio.toLocaleString("es-MX")}</TableCell>
                      <TableCell>{membresia.descripcion || "Sin descripción"}</TableCell>
                      <TableCell>
                        <Chip
                          label={membresia.activo ? "Activo" : "Inactivo"}
                          color={membresia.activo ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => abrirModalEditar(membresia)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => confirmarEliminar(membresia)}
                          >
                            Eliminar
                          </Button>
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
                onChange={(_, val) => setPagina(val)}
                sx={{
                  "& .MuiPaginationItem-root.Mui-selected": {
                    background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                    color: "white",
                    boxShadow: "0 4px 12px rgba(220, 20, 60, 0.3)",
                  },
                  "& .MuiPaginationItem-root:hover": {
                    backgroundColor: "rgba(220, 20, 60, 0.1)",
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      <ModalMembresia
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        recargar={cargarMembresias}
      />
      <ModalMembresia
        abierto={modalEditarAbierto}
        cerrar={() => setModalEditarAbierto(false)}
        recargar={cargarMembresias}
        modo="editar"
        membresia={membresiaEditar}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Sub-página: Tipos de Concepto
// ─────────────────────────────────────────────────────────────

/**
 * Sección de gestión del catálogo de tipos de concepto de cobro.
 * @component
 */
function SeccionTiposConcepto() {
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [tipoEditar, setTipoEditar] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  const cargarTipos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await api.get("/tipos-concepto");
      setTipos(res.data || []);
    } catch (err) {
      setError("No se pudieron cargar los tipos de concepto.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  const tiposFiltrados = tipos.filter((t) => {
    if (estadoFiltro === "Activos") return t.activo;
    if (estadoFiltro === "Inactivos") return !t.activo;
    return true;
  });

  const abrirModalEditar = (tipo) => {
    setTipoEditar(tipo);
    setModalEditarAbierto(true);
  };

  const confirmarEliminar = (tipo) => {
    Swal.fire({
      title: "¿Desactivar tipo?",
      html: `¿Estás seguro de desactivar <strong>"${tipo.nombre}"</strong>?<br/>
             <small>El tipo no se eliminará, solo quedará inactivo y no aparecerá en los listados de nuevos conceptos.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#666",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/tipos-concepto/${tipo.id}`);
          Swal.fire({
            icon: "success",
            title: "Tipo desactivado",
            text: `"${tipo.nombre}" fue desactivado exitosamente`,
            confirmButtonColor: "#d32f2f",
          });
          cargarTipos();
        } catch (err) {
          const msg =
            err.response?.data?.mensaje || "No se pudo desactivar el tipo de concepto";
          Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: "#d32f2f" });
        }
      }
    });
  };

  const reactivarTipo = async (tipo) => {
    try {
      await api.put(`/tipos-concepto/${tipo.id}`, {
        id: tipo.id,
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        orden: tipo.orden,
        activo: true,
      });
      Swal.fire({
        icon: "success",
        title: "Tipo activado",
        text: `"${tipo.nombre}" fue reactivado exitosamente`,
        confirmButtonColor: "#d32f2f",
      });
      cargarTipos();
    } catch (err) {
      const msg =
        err.response?.data?.mensaje || "No se pudo reactivar el tipo de concepto";
      Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: "#d32f2f" });
    }
  };

  return (
    <>
      {/* Encabezado de sección */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Category sx={{ color: "#d32f2f" }} />
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Catálogo de Tipos de Concepto
            </span>
          </Box>
          <span style={{ fontSize: "0.85rem", color: "#666" }}>
            Administra las categorías que clasifican los conceptos de cobro de la academia.
          </span>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalAbierto(true)}
          id="btn-nuevo-tipo-concepto"
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
          Nuevo Tipo
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Filtro de estado */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={estadoFiltro}
            label="Estado"
            onChange={(e) => setEstadoFiltro(e.target.value)}
            id="filtro-estado-tipos"
          >
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Activos">Activos</MenuItem>
            <MenuItem value="Inactivos">Inactivos</MenuItem>
          </Select>
        </FormControl>
        <Chip
          label={`${tiposFiltrados.length} tipo${tiposFiltrados.length !== 1 ? "s" : ""}`}
          color="primary"
          variant="outlined"
          size="small"
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cargando ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
              <TableRow
                sx={{
                  background: "linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)",
                  "& th": {
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    letterSpacing: "0.5px",
                  },
                }}
              >
                <TableCell sx={{ width: 60 }}>Orden</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tiposFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: "#999" }}>
                    No se encontraron tipos de concepto
                  </TableCell>
                </TableRow>
              ) : (
                tiposFiltrados.map((tipo) => (
                  <TableRow
                    key={tipo.id}
                    hover
                    sx={{
                      opacity: tipo.activo ? 1 : 0.65,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(220, 20, 60, 0.04)",
                        transform: "scale(1.001)",
                      },
                    }}
                  >
                    <TableCell>
                      <Chip label={tipo.orden} size="small" variant="outlined" sx={{ minWidth: 40 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{tipo.nombre}</TableCell>
                    <TableCell sx={{ color: "#666", fontSize: "0.9rem" }}>
                      {tipo.descripcion || <em style={{ color: "#bbb" }}>Sin descripción</em>}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tipo.activo ? "Activo" : "Inactivo"}
                        color={tipo.activo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Tooltip title="Editar tipo">
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => abrirModalEditar(tipo)}
                            id={`btn-editar-tipo-${tipo.id}`}
                          >
                            Editar
                          </Button>
                        </Tooltip>
                        {tipo.activo ? (
                          <Tooltip title="Desactivar (borrado lógico)">
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => confirmarEliminar(tipo)}
                              id={`btn-desactivar-tipo-${tipo.id}`}
                            >
                              Desactivar
                            </Button>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Reactivar tipo">
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              onClick={() => reactivarTipo(tipo)}
                              id={`btn-reactivar-tipo-${tipo.id}`}
                            >
                              Activar
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ModalTipoConcepto
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        recargar={cargarTipos}
        modo="crear"
      />
      <ModalTipoConcepto
        abierto={modalEditarAbierto}
        cerrar={() => setModalEditarAbierto(false)}
        recargar={cargarTipos}
        modo="editar"
        tipo={tipoEditar}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Página principal: Membresias (con pestañas)
// ─────────────────────────────────────────────────────────────

/**
 * Página de Gestión de Conceptos con dos pestañas:
 * - Conceptos: CRUD de conceptos de cobro.
 * - Tipos de Concepto: catálogo administrable de tipos.
 * @component
 * @returns {JSX.Element}
 */
export default function Membresias() {
  const [paginaActiva, setPaginaActiva] = useState("conceptos");

  return (
    <div className="membresias-container">
      {/* Encabezado */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <h1 className="page-title">Gestión de Conceptos</h1>
      </Box>

      {/* Pestañas principales */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={paginaActiva}
          onChange={(_, v) => setPaginaActiva(v)}
          sx={{
            "& .Mui-selected": { color: "#d32f2f !important", fontWeight: 700 },
            "& .MuiTabs-indicator": { backgroundColor: "#d32f2f" },
          }}
        >
          <Tab
            label="Conceptos"
            value="conceptos"
            id="tab-conceptos"
            sx={{ fontWeight: 600 }}
          />
          <Tab
            label="Tipos de Concepto"
            value="tipos"
            id="tab-tipos-concepto"
            icon={<Category fontSize="small" />}
            iconPosition="start"
            sx={{ fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Contenido según pestaña activa */}
      {paginaActiva === "conceptos" && <SeccionConceptos />}
      {paginaActiva === "tipos" && <SeccionTiposConcepto />}
    </div>
  );
}
