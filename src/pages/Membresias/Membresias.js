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
  Typography,
} from "@mui/material";
import { Search, Clear, Add, Category, DragIndicator, Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Swal from "sweetalert2";
import api from "../../services/api";
import ModalMembresia from "../../Components/modals/ModalMembresia";
import ModalTipoConcepto from "../../Components/modals/ModalTipoConcepto";
import "./Membresias.css";

// ─────────────────────────────────────────────────────────────
// Tab draggable para tipos de concepto
// ─────────────────────────────────────────────────────────────

function TrashDropZone() {
  const { isOver, setNodeRef } = useDroppable({ id: "trash" });
  return (
    <Box
      ref={setNodeRef}
      sx={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2.5,
        py: 1.5,
        mx: 1,
        borderRadius: "10px",
        border: isOver ? "2px dashed #d32f2f" : "2px dashed #ddd",
        backgroundColor: isOver ? "rgba(211,47,47,0.08)" : "transparent",
        color: isOver ? "#d32f2f" : "#bbb",
        transition: "all 0.2s",
        userSelect: "none",
        fontSize: "0.8rem",
        fontWeight: 600,
        letterSpacing: "0.3px",
        minWidth: isOver ? 180 : 52,
      }}
    >
      <Delete sx={{ fontSize: 22 }} />
      {isOver && <span>Soltar para eliminar</span>}
    </Box>
  );
}

