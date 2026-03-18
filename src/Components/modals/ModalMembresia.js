/** @module components/modals/ModalMembresia */
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    FormControlLabel,
    Switch,
    InputAdornment,
} from "@mui/material";
import { CardMembership, Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import api from "../../services/api";
import ModernModal from "./ModernModal";
import { manejarErrorApi } from "../../utils/manejarErrorApi";

const esquema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre es obligatorio")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    tipoConcepto: yup.string().required("El tipo de concepto es obligatorio"),
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
 * Modal para crear o editar un concepto de pago (membresía).
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.cerrar - Callback para cerrar el modal.
 * @param {Function} props.recargar - Callback para recargar la lista de conceptos.
 * @param {"crear"|"editar"} [props.modo="crear"] - Modo del modal.
 * @param {object} [props.membresia] - Datos del concepto a editar (solo en modo editar).
 */
export default function ModalMembresia({ abierto, cerrar, recargar, modo = "crear", membresia }) {
    const esEditar = modo === "editar";
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
            activo: true,
        },
    });

    useEffect(() => {
        if (esEditar && membresia) {
            reset({
                nombre: membresia.nombre,
                tipoConcepto: membresia.tipoConcepto || "",
                precio: membresia.precio,
                descripcion: membresia.descripcion || "",
                activo: membresia.activo,
            });
        }
    }, [esEditar, membresia, reset]);

    const handleClose = () => {
        if (!guardando) {
            reset();
            cerrar();
        }
    };

    const onSubmit = async (data) => {
        setGuardando(true);
        try {
            const payload = {
                nombre: data.nombre,
                tipoConcepto: data.tipoConcepto,
                precio: data.precio,
                descripcion: data.descripcion || null,
                ...(esEditar && { slug: membresia.slug, activo: data.activo }),
            };

            if (esEditar) {
                await api.put(`/conceptos/${membresia.slug}`, payload);
                Swal.fire({
                    icon: "success",
                    title: "Concepto actualizado",
                    text: "Los datos se actualizaron exitosamente",
                    confirmButtonColor: "#d32f2f",
                });
            } else {
                await api.post("/conceptos", payload);
                Swal.fire({
                    icon: "success",
                    title: "Concepto creado",
                    text: "El concepto se ha registrado exitosamente",
                    confirmButtonColor: "#d32f2f",
                });
            }

            reset();
            cerrar();
            recargar();
        } catch (error) {
            manejarErrorApi(error, esEditar ? "actualizar el concepto" : "guardar el concepto");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <ModernModal
            open={abierto}
            onClose={handleClose}
            title={esEditar ? "Editar Concepto" : "Nuevo Concepto"}
            icon={esEditar ? <Edit /> : <CardMembership />}
            maxWidth="sm"
            formId="form-membresia"
            loading={guardando}
        >
            <form id="form-membresia" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    label="Nombre"
                    fullWidth
                    {...register("nombre")}
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                    margin="normal"
                    disabled={guardando}
                    autoFocus={!esEditar}
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
                        <FormHelperText>{errors.tipoConcepto?.message}</FormHelperText>
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
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
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

                {esEditar && (
                    <FormControlLabel
                        control={
                            <Controller
                                name="activo"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={guardando}
                                    />
                                )}
                            />
                        }
                        label="Activo"
                        sx={{ mt: 2 }}
                    />
                )}
            </form>
        </ModernModal>
    );
}
