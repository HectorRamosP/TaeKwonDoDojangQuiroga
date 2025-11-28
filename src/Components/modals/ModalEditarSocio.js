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
    Box,
    Typography,
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
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    apellidoPaterno: yup
        .string()
        .required("El apellido paterno es obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(100, "El apellido no puede exceder 100 caracteres"),
    apellidoMaterno: yup
        .string()
        .required("El apellido materno es obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(100, "El apellido no puede exceder 100 caracteres"),
    curp: yup
        .string()
        .transform((value, originalValue) => {
            if (!originalValue || originalValue === "" || originalValue.trim() === "") return null;
            return originalValue;
        })
        .nullable()
        .notRequired()
        .test('curp-valido', 'Ingresa un CURP válido de 18 caracteres', function(value) {
            if (!value) return true; // CURP es opcional
            const valorLimpio = value.trim();
            if (valorLimpio === "") return true;
            return /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(valorLimpio) && valorLimpio.length === 18;
        }),
    enfermedades: yup
        .string()
        .nullable()
        .max(500, "El campo de enfermedades no puede exceder 500 caracteres"),
    fechaNacimiento: yup
        .date()
        .required("La fecha de nacimiento es obligatoria")
        .max(new Date(), "La fecha no puede ser futura"),
    direccion: yup.string().nullable(),
    sexo: yup.string().nullable(),
    nombreTutor: yup
        .string()
        .required("El nombre del tutor es obligatorio")
        .min(2, "El nombre del tutor debe tener al menos 2 caracteres")
        .max(200, "El nombre del tutor no puede exceder 200 caracteres"),
    telefonoTutor: yup
        .string()
        .required("El teléfono del tutor es obligatorio")
        .matches(/^[0-9]{10}$/, "Ingresa un teléfono válido de 10 dígitos"),
    emailTutor: yup
        .string()
        .required("El email del tutor es obligatorio")
        .email("Ingresa un email válido")
        .max(150, "El email no puede exceder 150 caracteres"),
    cintaActualId: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
    claseId: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
    conceptoMensualidadId: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
    activo: yup.boolean(),
});

