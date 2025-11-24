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
} from "@mui/material";
import { Search, Clear, CheckCircle } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { obtenerClases } from "../../services/clasesService";
import ModalPasarLista from "../../Components/modals/ModalPasarLista";
import "./Asistencia.css";

export default function Asistencia() {
  const [clases, setClases] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [filtrados, setFiltrados] = useState([]);
  const [modalPasarListaAbierto, setModalPasarListaAbierto] = useState(false);
  const [clasePasarLista, setClasePasarLista] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const itemsPorPagina = 10;

  const cargarClases = async () => {
    setCargando(true);
    setError(null);

    try {
      const data = await obtenerClases();
      setClases(data || []);
    } catch (error) {
      let mensajeError = "Ocurrió un error inesperado al cargar las clases.";

      if (error.response) {
        if (error.response.status === 401) {
          mensajeError = "Sesión expirada. Por favor, inicia sesión nuevamente.";
        } else if (error.response.status === 500) {
          mensajeError = "Error del servidor. Intenta nuevamente más tarde.";
        }
      } else if (error.request) {
        mensajeError =
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }

      setError(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClases();
  }, []);

  useEffect(() => {
    const datosFiltrados = clases.filter((c) =>
      [c.nombre, c.dias, c.tipoClase]
        .join(" ")
        .toLowerCase()
        .includes(filtro.toLowerCase())
    );
    setFiltrados(datosFiltrados);
    setPagina(1);
  }, [filtro, clases]);

  const indiceInicio = (pagina - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const datosPaginados = filtrados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);

  const abrirModalPasarLista = (clase) => {
    setClasePasarLista(clase);
    setModalPasarListaAbierto(true);
  };

  const limpiarFiltro = () => {
    setFiltro("");
  };

  return (
    <div className="asistencia-container">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <h1 className="page-title">Asistencia de Clases</h1>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Buscar por nombre, días o tipo..."
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
                <IconButton onClick={limpiarFiltro} size="small">
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cargando ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
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
                    Días
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Horario
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Cupo
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                    Tipo
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
                    <TableCell colSpan={7} align="center">
                      No se encontraron clases
                    </TableCell>
                  </TableRow>
                ) : (
                  datosPaginados.map((clase) => (
                    <TableRow
                      key={clase.slug}
                      hover
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(220, 20, 60, 0.04)",
                          transform: "scale(1.001)",
                        }
                      }}
                    >
                      <TableCell>{clase.nombre}</TableCell>
                      <TableCell>{clase.dias}</TableCell>
                      <TableCell>
                        {clase.horaInicio} - {clase.horaFin}
                      </TableCell>
                      <TableCell>
                        {clase.alumnosInscritos || 0} / {clase.cupoMaximo}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={clase.tipoClase}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={clase.activo ? "Activo" : "Inactivo"}
                          color={clase.activo ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => abrirModalPasarLista(clase)}
                          sx={{
                            background: "linear-gradient(135deg, #DC143C 0%, #B22222 100%)",
                            boxShadow: "0 4px 12px rgba(220, 20, 60, 0.3)",
                            fontWeight: 600,
                            borderRadius: "10px",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: "linear-gradient(135deg, #FF6B6B 0%, #DC143C 100%)",
                              boxShadow: "0 6px 16px rgba(220, 20, 60, 0.4)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          Pasar Lista
                        </Button>
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
                onChange={(_, value) => setPagina(value)}
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

      <ModalPasarLista
        abierto={modalPasarListaAbierto}
        cerrar={() => {
          setModalPasarListaAbierto(false);
          setClasePasarLista(null);
        }}
        clase={clasePasarLista}
      />
    </div>
  );
}
