/** @module components/modals/ModalVerAlumnosClase */
import {
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
  Box,
  Typography,
} from "@mui/material";
import { Group, Visibility } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import CintaChip from "../CintaChip";
import ModernModal from "./ModernModal";

/**
 * Modal que muestra la lista de alumnos inscritos en una clase específica.
 * Incluye información de horario, tipo de clase y tabla con datos de cada alumno.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.cerrar - Callback para cerrar el modal.
 * @param {object} props.clase - Datos de la clase cuyos alumnos se van a visualizar.
 */
export default function ModalVerAlumnosClase({ abierto, cerrar, clase }) {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (abierto && clase) {
      cargarAlumnos();
    }
  }, [abierto, clase]);

  const cargarAlumnos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await api.get(`/alumnos?claseId=${clase.id}&activo=true`);
      setAlumnos(res.data || []);
    } catch (err) {
      setError("No se pudieron cargar los alumnos de esta clase.");
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    cerrar();
    // Limpiar estados después de que cierre el modal (delay para la animación)
    setTimeout(() => {
      setAlumnos([]);
      setError(null);
    }, 300);
  };

  return (
    <ModernModal
      open={abierto}
      onClose={handleClose}
      title={`Alumnos de la clase: ${clase?.nombre || ''}`}
      icon={<Group />}
      maxWidth="lg"
      actions={
        <Button
          onClick={handleClose}
          className="modal-button-secondary"
        >
          Cerrar
        </Button>
      }
    >
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
          <Typography variant="body2" sx={{ mb: 1, color: "#495057" }}>
            <strong>Tipo:</strong> {clase.tipoClase}
          </Typography>
          <Typography variant="body2" sx={{ color: "#495057" }}>
            <strong>Total de alumnos:</strong> {alumnos.length}
          </Typography>
        </Box>
      )}

      {cargando ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress sx={{ color: "#DC143C" }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error}
        </Alert>
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
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    letterSpacing: "0.5px"
                  }}
                >
                  Cinta
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    letterSpacing: "0.5px"
                  }}
                >
                  Teléfono Tutor
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    letterSpacing: "0.5px"
                  }}
                  align="center"
                >
                  Perfil
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alumnos.map((alumno, index) => (
                <TableRow
                  key={alumno.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? "rgba(248, 249, 250, 0.5)" : "white",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(220, 20, 60, 0.05)",
                      transform: "scale(1.005)"
                    }
                  }}
                >
                  <TableCell sx={{ fontWeight: 500, color: "#333" }}>
                    {alumno.nombre} {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                  </TableCell>
                  <TableCell sx={{ color: "#666" }}>
                    {alumno.edad} años
                  </TableCell>
                  <TableCell>
                    <CintaChip nombreCinta={alumno.cintaActualNombre} />
                  </TableCell>
                  <TableCell sx={{ color: "#666", fontFamily: "monospace" }}>
                    {alumno.telefonoTutor}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => {
                        cerrar();
                        navigate(`/alumnos/${alumno.slug}/perfil`);
                      }}
                      sx={{
                        borderColor: "rgba(220, 20, 60, 0.3)",
                        color: "#DC143C",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "none",
                        borderRadius: "8px",
                        "&:hover": {
                          borderColor: "#DC143C",
                          backgroundColor: "rgba(220, 20, 60, 0.05)",
                        },
                      }}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </ModernModal>
  );
}