export default function ModalEditarSocio({ abierto, cerrar, recargar, socio }) {
    const [guardando, setGuardando] = useState(false);
    const [cintas, setCintas] = useState([]);
    const [clases, setClases] = useState([]);
    const [conceptos, setConceptos] = useState([]);

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
        if (abierto) {
            cargarDatos();
        }
    }, [abierto]);

    useEffect(() => {
        if (socio && cintas.length > 0 && clases.length > 0 && conceptos.length > 0) {
            // Convertir fecha a formato YYYY-MM-DD para el input
            const fechaFormateada = socio.fechaNacimiento
                ? new Date(socio.fechaNacimiento).toISOString().split("T")[0]
                : "";

            reset({
                nombre: socio.nombre || "",
                apellidoPaterno: socio.apellidoPaterno || "",
                apellidoMaterno: socio.apellidoMaterno || "",
                curp: socio.curp || "",
                enfermedades: socio.enfermedades || "",
                fechaNacimiento: fechaFormateada,
                direccion: socio.direccion || "",
                sexo: socio.sexo || "",
                nombreTutor: socio.nombreTutor || "",
                telefonoTutor: socio.telefonoTutor || "",
                emailTutor: socio.emailTutor || "",
                cintaActualId: socio.cintaActualId || "",
                claseId: socio.claseId || "",
                conceptoMensualidadId: socio.conceptoMensualidadId || "",
                activo: socio.activo ?? true,
            });
        }
    }, [socio, cintas, clases, conceptos, reset]);

    const cargarDatos = async () => {
        try {
            const [resCintas, resClases, resConceptos] = await Promise.all([
                api.get("/cintas?activo=true"),
                api.get("/clases?activo=true"),
                api.get("/conceptos?activo=true&tipoConcepto=Mensualidad"),
            ]);

            // Ordenar cintas por jerarquía (orden)
            const cintasOrdenadas = (resCintas.data || []).sort((a, b) => a.orden - b.orden);

            setCintas(cintasOrdenadas);
            setClases(resClases.data || []);
            setConceptos(resConceptos.data || []);
        } catch (error) {
            // Error al cargar datos
        }
    };

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
                ...data,
                slug: socio.slug,
                curp: data.curp ? data.curp.toUpperCase() : null,
                enfermedades: data.enfermedades?.trim() || "No",
                cintaActualId: data.cintaActualId || null,
                claseId: data.claseId || null,
                conceptoMensualidadId: data.conceptoMensualidadId || null,
                direccion: data.direccion || null,
                sexo: data.sexo || null,
            };

            await api.put(`/alumnos/${socio.slug}`, payload);

            Swal.fire({
                icon: "success",
                title: "Alumno actualizado",
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
                    detalles = error.response.data?.message || "Verifica que todos los datos sean correctos";
                } else if (error.response.status === 404) {
                    mensajeError = "Alumno no encontrado";
                    detalles = "El alumno que intentas editar no existe";
                } else {
                    mensajeError = "Error del servidor";
                    detalles = "No se pudo actualizar el alumno. Intenta nuevamente.";
                }
            } else if (error.request) {
                mensajeError = "Sin conexión";
                detalles =
                    "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
            }

            // Cerrar modal primero
            setGuardando(false);
            reset();
            cerrar();

            // Mostrar error después de cerrar
            setTimeout(() => {
                Swal.fire({
                    icon: "error",
                    title: mensajeError,
                    text: detalles,
                    confirmButtonColor: "#d32f2f",
                });
            }, 300);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <ModernModal
            open={abierto}
            onClose={handleClose}
            title="Editar Alumno"
            icon={<Edit />}
            maxWidth="md"
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
                        form="form-editar-socio"
                        className="modal-button-primary"
                        disabled={guardando}
                        startIcon={guardando && <CircularProgress size={20} />}
                    >
                        {guardando ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            }
        >
            <form id="form-editar-socio" onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "#666", fontWeight: "bold" }}>
                    Datos del Alumno
                </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                            label="Nombre"
                            fullWidth
                            {...register("nombre")}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Apellido Paterno"
                            fullWidth
                            {...register("apellidoPaterno")}
                            error={!!errors.apellidoPaterno}
                            helperText={errors.apellidoPaterno?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Apellido Materno"
                            fullWidth
                            {...register("apellidoMaterno")}
                            error={!!errors.apellidoMaterno}
                            helperText={errors.apellidoMaterno?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Fecha de Nacimiento"
                            type="date"
                            fullWidth
                            {...register("fechaNacimiento")}
                            error={!!errors.fechaNacimiento}
                            helperText={errors.fechaNacimiento?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <FormControl fullWidth disabled={guardando}>
                            <InputLabel>Sexo</InputLabel>
                            <Controller
                                name="sexo"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Sexo">
                                        <MenuItem value="">
                                            <em>Seleccionar</em>
                                        </MenuItem>
                                        <MenuItem value="Masculino">Masculino</MenuItem>
                                        <MenuItem value="Femenino">Femenino</MenuItem>
                                    </Select>
                                )}
                            />
                        </FormControl>
                        <TextField
                            label="Dirección"
                            fullWidth
                            {...register("direccion")}
                            error={!!errors.direccion}
                            helperText={errors.direccion?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="CURP (18 caracteres) - Opcional"
                            fullWidth
                            {...register("curp")}
                            error={!!errors.curp}
                            helperText={errors.curp?.message || "Deja en blanco si no tienes el CURP"}
                            disabled={guardando}
                            inputProps={{ maxLength: 18, style: { textTransform: 'uppercase' } }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            placeholder="Opcional"
                        />
                        <TextField
                            label="Enfermedades (Opcional)"
                            fullWidth
                            multiline
                            rows={2}
                            {...register("enfermedades")}
                            error={!!errors.enfermedades}
                            helperText={errors.enfermedades?.message || "Deja en blanco si no tiene enfermedades"}
                            disabled={guardando}
                            placeholder="Ej: Asma, Diabetes, etc."
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, color: "#666", fontWeight: "bold" }}>
                        Datos del Tutor Responsable
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                            label="Nombre del Tutor"
                            fullWidth
                            {...register("nombreTutor")}
                            error={!!errors.nombreTutor}
                            helperText={errors.nombreTutor?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Teléfono del Tutor (10 dígitos)"
                            fullWidth
                            {...register("telefonoTutor")}
                            error={!!errors.telefonoTutor}
                            helperText={errors.telefonoTutor?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Email del Tutor"
                            type="email"
                            fullWidth
                            {...register("emailTutor")}
                            error={!!errors.emailTutor}
                            helperText={errors.emailTutor?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{ gridColumn: "span 2" }}
                        />
                    </Box>

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, color: "#666", fontWeight: "bold" }}>
                        Información de Entrenamiento
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <FormControl fullWidth disabled={guardando}>
                            <InputLabel>Cinta Actual</InputLabel>
                            <Controller
                                name="cintaActualId"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Cinta Actual" value={field.value || ""}>
                                        <MenuItem value="">
                                            <em>Sin cinta asignada</em>
                                        </MenuItem>
                                        {cintas.map((cinta) => (
                                            <MenuItem key={cinta.id} value={cinta.id}>
                                                {cinta.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                        <FormControl fullWidth disabled={guardando}>
                            <InputLabel>Clase/Horario</InputLabel>
                            <Controller
                                name="claseId"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Clase/Horario" value={field.value || ""}>
                                        <MenuItem value="">
                                            <em>Sin clase asignada</em>
                                        </MenuItem>
                                        {clases.map((clase) => (
                                            <MenuItem key={clase.id} value={clase.id}>
                                                {clase.nombre} - {clase.dias}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                        <FormControl fullWidth disabled={guardando} sx={{ gridColumn: "span 2" }}>
                            <InputLabel>Mensualidad Contratada</InputLabel>
                            <Controller
                                name="conceptoMensualidadId"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Mensualidad Contratada" value={field.value || ""}>
                                        <MenuItem value="">
                                            <em>Sin mensualidad</em>
                                        </MenuItem>
                                        {conceptos.map((concepto) => (
                                            <MenuItem key={concepto.id} value={concepto.id}>
                                                {concepto.nombre} - ${concepto.precio}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                    </Box>

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
            </form>
        </ModernModal>
    );
}