function SortableTabItem({ tipo, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tipo.id });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 2.5,
        py: 1.5,
        cursor: "pointer",
        borderBottom: selected ? "2px solid #d32f2f" : "2px solid transparent",
        color: selected ? "#d32f2f" : "#555",
        fontWeight: selected ? 700 : 500,
        fontSize: "0.875rem",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none",
        flexShrink: 0,
        transition: "color 0.2s, border-color 0.2s",
        "&:hover": { color: "#d32f2f" },
      }}
    >
      <Box {...attributes} {...listeners} sx={{ cursor: "grab", display: "flex", color: "#ccc", "&:active": { cursor: "grabbing" } }}>
        <DragIndicator sx={{ fontSize: 18 }} />
      </Box>
      <Box onClick={onSelect}>{tipo.nombre}</Box>
    </Box>
  );
}

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
  const [tiposConcepto, setTiposConcepto] = useState([]);
  const itemsPorPagina = 10;

  const sensorsTabs = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const cargarTiposConcepto = async () => {
    try {
      const res = await api.get("/tipos-concepto", { params: { activo: true } });
      const datos = (res.data || []).sort((a, b) => a.orden - b.orden);
      setTiposConcepto(datos);
    } catch {
      // silencioso: los tabs quedarán vacíos
    }
  };

  const handleDragEndTabs = async ({ active, over }) => {
    if (!over) return;

    if (over.id === "trash") {
      const tipo = tiposConcepto.find((t) => t.id === active.id);
      if (tipo) confirmarEliminarTipo(tipo);
      return;
    }

    if (active.id === over.id) return;
    const oldIndex = tiposConcepto.findIndex((t) => t.id === active.id);
    const newIndex = tiposConcepto.findIndex((t) => t.id === over.id);
    const nuevo = arrayMove(tiposConcepto, oldIndex, newIndex);
    setTiposConcepto(nuevo);
    try {
      await api.patch("/tipos-concepto/reordenar", nuevo.map((t, i) => ({ id: t.id, orden: i })));
    } catch {
      cargarTiposConcepto();
    }
  };

  const confirmarEliminarTipo = (tipo) => {
    Swal.fire({
      title: `¿Eliminar tipo "${tipo.nombre}"?`,
      html: `<b>Se eliminarán permanentemente todos los conceptos asociados a este tipo.</b><br/>Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#666",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/tipos-concepto/${tipo.id}/eliminar`);
          if (tipoFiltro === tipo.nombre) setTipoFiltro("Todos");
          await cargarTiposConcepto();
          await cargarMembresias();
          Swal.fire({ icon: "success", title: "Tipo eliminado", text: `"${tipo.nombre}" fue eliminado correctamente.`, confirmButtonColor: "#d32f2f" });
        } catch (err) {
          const msg = err.response?.data?.mensaje || "No se pudo eliminar el tipo de concepto.";
          Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: "#d32f2f" });
        }
      }
    });
  };

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
    cargarTiposConcepto();
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
        (m) => m.tipoConcepto?.toLowerCase() === tipoFiltro.toLowerCase()
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

      {/* Tabs por tipo con drag-and-drop */}
      <DndContext sensors={sensorsTabs} collisionDetection={closestCenter} onDragEnd={handleDragEndTabs}>
        <Box sx={{ borderBottom: "1px solid #e0e0e0", mb: 3, display: "flex", alignItems: "center" }}>
          {/* Área scrollable de tabs */}
          <Box sx={{ display: "flex", alignItems: "center", flex: 1, overflow: "hidden" }}>
            {/* Tab fijo "Todos" */}
            <Box
              onClick={() => setTipoFiltro("Todos")}
              sx={{
                px: 2.5, py: 1.5, cursor: "pointer", flexShrink: 0,
                borderBottom: tipoFiltro === "Todos" ? "2px solid #d32f2f" : "2px solid transparent",
                color: tipoFiltro === "Todos" ? "#d32f2f" : "#555",
                fontWeight: tipoFiltro === "Todos" ? 700 : 500,
                fontSize: "0.875rem", letterSpacing: "0.5px", textTransform: "uppercase",
                userSelect: "none", transition: "color 0.2s, border-color 0.2s",
                "&:hover": { color: "#d32f2f" },
              }}
            >
              TODOS
            </Box>
            <SortableContext items={tiposConcepto.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
              {tiposConcepto.map((tipo) => (
                <SortableTabItem
                  key={tipo.id}
                  tipo={tipo}
                  selected={tipoFiltro === tipo.nombre}
                  onSelect={() => setTipoFiltro(tipo.nombre)}
                />
              ))}
            </SortableContext>
          </Box>
          {/* Bote fijo a la derecha, siempre visible */}
          <TrashDropZone />
        </Box>
      </DndContext>

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

function FilaTipoConcepto({ tipo, onEditar, onEliminar }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tipo.id });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: "12px",
        border: "1px solid rgba(220,20,60,0.1)",
        mb: 1,
        backgroundColor: isDragging ? "rgba(220,20,60,0.04)" : "white",
        boxShadow: isDragging ? "0 4px 16px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.05)",
        opacity: tipo.activo ? 1 : 0.55,
        transition: "box-shadow 0.2s",
      }}
    >
      <Box {...attributes} {...listeners} sx={{ cursor: "grab", color: "#bbb", display: "flex", "&:active": { cursor: "grabbing" } }}>
        <DragIndicator />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{tipo.nombre}</span>
          <Chip
            label={tipo.activo ? "Activo" : "Inactivo"}
            color={tipo.activo ? "success" : "default"}
            size="small"
          />
        </Box>
        {tipo.descripcion && (
          <span style={{ fontSize: "0.82rem", color: "#888" }}>{tipo.descripcion}</span>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => onEditar(tipo)} sx={{ color: "#1976d2" }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton size="small" onClick={() => onEliminar(tipo)} sx={{ color: "#d32f2f" }}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function SeccionTiposConcepto() {
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [tipoEditar, setTipoEditar] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
      title: `¿Eliminar "${tipo.nombre}"?`,
      html: `<b style="color:#d32f2f">⚠️ Advertencia:</b> Esta acción es permanente.<br/><br/>
             Los conceptos de cobro que usen este tipo <b>quedarán sin categoría</b>.<br/>
             <small style="color:#888">Esta acción no se puede deshacer.</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#666",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/tipos-concepto/${tipo.id}/eliminar`);
          Swal.fire({ icon: "success", title: "Eliminado", text: `"${tipo.nombre}" fue eliminado`, confirmButtonColor: "#d32f2f" });
          cargarTipos();
        } catch (err) {
          const msg = err.response?.data?.mensaje || "No se pudo eliminar el tipo de concepto";
          Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonColor: "#d32f2f" });
        }
      }
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const tiposFiltrados = tipos.filter((t) => {
      if (estadoFiltro === "Activos") return t.activo;
      if (estadoFiltro === "Inactivos") return !t.activo;
      return true;
    });

    const oldIndex = tiposFiltrados.findIndex((t) => t.id === active.id);
    const newIndex = tiposFiltrados.findIndex((t) => t.id === over.id);
    const reordenados = arrayMove(tiposFiltrados, oldIndex, newIndex);

    const actualizados = reordenados.map((t, i) => ({ ...t, orden: i }));
    const noFiltrados = tipos.filter((t) => !tiposFiltrados.find((tf) => tf.id === t.id));
    setTipos([...actualizados, ...noFiltrados]);

    try {
      await api.patch("/tipos-concepto/reordenar", actualizados.map((t) => ({ id: t.id, orden: t.orden })));
    } catch {
      cargarTipos();
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
      ) : tiposFiltrados.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
          No se encontraron tipos de concepto
        </Box>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tiposFiltrados.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tiposFiltrados.map((tipo) => (
              <FilaTipoConcepto
                key={tipo.id}
                tipo={tipo}
                onEditar={abrirModalEditar}
                onEliminar={confirmarEliminar}
              />
            ))}
          </SortableContext>
        </DndContext>
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
