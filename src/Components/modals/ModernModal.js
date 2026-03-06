/** @module components/modals/ModernModal */
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, Button, CircularProgress } from "@mui/material";
import { Close } from "@mui/icons-material";
import PropTypes from "prop-types";
import "./ModalsGlobal.css";

const estilos = {
  paper: {
    sx: {
      borderRadius: "20px",
      boxShadow: "0 24px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(220, 20, 60, 0.1)",
      overflow: "visible",
    },
  },
  backdrop: {
    sx: {
      backdropFilter: "blur(8px)",
      backgroundColor: "rgba(10, 10, 10, 0.7)",
    },
  },
  header: {
    background: "linear-gradient(135deg, #DC143C 0%, #B22222 50%, #8B0000 100%)",
    color: "white",
    padding: "24px 32px",
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
      animation: "modalPulse 4s ease-in-out infinite",
    },
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
  },
  titleText: {
    margin: 0,
    fontSize: "1.75rem",
    fontWeight: 800,
    letterSpacing: "-0.5px",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  },
};

/**
 * Modal moderno reutilizable con estilos consistentes del sistema.
 * Incluye encabezado con gradiente, botón de cierre, área de contenido
 * y footer de acciones configurable.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.open - Controla si el modal está visible.
 * @param {Function} props.onClose - Callback que se ejecuta al cerrar el modal.
 * @param {string} props.title - Título mostrado en el encabezado.
 * @param {React.ReactNode} [props.icon] - Ícono opcional en el encabezado.
 * @param {React.ReactNode} props.children - Contenido del cuerpo del modal.
 * @param {React.ReactNode} [props.actions] - Acciones personalizadas en el footer.
 * @param {string} [props.formId] - ID del formulario para submit automático.
 * @param {boolean} [props.loading=false] - Muestra estado de carga en el botón.
 * @param {string} [props.submitLabel="Guardar"] - Texto del botón de submit.
 * @param {string} [props.loadingLabel="Guardando..."] - Texto durante la carga.
 * @param {"xs"|"sm"|"md"|"lg"|"xl"} [props.maxWidth="sm"] - Ancho máximo del modal.
 * @param {boolean} [props.fullWidth=true] - Si el modal ocupa todo el ancho disponible.
 *
 * @example
 * <ModernModal
 *   open={abierto}
 *   onClose={() => setAbierto(false)}
 *   title="Crear Alumno"
 *   formId="form-crear-alumno"
 * >
 *   <FormularioAlumno />
 * </ModernModal>
 */
export default function ModernModal({
  open,
  onClose,
  title,
  icon,
  children,
  actions,
  formId,
  loading = false,
  submitLabel = "Guardar",
  loadingLabel = "Guardando...",
  maxWidth = "sm",
  fullWidth = true,
}) {
  const accionesRenderizadas = actions || (formId ? (
    <>
      <Button
        onClick={onClose}
        className="modal-button-secondary"
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form={formId}
        className="modal-button-primary"
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} />}
      >
        {loading ? loadingLabel : submitLabel}
      </Button>
    </>
  ) : null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      className="modal-modern"
      slotProps={{ paper: estilos.paper, backdrop: estilos.backdrop }}
    >
      <DialogTitle sx={estilos.header}>
        <Box sx={estilos.headerContent}>
          <Box sx={estilos.titleRow}>
            {icon && <Box sx={estilos.iconContainer}>{icon}</Box>}
            <Box component="h2" sx={estilos.titleText}>
              {title}
            </Box>
          </Box>

          <IconButton onClick={onClose} className="modal-close-button">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className="modal-content">
        {children}
      </DialogContent>

      {accionesRenderizadas && (
        <DialogActions className="modal-footer">
          {accionesRenderizadas}
        </DialogActions>
      )}
    </Dialog>
  );
}

ModernModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  formId: PropTypes.string,
  loading: PropTypes.bool,
  submitLabel: PropTypes.string,
  loadingLabel: PropTypes.string,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  fullWidth: PropTypes.bool,
};
