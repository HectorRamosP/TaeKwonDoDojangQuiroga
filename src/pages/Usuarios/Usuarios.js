/** @module pages/Usuarios */
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
import { Search, Clear } from "@mui/icons-material";
import { useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { useLista } from "../../hooks/useLista";
import ModalUsuario from "../../Components/modals/ModalUsuario";
import "./Usuarios.css";

/**
 * Página de Gestión de Usuarios del sistema. Permite crear, editar y deshabilitar
 * cuentas de acceso con búsqueda y paginación.
 * @component
 * @returns {JSX.Element} Tabla de usuarios con operaciones de administración.
 */
export default function Usuarios() {
  const {
    filtro, setFiltro,
    pagina, setPagina,
    cargando, error,
    datosPaginados: usuariosPaginados,
    filtrados,
    totalPaginas,
    recargar: cargarUsuarios,
  } = useLista(
    () => api.get("/usuarios").then((r) => r.data),
    (u) => [u.nombre, u.apellidoPaterno, u.apellidoMaterno, u.nombreUsuario],
    5
  );

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
 
  const abrirEditar = (usuario) => {
    setUsuarioEditar(usuario);
    setModalEditarAbierto(true);
  };

  const eliminarUsuario = async (usuario) => {
    const resultado = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se deshabilitará al usuario ${usuario.nombre} ${usuario.apellidoPaterno}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#757575",
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!resultado.isConfirmed) return;

    try {
      await api.patch(`/usuarios/${usuario.slug}`, {
        slug: usuario.slug,
        habilitado: false,
      });

      await Swal.fire({
        icon: "success",
        title: "Usuario deshabilitado",
        text: "El usuario ha sido deshabilitado correctamente",
        confirmButtonColor: "#d32f2f",
        timer: 2000,
        timerProgressBar: true,
      });

      cargarUsuarios();
    } catch (error) {
      let mensajeError = "Ocurrió un error al deshabilitar el usuario";
      
      if (error.response) {
        if (error.response.status === 404) {
          mensajeError = "Usuario no encontrado";
        } else {
          mensajeError = "Error al deshabilitar el usuario en el servidor";
        }
      } else if (error.request) {
        mensajeError = "No se pudo conectar con el servidor. Verifica tu conexión.";
      }
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
        confirmButtonColor: "#d32f2f",
      });
    }
  };

  const limpiarFiltro = () => {
    setFiltro("");
  };

  const recargarDatos = async () => {
    await cargarUsuarios();
    Swal.fire({
      icon: "success",
      title: "Datos actualizados",
      text: "Los datos se han recargado correctamente",
      confirmButtonColor: "#d32f2f",
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  if (cargando) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <p>Cargando usuarios...</p>
      </Box>
    );
  }

  return (
    <div className="page-container">
      <div className="header">
        <h1>Usuarios</h1>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            color="primary"
            onClick={recargarDatos}
          >
            Recargar
          </Button>
          <Button
            variant="contained"
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
            Nuevo
          </Button>
        </Box>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <div className="search-bar">
        <TextField
          label="Buscar por nombre o usuario"
          variant="outlined"
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
      </div>

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
              }}
            >
              <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                Nombre
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                Apellido Paterno
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                Apellido Materno
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                Usuario
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                Estado
              </TableCell>
              <TableCell align="center" sx={{ color: "white", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosPaginados.map((u) => (
              <TableRow
                key={u.slug}
                hover
                sx={{
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(220, 20, 60, 0.04)",
                    transform: "scale(1.001)",
                  }
                }}
              >
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.apellidoPaterno}</TableCell>
                <TableCell>{u.apellidoMaterno}</TableCell>
                <TableCell>{u.nombreUsuario}</TableCell>
                <TableCell>
                  <Chip
                    label={u.habilitado ? "Habilitado" : "Deshabilitado"}
                    color={u.habilitado ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center" className="actions-cell">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => abrirEditar(u)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => eliminarUsuario(u)}
                    disabled={!u.habilitado}
                  >
                    Deshabilitar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {usuariosPaginados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {filtro
                    ? "No se encontraron usuarios con ese criterio de búsqueda"
                    : "No hay usuarios registrados"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="pagination-container">
        <Pagination
          count={totalPaginas}
          page={pagina}
          onChange={(e, value) => setPagina(value)}
          showFirstButton
          showLastButton
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
      </div>

      <ModalUsuario
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        recargar={cargarUsuarios}
      />
      <ModalUsuario
        abierto={modalEditarAbierto}
        cerrar={() => setModalEditarAbierto(false)}
        recargar={cargarUsuarios}
        modo="editar"
        usuario={usuarioEditar}
      />
    </div>
  );
}