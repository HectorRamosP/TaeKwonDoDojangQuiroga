/** @module components/modals/ModalEditarMembresia */
import {
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    FormControlLabel,
    Switch,
    CircularProgress,
    InputAdornment,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import api from "../../services/api";
import ModernModal from "./ModernModal";

const esquema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre es obligatorio")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    tipoConcepto: yup
        .string()
        .required("El tipo de concepto es obligatorio"),
    precio: yup
        .number()
        .required("El precio es obligatorio")
        .min(0, "El precio debe ser mayor o igual a 0")
        .max(999999, "El precio es demasiado alto"),
    descripcion: yup
        .string()
        .max(500, "La descripción no puede exceder 500 caracteres")
        .nullable(),
    activo: yup.boolean(),
});

const tiposConcepto = [
    { valor: "Mensualidad", etiqueta: "Mensualidad" },
    { valor: "Inscripcion", etiqueta: "Inscripción" },
    { valor: "Examen", etiqueta: "Examen" },
    { valor: "Uniforme", etiqueta: "Uniforme" },
    { valor: "Otro", etiqueta: "Otro" },
];

/**
 * Modal para editar los datos de un concepto de pago (membresía) existente.
 * Pre-carga los datos actuales del concepto y permite modificar nombre, tipo, precio y estado.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.cerrar - Callback para cerrar el modal.
 * @param {Function} props.recargar - Callback para recargar la lista de conceptos tras editar.
 * @param {object} props.membresia - Datos actuales del concepto a editar.
 */
export default function ModalEditarMembresia({ abierto, cerrar, recargar, membresia }) {
    const [guardando, setGuardando] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(esquema),
    });

    useEffect(() => {
        if (membresia) {
            reset({
                nombre: membresia.nombre,
                tipoConcepto: membresia.tipoConcepto || "",
                precio: membresia.precio,
                descripcion: membresia.descripcion || "",
                activo: membresia.activo,
            });
        }
    }, [membresia, reset]);

    const handleClose = () => {
        if (!guardando) {
            reset();
            cerrar();
        }
    };

    const onSubmit = async (data) => {
        setGuardando(true);

        try {
            // Incluir el slug en el body de la petición
            const payload = {
                slug: membresia.slug,
                nombre: data.nombre,
                tipoConcepto: data.tipoConcepto,
                precio: data.precio,
                descripcion: data.descripcion || null,
                activo: data.activo,
            };

            await api.put(`/conceptos/${membresia.slug}`, payload);

            Swal.fire({
                icon: "success",
                title: "Concepto actualizado",
                text: "Los datos se actualizaron exitosamente",
                confirmButtonColor: "#d32f2f",
            });

            reset();
            cerrar();
            recargar();
        } catch (error) {
            let mensajeError = "Ocurrió un error inesperado";
            let detalles = "";

            if (error.response) {
                if (error.response.status === 400) {
                    mensajeError = "Datos inválidos";
                    detalles = error.response.data?.message || "Verifica que toda la información esté correcta";
                } else if (error.response.status === 404) {
                    mensajeError = "Concepto no encontrado";
                    detalles = "El concepto que intentas editar no existe";
                } else {
                    mensajeError = "Error del servidor";
                    detalles = "No se pudo actualizar el concepto. Intenta nuevamente.";
                }
            } else if (error.request) {
                mensajeError = "Sin conexión";
                detalles =
                    "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
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
            title="Editar Concepto"
            icon={<Edit />}
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
                        form="form-editar-concepto"
                        className="modal-button-primary"
                        disabled={guardando}
                        startIcon={guardando && <CircularProgress size={20} />}
                    >
                        {guardando ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            }
        >
            <form id="form-editar-concepto" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label="Nombre"
                        fullWidth
                        {...register("nombre")}
                        error={!!errors.nombre}
                        helperText={errors.nombre?.message}
                        margin="normal"
                        disabled={guardando}
                    />

                    <FormControl
                        fullWidth
                        margin="normal"
                        error={!!errors.tipoConcepto}
                        disabled={guardando}
                    >
                        <InputLabel>Tipo de Concepto</InputLabel>
                        <Controller
                            name="tipoConcepto"
                            control={control}
                            render={({ field }) => (
                                <Select {...field} label="Tipo de Concepto">
                                    <MenuItem value="">
                                        <em>Selecciona un tipo</em>
                                    </MenuItem>
                                    {tiposConcepto.map((tipo) => (
                                        <MenuItem key={tipo.valor} value={tipo.valor}>
                                            {tipo.etiqueta}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.tipoConcepto && (
                            <FormHelperText>
                                {errors.tipoConcepto?.message}
                            </FormHelperText>
                        )}
                    </FormControl>

                    <TextField
                        label="Precio"
                        type="number"
                        fullWidth
                        {...register("precio")}
                        error={!!errors.precio}
                        helperText={errors.precio?.message}
                        margin="normal"
                        disabled={guardando}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">$</InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Descripción (opcional)"
                        fullWidth
                        multiline
                        rows={3}
                        {...register("descripcion")}
                        error={!!errors.descripcion}
                        helperText={errors.descripcion?.message}
                        margin="normal"
                        disabled={guardando}
                    />
                    <FormControlLabel
                        control={<Controller name="activo" control={control} render={({ field }) => <Switch {...field} checked={field.value} disabled={guardando} />} />}
                        label="Activo"
                        sx={{ mt: 2 }}
                    />
            </form>
        </ModernModal>
    );
}
