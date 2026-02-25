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
} from "@mui/material";
import { Search, Clear, Add } from "@mui/icons-material";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import ModalCrearMembresia from "../../Components/modals/ModalCrearMembresia";
import ModalEditarMembresia from "../../Components/modals/ModalEditarMembresia";
import "./Membresias.css";

/**
 * Página de Gestión de Conceptos (Membresías). Permite crear, editar, activar/desactivar
 * y filtrar conceptos de pago por nombre, tipo y estado.
 * @component
 * @returns {JSX.Element} Tabla de conceptos con filtros avanzados y opciones de CRUD.
 */
export default function Membresias() {
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
        mensajeError =
          "No se pudo conectar con el servidor. Verifica tu conexión.";
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

    // Filtro por texto
    if (filtro) {
      datosFiltrados = datosFiltrados.filter((m) =>
        m.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        (m.descripcion && m.descripcion.toLowerCase().includes(filtro.toLowerCase()))
      );
    }

    // Filtro por tipo
    if (tipoFiltro !== "Todos") {
      datosFiltrados = datosFiltrados.filter((m) => m.tipoConcepto === tipoFiltro);
    }

    // Filtro por estado
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
  const indiceFin = indiceInicio + itemsPorPagina;
  const datosPaginados = filtrados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);

  const cambiarEstado = async (slug, nuevoEstado) => {
    try {
      if (nuevoEstado) {
        // Activar
        await api.put(`/conceptos/${slug}`, {
          ...membresias.find((m) => m.slug === slug),
          activo: nuevoEstado,
        });
      } else {
        // Desactivar
        await api.delete(`/conceptos/${slug}`);
      }

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `Membresía ${nuevoEstado ? "activada" : "desactivada"} exitosamente`,
        confirmButtonColor: "#d32f2f",
      });

      cargarMembresias();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cambiar el estado de la membresía",
        confirmButtonColor: "#d32f2f",
      });
    }
  };

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

          if (error.response?.status === 404) {
            mensajeError = "Concepto no encontrado";
          } else if (error.response?.status === 400) {
            mensajeError = error.response.data?.mensaje || "No se puede eliminar el concepto";
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

  return (
    <div className="membresias-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <h1 className="page-title">Gestión de Conceptos</h1>
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
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${filtrados.length} concepto${filtrados.length !== 1 ? 's' : ''}`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tipoFiltro}
          onChange={(e, newValue) => setTipoFiltro(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              minWidth: 100,
            },
            "& .Mui-selected": {
              color: "#d32f2f !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#d32f2f",
            },
          }}
        >
          {tiposUnicos.map((tipo) => (
            <Tab key={tipo} label={tipo} value={tipo} />
          ))}
        </Tabs>
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
                    Nombre
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Precio
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Descripción
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
                        }
                      }}
                    >
                      <TableCell>{membresia.nombre}</TableCell>
                      <TableCell>
                        <Chip
                          label={membresia.tipoConcepto}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        ${membresia.precio.toLocaleString("es-MX")}
                      </TableCell>
                      <TableCell>
                        {membresia.descripcion || "Sin descripción"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={membresia.activo ? "Activo" : "Inactivo"}
                          color={membresia.activo ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
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

      <ModalCrearMembresia
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        recargar={cargarMembresias}
      />

      <ModalEditarMembresia
        abierto={modalEditarAbierto}
        cerrar={() => setModalEditarAbierto(false)}
        recargar={cargarMembresias}
        membresia={membresiaEditar}
      />
    </div>
  );
}
