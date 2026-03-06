/** @module components/modals/ModalCrearMembresia */
import {
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    CircularProgress,
    InputAdornment,
} from "@mui/material";
import { CardMembership } from "@mui/icons-material";
import { useState } from "react";
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
});

const tiposConcepto = [
    { valor: "Mensualidad", etiqueta: "Mensualidad" },
    { valor: "Inscripcion", etiqueta: "Inscripción" },
    { valor: "Examen", etiqueta: "Examen" },
    { valor: "Uniforme", etiqueta: "Uniforme" },
    { valor: "Otro", etiqueta: "Otro" },
];

/**
 * Modal para crear un nuevo concepto de pago (membresía) en el sistema.
 * Soporta tipos de concepto: Mensualidad, Inscripción, Examen, Uniforme y Otro.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.cerrar - Callback para cerrar el modal.
 * @param {Function} props.recargar - Callback para recargar la lista de conceptos tras crear uno.
 */
export default function ModalCrearMembresia({ abierto, cerrar, recargar }) {
    const [guardando, setGuardando] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(esquema),
        defaultValues: {
            nombre: "",
            tipoConcepto: "",
            precio: "",
            descripcion: "",
        },
    });

    const handleClose = () => {
        if (!guardando) {
            reset();
            cerrar();
        }
    };

    const onSubmit = async (data) => {
        setGuardando(true);

        try {
            // Preparar el payload
            const payload = {
                nombre: data.nombre,
                tipoConcepto: data.tipoConcepto,
                precio: data.precio,
                descripcion: data.descripcion || null,
            };

            await api.post("/conceptos", payload);

            Swal.fire({
                icon: "success",
                title: "Concepto creado",
                text: "El concepto se ha registrado exitosamente",
                confirmButtonColor: "#d32f2f",
            });

            reset();
            cerrar();
            recargar();
        } catch (error) {
            let mensajeError = "Ocurrió un error inesperado al guardar el concepto";
            let detalles = "";

            if (error.response) {
                if (error.response.status === 400) {
                    mensajeError = "Datos inválidos";
                    detalles = error.response.data?.message || "Verifica que toda la información esté correcta";
                } else if (error.response.status === 409) {
                    mensajeError = "Concepto duplicado";
                    detalles = "Ya existe un concepto con este nombre.";
                } else {
                    mensajeError = "Error del servidor";
                    detalles = "No se pudo guardar el concepto. Intenta nuevamente.";
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
            title="Nuevo Concepto"
            icon={<CardMembership />}
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
                        form="form-crear-concepto"
                        className="modal-button-primary"
                        disabled={guardando}
                        startIcon={guardando && <CircularProgress size={20} />}
                    >
                        {guardando ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            }
        >
            <form id="form-crear-concepto" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label="Nombre"
                        fullWidth
                        {...register("nombre")}
                        error={!!errors.nombre}
                        helperText={errors.nombre?.message}
                        margin="normal"
                        disabled={guardando}
                        autoFocus
                        placeholder="Ej: Mensualidad, Uniforme Completo, etc."
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
                        placeholder="Describe este concepto..."
                    />
            </form>
        </ModernModal>
    );
}
