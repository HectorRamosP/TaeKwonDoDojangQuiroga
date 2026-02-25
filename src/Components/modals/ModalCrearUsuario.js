import {
    Button,
    TextField,
    FormControlLabel,
    Switch,
    CircularProgress,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, PersonAdd } from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import api from "../../services/api";
import ModernModal from "./ModernModal";

const esquema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),
    apellidoPaterno: yup
        .string()
        .required("El apellido paterno es obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres"),
    apellidoMaterno: yup
        .string()
        .required("El apellido materno es obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres"),
    nombreUsuario: yup
        .string()
        .required("El usuario es obligatorio")
        .min(4, "El usuario debe tener al menos 4 caracteres")
        .max(20, "El usuario no puede exceder 20 caracteres")
        .matches(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guión bajo"),
    contraseña: yup
        .string()
        .required("La contraseña es obligatoria")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
        .matches(/[a-z]/, "Debe contener al menos una minúscula")
        .matches(/[0-9]/, "Debe contener al menos un número"),
    habilitado: yup.boolean().default(true),
});

/**
 * Modal para crear un nuevo usuario del sistema con credenciales de acceso.
 * Valida fortaleza de contraseña: mínimo 8 caracteres, mayúscula, minúscula y número.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.onClose - Callback para cerrar el modal.
 * @param {Function} props.onGuardado - Callback ejecutado tras crear el usuario exitosamente.
 */
export default function ModalCrearUsuario({ abierto, onClose, onGuardado }) {
    const [guardando, setGuardando] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(esquema),
        defaultValues: {
            nombre: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            nombreUsuario: "",
            contraseña: "",
            habilitado: true,
        },
    });

    const handleClose = () => {
        if (!guardando) {
            reset();
            onClose();
        }
    };

    const onSubmit = async (data) => {
        setGuardando(true);

        try {
            await api.post("/usuarios", data);
            reset();
            onClose();
            onGuardado();
        } catch (error) {
            let mensajeError = "Ocurrió un error inesperado al guardar el usuario";
            let detalles = "";
            
            if (error.response) {
                if (error.response.status === 400) {
                    mensajeError = "Datos inválidos";
                    detalles = "Verifica que toda la información esté correcta";
                } else if (error.response.status === 409) {
                    mensajeError = "Usuario duplicado";
                    detalles = "El nombre de usuario ya existe. Por favor elige otro.";
                } else {
                    mensajeError = "Error del servidor";
                    detalles = "No se pudo guardar el usuario. Intenta nuevamente.";
                }
            } else if (error.request) {
                mensajeError = "Sin conexión";
                detalles = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
            }
            
            Swal.fire({
                icon: "error",
                title: mensajeError,
                text: detalles,
                confirmButtonColor: "#d32f2f",
            });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <ModernModal
            open={abierto}
            onClose={handleClose}
            title="Nuevo Usuario"
            icon={<PersonAdd />}
            maxWidth="sm"
            actions={
                <>
                    <Button
                        onClick={handleClose}
                        className="modal-button-secondary"
                        disabled={guardando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="form-crear-usuario"
                        className="modal-button-primary"
                        disabled={guardando}
                        startIcon={guardando && <CircularProgress size={20} />}
                    >
                        {guardando ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            }
        >
            <form id="form-crear-usuario" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label="Nombre"
                        fullWidth
                        {...register("nombre")}
                        error={!!errors.nombre}
                        helperText={errors.nombre?.message}
                        margin="normal"
                        disabled={guardando}
                        autoFocus
                    />
                    <TextField
                        label="Apellido Paterno"
                        fullWidth
                        {...register("apellidoPaterno")}
                        error={!!errors.apellidoPaterno}
                        helperText={errors.apellidoPaterno?.message}
                        margin="normal"
                        disabled={guardando}
                    />
                    <TextField
                        label="Apellido Materno"
                        fullWidth
                        {...register("apellidoMaterno")}
                        error={!!errors.apellidoMaterno}
                        helperText={errors.apellidoMaterno?.message}
                        margin="normal"
                        disabled={guardando}
                    />
                    <TextField
                        label="Usuario"
                        fullWidth
                        {...register("nombreUsuario")}
                        error={!!errors.nombreUsuario}
                        helperText={errors.nombreUsuario?.message}
                        margin="normal"
                        disabled={guardando}
                    />
                    <TextField
                        label="Contraseña"
                        fullWidth
                        type={mostrarPassword ? "text" : "password"}
                        {...register("contraseña")}
                        error={!!errors.contraseña}
                        helperText={errors.contraseña?.message}
                        margin="normal"
                        disabled={guardando}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setMostrarPassword(!mostrarPassword)}
                                        edge="end"
                                        disabled={guardando}
                                    >
                                        {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControlLabel
                        control={<Switch {...register("habilitado")} defaultChecked disabled={guardando} />}
                        label="Habilitado"
                        sx={{ mt: 1 }}
                    />
            </form>
        </ModernModal>
    );
}