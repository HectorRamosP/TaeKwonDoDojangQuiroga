/** @module components/modals/ModalTipoConcepto */
import {
    TextField,
    FormControlLabel,
    Switch,
} from "@mui/material";
import { Category, Edit } from "@mui/icons-material";
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
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),
    descripcion: yup
        .string()
        .max(300, "La descripción no puede exceder 300 caracteres")
        .nullable(),
    activo: yup.boolean(),
});

/**
 * Modal para crear o editar un tipo de concepto de cobro.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.cerrar - Callback para cerrar el modal.
 * @param {Function} props.recargar - Callback para recargar la lista de tipos.
 * @param {"crear"|"editar"} [props.modo="crear"] - Modo del modal.
 * @param {object} [props.tipo] - Datos del tipo a editar (solo en modo editar).
 */
export default function ModalTipoConcepto({
    abierto,
    cerrar,
    recargar,
    modo = "crear",
    tipo,
}) {
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
            descripcion: "",
            activo: true,
        },
    });

    useEffect(() => {
        if (esEditar && tipo) {
            reset({
                nombre: tipo.nombre,
                descripcion: tipo.descripcion || "",
                activo: tipo.activo,
            });
        } else if (!esEditar) {
            reset({
                nombre: "",
                descripcion: "",
                activo: true,
            });
        }
    }, [esEditar, tipo, reset, abierto]);

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
                nombre: data.nombre.trim(),
                descripcion: data.descripcion?.trim() || null,
                ...(esEditar && { id: tipo.id, activo: data.activo }),
            };

            if (esEditar) {
                await api.put(`/tipos-concepto/${tipo.id}`, payload);
                Swal.fire({
                    icon: "success",
                    title: "Tipo actualizado",
                    text: "El tipo de concepto se actualizó exitosamente",
                    confirmButtonColor: "#d32f2f",
                });
            } else {
                await api.post("/tipos-concepto", payload);
                Swal.fire({
                    icon: "success",
                    title: "Tipo creado",
                    text: "El tipo de concepto se registró exitosamente",
                    confirmButtonColor: "#d32f2f",
                });
            }

            reset();
            cerrar();
            recargar();
        } catch (error) {
            manejarErrorApi(
                error,
                esEditar ? "actualizar el tipo de concepto" : "crear el tipo de concepto"
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <ModernModal
            open={abierto}
            onClose={handleClose}
            title={esEditar ? "Editar Tipo de Concepto" : "Nuevo Tipo de Concepto"}
            icon={esEditar ? <Edit /> : <Category />}
            maxWidth="sm"
            formId="form-tipo-concepto"
            loading={guardando}
        >
            <form id="form-tipo-concepto" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    label="Nombre"
                    fullWidth
                    {...register("nombre")}
                    error={!!errors.nombre}
                    helperText={
                        errors.nombre?.message ||
                        "Nombre único del tipo (ej: Mensualidad, Equipo de Protección)"
                    }
                    margin="normal"
                    disabled={guardando}
                    autoFocus={!esEditar}
                    placeholder="Ej: Mensualidad, Examen, Uniforme..."
                    id="tipo-concepto-nombre"
                />

                <TextField
                    label="Descripción (opcional)"
                    fullWidth
                    multiline
                    rows={2}
                    {...register("descripcion")}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion?.message}
                    margin="normal"
                    disabled={guardando}
                    placeholder="Describe brevemente este tipo de concepto..."
                    id="tipo-concepto-descripcion"
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
                                        onChange={(e) =>
                                            field.onChange(e.target.checked)
                                        }
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
