/** @module components/modals/ModalUsuario */
import {
    TextField,
    FormControlLabel,
    Switch,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, PersonAdd, Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import api from "../../services/api";
import ModernModal from "./ModernModal";
import { manejarErrorApi } from "../../utils/manejarErrorApi";

const esquemaCrear = yup.object().shape({
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

const esquemaEditar = yup.object().shape({
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
        .nullable()
        .test("password-strength", "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número", function (value) {
            if (!value || value === "") return true;
            if (value.length < 8) return false;
            if (!/[A-Z]/.test(value)) return false;
            if (!/[a-z]/.test(value)) return false;
            if (!/[0-9]/.test(value)) return false;
            return true;
        }),
    habilitado: yup.boolean().default(true),
});

/**
 * Modal para crear o editar un usuario del sistema.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.cerrar - Callback para cerrar el modal.
 * @param {Function} props.recargar - Callback para recargar la lista de usuarios.
 * @param {"crear"|"editar"} [props.modo="crear"] - Modo del modal.
 * @param {object} [props.usuario] - Datos del usuario a editar (solo en modo editar).
 */
export default function ModalUsuario({ abierto, cerrar, recargar, modo = "crear", usuario }) {
    const esEditar = modo === "editar";
    const [guardando, setGuardando] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(esEditar ? esquemaEditar : esquemaCrear),
        defaultValues: {
            nombre: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            nombreUsuario: "",
            contraseña: "",
            habilitado: true,
        },
    });

    useEffect(() => {
        if (esEditar && usuario) {
            reset({
                nombre: usuario.nombre || "",
                apellidoPaterno: usuario.apellidoPaterno || "",
                apellidoMaterno: usuario.apellidoMaterno || "",
                nombreUsuario: usuario.nombreUsuario || "",
                contraseña: "",
                habilitado: usuario.habilitado ?? true,
            });
        }
    }, [esEditar, usuario, reset]);

    const handleClose = () => {
        if (!guardando) {
            reset();
            setMostrarPassword(false);
            cerrar();
        }
    };

    const onSubmit = async (data) => {
        setGuardando(true);
        try {
            if (esEditar) {
                await api.put(`/usuarios/${usuario.slug}`, {
                    slug: usuario.slug,
                    nombre: data.nombre,
                    apellidoPaterno: data.apellidoPaterno,
                    apellidoMaterno: data.apellidoMaterno,
                    nombreUsuario: data.nombreUsuario,
                    contraseña: data.contraseña || "",
                    habilitado: data.habilitado,
                });
                Swal.fire({
                    icon: "success",
                    title: "Usuario actualizado",
                    text: "El usuario ha sido actualizado correctamente",
                    confirmButtonColor: "#d32f2f",
                    timer: 2000,
                    timerProgressBar: true,
                });
            } else {
                await api.post("/usuarios", data);
                Swal.fire({
                    icon: "success",
                    title: "Usuario creado",
                    text: "El usuario ha sido creado correctamente",
                    confirmButtonColor: "#d32f2f",
                    timer: 2000,
                    timerProgressBar: true,
                });
            }

            reset();
            cerrar();
            recargar();
        } catch (error) {
            manejarErrorApi(error, esEditar ? "actualizar el usuario" : "guardar el usuario");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <ModernModal
            open={abierto}
            onClose={handleClose}
            title={esEditar ? "Editar Usuario" : "Nuevo Usuario"}
            icon={esEditar ? <Edit /> : <PersonAdd />}
            maxWidth="sm"
            formId="form-usuario"
            loading={guardando}
        >
            <form id="form-usuario" onSubmit={handleSubmit(onSubmit)}>
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
                    label={esEditar ? "Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
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
                    control={
                        <Switch
                            {...register("habilitado")}
                            checked={watch("habilitado")}
                            disabled={guardando}
                        />
                    }
                    label="Habilitado"
                    sx={{ mt: 1 }}
                />
            </form>
        </ModernModal>
    );
}
